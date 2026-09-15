import { NextResponse } from "next/server"
import { isNextResponse, requireStudent } from "@/lib/api-auth"
import { bootcampTracks } from "@/lib/bootcamp"
import { db } from "@/lib/db"

export async function GET() {
  const auth = await requireStudent()
  if (isNextResponse(auth)) return auth

  const user = await db.user.findUnique({
    where: { id: auth.userId },
    select: { id: true, email: true, track: true, accessTier: true },
  })
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 })
  }

  const [cohorts, enrollments, scholarships] = await Promise.all([
    db.cohort.findMany({
      where: { status: "active" },
      orderBy: { createdAt: "desc" },
    }),
    db.cohortEnrollment.findMany({
      where: { userId: user.id },
      include: {
        installments: { orderBy: { index: "asc" } },
      },
    }),
    db.scholarshipApplication.findMany({
      where: {
        email: user.email,
        status: { in: ["awarded", "paid"] },
      },
    }),
  ])

  const enrollmentByCohort = new Map(
    enrollments.map((row) => [row.cohortId, row]),
  )
  const scholarshipByCohort = new Map(
    scholarships.map((row) => [row.cohortId, row]),
  )

  return NextResponse.json({
    accessTier: user.accessTier,
    track: user.track,
    cohorts: cohorts.map((cohort) => {
      const enrollment = enrollmentByCohort.get(cohort.id) ?? null
      const scholarship = scholarshipByCohort.get(cohort.id) ?? null
      return {
        id: cohort.id,
        name: cohort.name,
        description: cohort.description,
        priceKobo: cohort.priceKobo,
        tracks: cohort.tracks,
        trackOptions: cohort.tracks.map((id) => ({
          id,
          label: bootcampTracks[id] || id,
        })),
        scholarshipEnabled: cohort.scholarshipEnabled,
        scholarshipPercentOff: cohort.scholarshipPercentOff,
        installmentEnabled: cohort.installmentEnabled,
        installmentPercents: cohort.installmentPercents,
        enrollment: enrollment
          ? {
              id: enrollment.id,
              track: enrollment.track,
              paymentType: enrollment.paymentType,
              status: enrollment.status,
              totalDueKobo: enrollment.totalDueKobo,
              amountPaidKobo: enrollment.amountPaidKobo,
              scholarshipApplicationId: enrollment.scholarshipApplicationId,
              couponCode: enrollment.couponCode,
              installments: enrollment.installments.map((part) => ({
                id: part.id,
                index: part.index,
                percent: part.percent,
                amountKobo: part.amountKobo,
                dueAt: part.dueAt.toISOString(),
                status: part.status,
                paidAt: part.paidAt?.toISOString() ?? null,
              })),
            }
          : null,
        scholarship: scholarship
          ? {
              id: scholarship.id,
              status: scholarship.status,
              percentOff: scholarship.percentOff,
              amountDueKobo: scholarship.amountDueKobo,
              payDeadline: scholarship.payDeadline?.toISOString() ?? null,
              track: scholarship.track,
            }
          : null,
      }
    }),
  })
}
