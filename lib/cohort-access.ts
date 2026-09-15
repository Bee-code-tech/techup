import { db } from "@/lib/db"
import { notifyUser } from "@/lib/notifications"

export async function setUserAccessTier(
  userId: string,
  accessTier: "free" | "paid",
) {
  return db.user.update({
    where: { id: userId },
    data: { accessTier },
  })
}

export async function revokeEnrollmentAccess(options: {
  enrollmentId: string
  reason: string
  notify?: boolean
}) {
  const enrollment = await db.cohortEnrollment.findUnique({
    where: { id: options.enrollmentId },
    include: {
      cohort: { select: { name: true } },
      user: { select: { id: true, email: true, name: true } },
    },
  })
  if (!enrollment || enrollment.status !== "active") return null

  await db.cohortEnrollment.update({
    where: { id: enrollment.id },
    data: { status: "revoked" },
  })
  await db.installmentSchedule.updateMany({
    where: { enrollmentId: enrollment.id, status: "pending" },
    data: { status: "waived" },
  })
  await setUserAccessTier(enrollment.userId, "free")

  if (options.notify) {
    await notifyUser({
      userId: enrollment.userId,
      type: "payment",
      title: "Cohort access revoked",
      body: options.reason,
      href: "/dashboard",
    })
  }

  return enrollment
}

export async function grantPaidAccess(userId: string) {
  return setUserAccessTier(userId, "paid")
}

export async function markPaymentSuccess(reference: string) {
  const payment = await db.payment.findUnique({
    where: { paystackReference: reference },
  })
  if (!payment) return { ok: false as const, error: "Payment not found." }
  if (payment.status === "success") {
    return { ok: true as const, payment, already: true }
  }

  const updated = await db.payment.update({
    where: { id: payment.id },
    data: { status: "success" },
  })

  if (payment.couponCode) {
    await db.coupon.updateMany({
      where: { code: payment.couponCode },
      data: { usedCount: { increment: 1 } },
    })
  }

  if (payment.kind === "module" && payment.moduleId) {
    await db.moduleUnlock.upsert({
      where: {
        userId_moduleId: {
          userId: payment.userId,
          moduleId: payment.moduleId,
        },
      },
      create: {
        userId: payment.userId,
        moduleId: payment.moduleId,
        paymentId: payment.id,
      },
      update: { paymentId: payment.id },
    })
    return { ok: true as const, payment: updated, already: false }
  }

  if (payment.enrollmentId) {
    const enrollment = await db.cohortEnrollment.findUnique({
      where: { id: payment.enrollmentId },
    })
    let amountPaidKobo = enrollment?.amountPaidKobo ?? 0
    if (enrollment) {
      amountPaidKobo = enrollment.amountPaidKobo + payment.amount
      await db.cohortEnrollment.update({
        where: { id: enrollment.id },
        data: {
          amountPaidKobo,
          status: "active",
        },
      })
    }
    if (payment.installmentId) {
      await db.installmentSchedule.update({
        where: { id: payment.installmentId },
        data: {
          status: "paid",
          paidAt: new Date(),
          paymentId: payment.id,
        },
      })
    }
    if (
      enrollment?.scholarshipApplicationId &&
      amountPaidKobo >= enrollment.totalDueKobo
    ) {
      await db.scholarshipApplication.update({
        where: { id: enrollment.scholarshipApplicationId },
        data: { status: "paid" },
      })
    }
    await grantPaidAccess(payment.userId)
    await notifyUser({
      userId: payment.userId,
      type: "payment",
      title: "Payment successful",
      body: "Your cohort access is now unlocked.",
      href: "/dashboard/learn",
    })
  }

  return { ok: true as const, payment: updated, already: false }
}
