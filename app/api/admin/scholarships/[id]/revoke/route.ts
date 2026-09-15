import { NextResponse } from "next/server"
import { isNextResponse, requireAdmin } from "@/lib/api-auth"
import { revokeEnrollmentAccess } from "@/lib/cohort-access"
import { db } from "@/lib/db"
import { sendScholarshipRevokedEmail } from "@/lib/payment-emails"

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(_request: Request, context: RouteContext) {
  const auth = await requireAdmin()
  if (isNextResponse(auth)) return auth

  const { id } = await context.params
  const scholarship = await db.scholarshipApplication.findUnique({
    where: { id },
    include: {
      cohort: { select: { id: true, name: true } },
    },
  })
  if (!scholarship) {
    return NextResponse.json(
      { error: "Scholarship not found." },
      { status: 404 },
    )
  }
  if (scholarship.status === "revoked") {
    return NextResponse.json({ ok: true, already: true })
  }
  if (scholarship.status === "paid") {
    return NextResponse.json(
      { error: "Cannot revoke a paid scholarship." },
      { status: 409 },
    )
  }

  const reason =
    "Your scholarship was revoked by an administrator. Free access remains available; you can still enroll with full or installment payment."

  await db.scholarshipApplication.update({
    where: { id },
    data: {
      status: "revoked",
      revokedAt: new Date(),
    },
  })

  const enrollment = await db.cohortEnrollment.findFirst({
    where: {
      scholarshipApplicationId: id,
      status: "active",
    },
  })
  if (enrollment) {
    await revokeEnrollmentAccess({
      enrollmentId: enrollment.id,
      reason,
      notify: true,
    })
  } else if (scholarship.userId) {
    await db.user.update({
      where: { id: scholarship.userId },
      data: { accessTier: "free" },
    })
  }

  await sendScholarshipRevokedEmail({
    to: scholarship.email,
    fullName: scholarship.fullName,
    cohortName: scholarship.cohort.name,
    reason,
  })

  return NextResponse.json({ ok: true })
}
