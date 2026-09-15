import { NextResponse } from "next/server"
import { bootcampTracks } from "@/lib/bootcamp"
import { amountAfterPercentOff } from "@/lib/cohort-pricing"
import { db } from "@/lib/db"
import { sendScholarshipAwardEmail } from "@/lib/payment-emails"
import {
  AGE_RANGES,
  COUNTRIES,
  DAILY_HOURS,
  EDUCATION_LEVELS,
  GENDERS,
  REFERRAL_SOURCES,
  YES_NO,
} from "@/lib/scholarship-options"

function optionValues(
  options: ReadonlyArray<{ value: string } | string>,
): Set<string> {
  return new Set(
    options.map((item) => (typeof item === "string" ? item : item.value)),
  )
}

type Body = {
  cohortId?: string
  fullName?: string
  email?: string
  ageRange?: string
  gender?: string
  whatsapp?: string
  country?: string
  education?: string
  referralSource?: string
  track?: string
  laptop?: string
  internet?: string
  dailyHours?: string
  onlineBefore?: string
  careerGoals?: string
  consentAccepted?: boolean
}

export async function POST(request: Request) {
  const body = (await request.json()) as Body
  const cohortId = String(body.cohortId ?? "").trim()
  const fullName = String(body.fullName ?? "").trim()
  const email = String(body.email ?? "").trim().toLowerCase()
  const ageRange = String(body.ageRange ?? "").trim()
  const gender = String(body.gender ?? "").trim()
  const whatsapp = String(body.whatsapp ?? "").trim()
  const country = String(body.country ?? "").trim()
  const education = String(body.education ?? "").trim()
  const referralSource = String(body.referralSource ?? "").trim()
  const track = String(body.track ?? "").trim()
  const laptop = String(body.laptop ?? "").trim()
  const internet = String(body.internet ?? "").trim()
  const dailyHours = String(body.dailyHours ?? "").trim()
  const onlineBefore = String(body.onlineBefore ?? "").trim()
  const careerGoals = String(body.careerGoals ?? "").trim()
  const consentAccepted = Boolean(body.consentAccepted)

  if (!cohortId) {
    return NextResponse.json({ error: "Cohort is required." }, { status: 400 })
  }
  if (fullName.length < 2) {
    return NextResponse.json({ error: "Enter your full name." }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 })
  }
  if (!optionValues(AGE_RANGES).has(ageRange)) {
    return NextResponse.json({ error: "Select a valid age range." }, { status: 400 })
  }
  if (!optionValues(GENDERS).has(gender)) {
    return NextResponse.json({ error: "Select a valid gender." }, { status: 400 })
  }
  if (whatsapp.length < 7) {
    return NextResponse.json({ error: "Enter a valid WhatsApp number." }, { status: 400 })
  }
  if (!optionValues(COUNTRIES).has(country)) {
    return NextResponse.json({ error: "Select a valid country." }, { status: 400 })
  }
  if (!optionValues(EDUCATION_LEVELS).has(education)) {
    return NextResponse.json({ error: "Select education level." }, { status: 400 })
  }
  if (!optionValues(REFERRAL_SOURCES).has(referralSource)) {
    return NextResponse.json({ error: "Select how you heard about us." }, { status: 400 })
  }
  if (!(track in bootcampTracks)) {
    return NextResponse.json({ error: "Select a valid track." }, { status: 400 })
  }
  if (!optionValues(YES_NO).has(laptop)) {
    return NextResponse.json({ error: "Indicate laptop access." }, { status: 400 })
  }
  if (!optionValues(YES_NO).has(internet)) {
    return NextResponse.json({ error: "Indicate internet access." }, { status: 400 })
  }
  if (!optionValues(DAILY_HOURS).has(dailyHours)) {
    return NextResponse.json({ error: "Select daily study hours." }, { status: 400 })
  }
  if (!optionValues(YES_NO).has(onlineBefore)) {
    return NextResponse.json(
      { error: "Indicate prior online learning experience." },
      { status: 400 },
    )
  }
  if (careerGoals.length < 10) {
    return NextResponse.json(
      { error: "Tell us a bit more about your career goals." },
      { status: 400 },
    )
  }
  if (!consentAccepted) {
    return NextResponse.json(
      { error: "You must accept the scholarship consent." },
      { status: 400 },
    )
  }

  const cohort = await db.cohort.findUnique({ where: { id: cohortId } })
  if (!cohort || cohort.status !== "active" || !cohort.scholarshipEnabled) {
    return NextResponse.json(
      { error: "Scholarship is not available for this cohort." },
      { status: 404 },
    )
  }
  if (!cohort.tracks.includes(track)) {
    return NextResponse.json(
      { error: "That track is not offered in this cohort." },
      { status: 400 },
    )
  }

  const existingApp = await db.scholarshipApplication.findFirst({
    where: {
      cohortId,
      email,
      status: { in: ["awarded", "paid"] },
    },
  })
  if (existingApp) {
    return NextResponse.json(
      {
        error: "You already have an active scholarship for this cohort.",
        amountDueKobo: existingApp.amountDueKobo,
        percentOff: existingApp.percentOff,
      },
      { status: 409 },
    )
  }

  const percentOff = cohort.scholarshipPercentOff
  const amountDueKobo = amountAfterPercentOff(cohort.priceKobo, percentOff)
  const payDeadline = new Date()
  payDeadline.setUTCDate(
    payDeadline.getUTCDate() + Math.max(1, cohort.scholarshipDeadlineDays),
  )

  const user = await db.user.findUnique({
    where: { email },
    select: { id: true },
  })

  const application = await db.scholarshipApplication.create({
    data: {
      cohortId,
      userId: user?.id ?? null,
      fullName,
      email,
      ageRange,
      gender,
      whatsapp,
      country,
      education,
      referralSource,
      track,
      laptop,
      internet,
      dailyHours,
      onlineBefore,
      careerGoals,
      consentAccepted: true,
      status: "awarded",
      percentOff,
      amountDueKobo,
      payDeadline,
    },
  })

  const hasAccount = Boolean(user)
  await sendScholarshipAwardEmail({
    to: email,
    fullName,
    cohortName: cohort.name,
    amountDueKobo,
    percentOff,
    payDeadline,
    hasAccount,
  })

  return NextResponse.json({
    ok: true,
    hasAccount,
    amountDueKobo: application.amountDueKobo,
    percentOff: application.percentOff,
    applicationId: application.id,
  })
}
