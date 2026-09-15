import { NextResponse } from "next/server"
import {
  revokeEnrollmentAccess,
  setUserAccessTier,
} from "@/lib/cohort-access"
import { db } from "@/lib/db"
import {
  sendInstallmentReminderEmail,
  sendScholarshipRevokedEmail,
} from "@/lib/payment-emails"

function authorized(request: Request) {
  const secret =
    process.env.CRON_SECRET?.trim() || process.env.JOB_SECRET?.trim() || ""
  if (!secret) return false
  const header =
    request.headers.get("x-cron-secret") ||
    request.headers.get("x-job-secret") ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    ""
  return header === secret
}

function startOfUtcDay(date: Date) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}

function daysBetweenUtc(from: Date, to: Date) {
  return Math.round((startOfUtcDay(to) - startOfUtcDay(from)) / 86_400_000)
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  const summary = {
    remindersSent: 0,
    markedOverdue: 0,
    enrollmentsRevoked: 0,
    scholarshipsExpired: 0,
  }

  const pendingInstallments = await db.installmentSchedule.findMany({
    where: { status: { in: ["pending", "overdue"] } },
    include: {
      enrollment: {
        include: {
          cohort: true,
          user: { select: { id: true, email: true, name: true } },
        },
      },
    },
  })

  for (const part of pendingInstallments) {
    const enrollment = part.enrollment
    if (!enrollment || enrollment.status !== "active") continue
    const cohort = enrollment.cohort
    const daysUntilDue = daysBetweenUtc(now, part.dueAt)
    const daysOverdue = daysBetweenUtc(part.dueAt, now)

    if (part.status === "pending" && daysOverdue > 0) {
      await db.installmentSchedule.update({
        where: { id: part.id },
        data: { status: "overdue" },
      })
      summary.markedOverdue += 1
      part.status = "overdue"
    }

    if (
      (part.status === "pending" || part.status === "overdue") &&
      daysOverdue >= cohort.installmentOverdueRemoveDays
    ) {
      const revoked = await revokeEnrollmentAccess({
        enrollmentId: enrollment.id,
        reason: `Installment overdue by ${daysOverdue} day(s). Access revoked.`,
        notify: true,
      })
      if (revoked) summary.enrollmentsRevoked += 1
      continue
    }

    const reminderDays = cohort.installmentReminderDays || []
    for (const daysBefore of reminderDays) {
      if (daysUntilDue !== daysBefore) continue
      if (part.remindersSent.includes(daysBefore)) continue

      await sendInstallmentReminderEmail({
        to: enrollment.user.email,
        fullName: enrollment.user.name,
        cohortName: cohort.name,
        amountKobo: part.amountKobo,
        dueAt: part.dueAt,
        daysBefore,
      })
      await db.installmentSchedule.update({
        where: { id: part.id },
        data: { remindersSent: { push: daysBefore } },
      })
      summary.remindersSent += 1
    }
  }

  const awardedScholarships = await db.scholarshipApplication.findMany({
    where: {
      status: "awarded",
      payDeadline: { lt: now },
    },
    include: {
      cohort: { select: { id: true, name: true } },
    },
  })

  for (const scholarship of awardedScholarships) {
    await db.scholarshipApplication.update({
      where: { id: scholarship.id },
      data: {
        status: "expired",
        revokedAt: now,
      },
    })
    summary.scholarshipsExpired += 1

    const enrollment = await db.cohortEnrollment.findFirst({
      where: {
        scholarshipApplicationId: scholarship.id,
        status: "active",
      },
    })

    const reason =
      "Your scholarship payment deadline passed. The scholarship has expired and access was set back to free."

    if (enrollment) {
      await revokeEnrollmentAccess({
        enrollmentId: enrollment.id,
        reason,
        notify: true,
      })
      summary.enrollmentsRevoked += 1
    } else if (scholarship.userId) {
      await setUserAccessTier(scholarship.userId, "free")
    }

    await sendScholarshipRevokedEmail({
      to: scholarship.email,
      fullName: scholarship.fullName,
      cohortName: scholarship.cohort.name,
      reason,
    })
  }

  return NextResponse.json({ ok: true, summary })
}

/** Vercel Cron invokes jobs with GET. */
export async function GET(request: Request) {
  return POST(request)
}
