import { NextResponse } from "next/server"
import { isNextResponse, requireAdmin } from "@/lib/api-auth"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  const auth = await requireAdmin()
  if (isNextResponse(auth)) return auth

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, Number(searchParams.get("page")) || 1)
  const pageSize = Math.min(
    100,
    Math.max(1, Number(searchParams.get("pageSize")) || 20),
  )
  const status = String(searchParams.get("status") ?? "").trim()
  const q = String(searchParams.get("q") ?? "").trim()

  const where: {
    status?: string
    OR?: Array<Record<string, unknown>>
  } = {}
  if (
    status === "awarded" ||
    status === "revoked" ||
    status === "paid" ||
    status === "expired"
  ) {
    where.status = status
  }
  if (q) {
    where.OR = [
      { email: { contains: q, mode: "insensitive" } },
      { fullName: { contains: q, mode: "insensitive" } },
      { whatsapp: { contains: q } },
    ]
  }

  const [totalFiltered, rows, awarded, revoked, paid, expired, total] =
    await Promise.all([
      db.scholarshipApplication.count({ where }),
      db.scholarshipApplication.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          cohort: { select: { id: true, name: true } },
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      db.scholarshipApplication.count({ where: { status: "awarded" } }),
      db.scholarshipApplication.count({ where: { status: "revoked" } }),
      db.scholarshipApplication.count({ where: { status: "paid" } }),
      db.scholarshipApplication.count({ where: { status: "expired" } }),
      db.scholarshipApplication.count(),
    ])

  return NextResponse.json({
    stats: { awarded, revoked, paid, expired, total },
    page,
    pageSize,
    total: totalFiltered,
    pageCount: Math.max(1, Math.ceil(totalFiltered / pageSize)),
    rows: rows.map((row) => ({
      id: row.id,
      cohortId: row.cohortId,
      cohortName: row.cohort.name,
      userId: row.userId,
      fullName: row.fullName,
      email: row.email,
      ageRange: row.ageRange,
      gender: row.gender,
      whatsapp: row.whatsapp,
      country: row.country,
      education: row.education,
      referralSource: row.referralSource,
      track: row.track,
      laptop: row.laptop,
      internet: row.internet,
      dailyHours: row.dailyHours,
      onlineBefore: row.onlineBefore,
      careerGoals: row.careerGoals,
      consentAccepted: row.consentAccepted,
      status: row.status,
      percentOff: row.percentOff,
      amountDueKobo: row.amountDueKobo,
      payDeadline: row.payDeadline?.toISOString() ?? null,
      revokedAt: row.revokedAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
      hasAccount: Boolean(row.userId),
    })),
  })
}
