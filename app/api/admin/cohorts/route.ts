import { NextResponse } from "next/server"
import { isNextResponse, requireAdmin } from "@/lib/api-auth"
import { bootcampTracks } from "@/lib/bootcamp"
import {
  nairaToKobo,
  validateInstallmentPercents,
} from "@/lib/cohort-pricing"
import { db } from "@/lib/db"

export async function GET() {
  const auth = await requireAdmin()
  if (isNextResponse(auth)) return auth

  const cohorts = await db.cohort.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          enrollments: true,
          scholarships: true,
          coupons: true,
        },
      },
    },
  })

  return NextResponse.json({
    tracks: Object.entries(bootcampTracks).map(([id, label]) => ({
      id,
      label,
    })),
    cohorts: cohorts.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      priceKobo: row.priceKobo,
      status: row.status,
      tracks: row.tracks,
      scholarshipEnabled: row.scholarshipEnabled,
      scholarshipPercentOff: row.scholarshipPercentOff,
      scholarshipConsentText: row.scholarshipConsentText,
      scholarshipDeadlineDays: row.scholarshipDeadlineDays,
      installmentEnabled: row.installmentEnabled,
      installmentCount: row.installmentCount,
      installmentPercents: row.installmentPercents,
      installmentReminderDays: row.installmentReminderDays,
      installmentOverdueRemoveDays: row.installmentOverdueRemoveDays,
      installmentIntervalDays: row.installmentIntervalDays,
      createdAt: row.createdAt.toISOString(),
      enrollmentCount: row._count.enrollments,
      scholarshipCount: row._count.scholarships,
      couponCount: row._count.coupons,
    })),
  })
}

type Body = {
  name?: string
  description?: string
  priceNaira?: number
  tracks?: string[]
  status?: string
  scholarshipEnabled?: boolean
  scholarshipPercentOff?: number
  scholarshipConsentText?: string
  scholarshipDeadlineDays?: number
  installmentEnabled?: boolean
  installmentPercents?: number[]
  installmentReminderDays?: number[]
  installmentOverdueRemoveDays?: number
  installmentIntervalDays?: number
}

export async function POST(request: Request) {
  const auth = await requireAdmin()
  if (isNextResponse(auth)) return auth

  const body = (await request.json()) as Body
  const name = String(body.name ?? "").trim()
  const description = String(body.description ?? "").trim()
  const priceNaira = Number(body.priceNaira)
  const tracks = Array.isArray(body.tracks)
    ? body.tracks.map(String).filter((t) => t in bootcampTracks)
    : Object.keys(bootcampTracks)
  const percents = Array.isArray(body.installmentPercents)
    ? body.installmentPercents.map(Number)
    : [40, 30, 30]

  if (name.length < 2) {
    return NextResponse.json({ error: "Cohort name is required." }, { status: 400 })
  }
  if (!Number.isFinite(priceNaira) || priceNaira <= 0) {
    return NextResponse.json({ error: "Enter a valid price in Naira." }, { status: 400 })
  }
  if (tracks.length === 0) {
    return NextResponse.json({ error: "Pick at least one track." }, { status: 400 })
  }
  const installmentCheck = validateInstallmentPercents(percents)
  if (body.installmentEnabled !== false && !installmentCheck.ok) {
    return NextResponse.json({ error: installmentCheck.error }, { status: 400 })
  }

  const cohort = await db.cohort.create({
    data: {
      name,
      description,
      priceKobo: nairaToKobo(priceNaira),
      status: body.status === "active" ? "active" : "draft",
      tracks,
      scholarshipEnabled: body.scholarshipEnabled !== false,
      scholarshipPercentOff: Math.min(
        100,
        Math.max(0, Number(body.scholarshipPercentOff) || 70),
      ),
      scholarshipConsentText:
        String(body.scholarshipConsentText ?? "").trim() || undefined,
      scholarshipDeadlineDays: Math.max(
        1,
        Number(body.scholarshipDeadlineDays) || 14,
      ),
      installmentEnabled: body.installmentEnabled !== false,
      installmentCount: percents.length,
      installmentPercents: percents,
      installmentReminderDays: Array.isArray(body.installmentReminderDays)
        ? body.installmentReminderDays.map(Number).filter((n) => n >= 0)
        : [3, 1],
      installmentOverdueRemoveDays: Math.max(
        1,
        Number(body.installmentOverdueRemoveDays) || 3,
      ),
      installmentIntervalDays: Math.max(
        1,
        Number(body.installmentIntervalDays) || 30,
      ),
    },
  })

  return NextResponse.json({ ok: true, cohort })
}
