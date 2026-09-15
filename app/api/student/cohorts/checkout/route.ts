import { NextResponse } from "next/server"
import { isNextResponse, requireStudent } from "@/lib/api-auth"
import { bootcampTracks } from "@/lib/bootcamp"
import {
  buildInstallmentSchedule,
  isCouponValid,
  quoteCheckout,
} from "@/lib/cohort-pricing"
import { db } from "@/lib/db"
import { appOrigin, initializePaystack } from "@/lib/paystack"

type Body = {
  cohortId?: string
  mode?: "full" | "installment"
  couponCode?: string
  track?: string
}

export async function POST(request: Request) {
  const auth = await requireStudent()
  if (isNextResponse(auth)) return auth

  const body = (await request.json()) as Body
  const cohortId = String(body.cohortId ?? "").trim()
  const mode = body.mode === "installment" ? "installment" : "full"
  const couponCodeRaw = String(body.couponCode ?? "").trim().toUpperCase()

  if (!cohortId) {
    return NextResponse.json({ error: "Cohort is required." }, { status: 400 })
  }

  const user = await db.user.findUnique({
    where: { id: auth.userId },
    select: { id: true, email: true, name: true, track: true },
  })
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 })
  }

  const cohort = await db.cohort.findUnique({ where: { id: cohortId } })
  if (!cohort || cohort.status !== "active") {
    return NextResponse.json({ error: "Cohort not found." }, { status: 404 })
  }

  if (mode === "installment" && !cohort.installmentEnabled) {
    return NextResponse.json(
      { error: "Installments are not enabled for this cohort." },
      { status: 400 },
    )
  }

  const scholarship = await db.scholarshipApplication.findFirst({
    where: {
      cohortId,
      email: user.email,
      status: "awarded",
    },
    orderBy: { createdAt: "desc" },
  })

  const track = String(
    body.track ?? scholarship?.track ?? user.track ?? "",
  ).trim()
  if (!track || !(track in bootcampTracks) || !cohort.tracks.includes(track)) {
    return NextResponse.json(
      { error: "Pick a valid track for this cohort." },
      { status: 400 },
    )
  }

  let couponPercentOff: number | null = null
  let couponCode: string | null = null

  if (scholarship) {
    // Scholarship auto-applies; coupons are ignored for remnant pricing.
  } else if (couponCodeRaw) {
    const coupon = await db.coupon.findUnique({ where: { code: couponCodeRaw } })
    if (!coupon) {
      return NextResponse.json({ error: "Invalid coupon code." }, { status: 400 })
    }
    if (coupon.cohortId && coupon.cohortId !== cohortId) {
      return NextResponse.json(
        { error: "This coupon does not apply to this cohort." },
        { status: 400 },
      )
    }
    const validity = isCouponValid({
      isActive: coupon.isActive,
      expiresAt: coupon.expiresAt,
      maxUses: coupon.maxUses,
      usedCount: coupon.usedCount,
    })
    if (!validity.ok) {
      return NextResponse.json(
        { error: `Coupon is ${validity.reason}.` },
        { status: 400 },
      )
    }
    couponPercentOff = coupon.percentOff
    couponCode = coupon.code
  }

  const quote = quoteCheckout({
    priceKobo: cohort.priceKobo,
    mode,
    scholarshipPercentOff: scholarship?.percentOff ?? null,
    couponPercentOff,
    installmentPercents: cohort.installmentPercents,
  })

  if (quote.dueNowKobo <= 0) {
    return NextResponse.json(
      { error: "Nothing due for this checkout." },
      { status: 400 },
    )
  }

  const paymentType = scholarship
    ? "scholarship"
    : mode === "installment"
      ? "installment"
      : "full"

  const existingEnrollment = await db.cohortEnrollment.findUnique({
    where: {
      userId_cohortId: { userId: user.id, cohortId },
    },
    include: { installments: true },
  })

  if (
    existingEnrollment &&
    existingEnrollment.status === "active" &&
    existingEnrollment.amountPaidKobo >= existingEnrollment.totalDueKobo &&
    existingEnrollment.totalDueKobo > 0
  ) {
    return NextResponse.json({
      ok: true,
      alreadyPaid: true,
      message: "You already have full paid access for this cohort.",
    })
  }

  // Paying a subsequent installment on an existing enrollment
  const canContinueInstallments =
    existingEnrollment &&
    existingEnrollment.status === "active" &&
    mode === "installment" &&
    existingEnrollment.installments.length > 0 &&
    existingEnrollment.amountPaidKobo > 0

  if (canContinueInstallments && existingEnrollment) {
    const nextPart = existingEnrollment.installments.find(
      (part) => part.status === "pending" || part.status === "overdue",
    )
    if (!nextPart) {
      return NextResponse.json({
        ok: true,
        alreadyPaid: true,
        message: "All installments are paid.",
      })
    }

    const kind =
      existingEnrollment.paymentType === "scholarship"
        ? "scholarship_remnant"
        : "cohort_installment"
    const reference = `inst_${cohortId.slice(-6)}_${user.id.slice(-6)}_${Date.now()}`
    await db.payment.create({
      data: {
        userId: user.id,
        cohortId,
        enrollmentId: existingEnrollment.id,
        installmentId: nextPart.id,
        kind,
        amount: nextPart.amountKobo,
        currency: "NGN",
        paystackReference: reference,
        status: "pending",
        couponCode: existingEnrollment.couponCode,
      },
    })

    const init = await initializePaystack({
      email: user.email,
      amountKobo: nextPart.amountKobo,
      reference,
      callbackUrl: `${appOrigin()}/dashboard?paid=1&ref=${encodeURIComponent(reference)}`,
      metadata: {
        userId: user.id,
        cohortId,
        enrollmentId: existingEnrollment.id,
        installmentId: nextPart.id,
        kind,
      },
    })
    if (!init.ok) {
      await db.payment.update({
        where: { paystackReference: reference },
        data: { status: "failed" },
      })
      return NextResponse.json({ error: init.error }, { status: init.status })
    }

    return NextResponse.json({
      ok: true,
      authorizationUrl: init.authorizationUrl,
      reference: init.reference,
      amount: nextPart.amountKobo,
      kind,
    })
  }

  const enrollment = await db.cohortEnrollment.upsert({
    where: {
      userId_cohortId: { userId: user.id, cohortId },
    },
    create: {
      userId: user.id,
      cohortId,
      track,
      paymentType,
      status: "active",
      scholarshipApplicationId: scholarship?.id ?? null,
      couponCode,
      totalDueKobo: quote.totalDueKobo,
      amountPaidKobo: 0,
    },
    update: {
      track,
      paymentType,
      status: "active",
      scholarshipApplicationId: scholarship?.id ?? null,
      couponCode,
      totalDueKobo: quote.totalDueKobo,
    },
  })

  if (user.track !== track) {
    await db.user.update({
      where: { id: user.id },
      data: { track },
    })
  }

  let installmentId: string | null = null
  if (mode === "installment") {
    await db.installmentSchedule.deleteMany({
      where: {
        enrollmentId: enrollment.id,
        status: { in: ["pending", "overdue", "waived"] },
      },
    })
    const schedule = buildInstallmentSchedule({
      priceKobo: quote.totalDueKobo,
      percents: cohort.installmentPercents,
      startDate: new Date(),
      intervalDays: cohort.installmentIntervalDays,
    })
    const created = await Promise.all(
      schedule.map((part) =>
        db.installmentSchedule.create({
          data: {
            enrollmentId: enrollment.id,
            index: part.index,
            percent: part.percent,
            amountKobo: part.amountKobo,
            dueAt: part.dueAt,
            status: "pending",
          },
        }),
      ),
    )
    installmentId = created[0]?.id ?? null
  }

  const kind = scholarship
    ? "scholarship_remnant"
    : mode === "installment"
      ? "cohort_installment"
      : "cohort_full"

  const reference = `coh_${kind.slice(0, 4)}_${cohortId.slice(-6)}_${user.id.slice(-6)}_${Date.now()}`

  await db.payment.create({
    data: {
      userId: user.id,
      cohortId,
      enrollmentId: enrollment.id,
      installmentId,
      kind,
      amount: quote.dueNowKobo,
      currency: "NGN",
      paystackReference: reference,
      status: "pending",
      couponCode,
    },
  })

  const init = await initializePaystack({
    email: user.email,
    amountKobo: quote.dueNowKobo,
    reference,
    callbackUrl: `${appOrigin()}/dashboard?paid=1&ref=${encodeURIComponent(reference)}`,
    metadata: {
      userId: user.id,
      cohortId,
      enrollmentId: enrollment.id,
      installmentId,
      kind,
      scholarshipId: scholarship?.id ?? null,
    },
  })

  if (!init.ok) {
    await db.payment.update({
      where: { paystackReference: reference },
      data: { status: "failed" },
    })
    return NextResponse.json({ error: init.error }, { status: init.status })
  }

  return NextResponse.json({
    ok: true,
    authorizationUrl: init.authorizationUrl,
    reference: init.reference,
    amount: quote.dueNowKobo,
    totalDueKobo: quote.totalDueKobo,
    listPriceKobo: quote.listPriceKobo,
    kind,
    scholarshipPercentOff: quote.scholarshipPercentOff,
    couponPercentOff: quote.couponPercentOff,
  })
}
