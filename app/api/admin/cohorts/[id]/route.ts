import { NextResponse } from "next/server"
import { isNextResponse, requireAdmin } from "@/lib/api-auth"
import { bootcampTracks } from "@/lib/bootcamp"
import {
  nairaToKobo,
  validateInstallmentPercents,
} from "@/lib/cohort-pricing"
import { db } from "@/lib/db"

type RouteContext = { params: Promise<{ id: string }> }

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

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAdmin()
  if (isNextResponse(auth)) return auth

  const { id } = await context.params
  const existing = await db.cohort.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: "Cohort not found." }, { status: 404 })
  }

  const body = (await request.json()) as Body
  const name =
    body.name != null ? String(body.name).trim() : existing.name
  const description =
    body.description != null
      ? String(body.description).trim()
      : existing.description
  const tracks = Array.isArray(body.tracks)
    ? body.tracks.map(String).filter((t) => t in bootcampTracks)
    : existing.tracks
  const percents = Array.isArray(body.installmentPercents)
    ? body.installmentPercents.map(Number)
    : existing.installmentPercents

  if (name.length < 2) {
    return NextResponse.json({ error: "Cohort name is required." }, { status: 400 })
  }
  if (tracks.length === 0) {
    return NextResponse.json({ error: "Pick at least one track." }, { status: 400 })
  }

  const installmentEnabled =
    body.installmentEnabled != null
      ? Boolean(body.installmentEnabled)
      : existing.installmentEnabled
  if (installmentEnabled) {
    const installmentCheck = validateInstallmentPercents(percents)
    if (!installmentCheck.ok) {
      return NextResponse.json({ error: installmentCheck.error }, { status: 400 })
    }
  }

  let priceKobo = existing.priceKobo
  if (body.priceNaira != null) {
    const priceNaira = Number(body.priceNaira)
    if (!Number.isFinite(priceNaira) || priceNaira <= 0) {
      return NextResponse.json(
        { error: "Enter a valid price in Naira." },
        { status: 400 },
      )
    }
    priceKobo = nairaToKobo(priceNaira)
  }

  const status =
    body.status === "active" || body.status === "draft" || body.status === "closed"
      ? body.status
      : existing.status

  const cohort = await db.cohort.update({
    where: { id },
    data: {
      name,
      description,
      priceKobo,
      status,
      tracks,
      scholarshipEnabled:
        body.scholarshipEnabled != null
          ? Boolean(body.scholarshipEnabled)
          : existing.scholarshipEnabled,
      scholarshipPercentOff:
        body.scholarshipPercentOff != null
          ? Math.min(100, Math.max(0, Number(body.scholarshipPercentOff) || 0))
          : existing.scholarshipPercentOff,
      scholarshipConsentText:
        body.scholarshipConsentText != null
          ? String(body.scholarshipConsentText).trim() ||
            existing.scholarshipConsentText
          : existing.scholarshipConsentText,
      scholarshipDeadlineDays:
        body.scholarshipDeadlineDays != null
          ? Math.max(1, Number(body.scholarshipDeadlineDays) || 14)
          : existing.scholarshipDeadlineDays,
      installmentEnabled,
      installmentCount: percents.length,
      installmentPercents: percents,
      installmentReminderDays: Array.isArray(body.installmentReminderDays)
        ? body.installmentReminderDays.map(Number).filter((n) => n >= 0)
        : existing.installmentReminderDays,
      installmentOverdueRemoveDays:
        body.installmentOverdueRemoveDays != null
          ? Math.max(1, Number(body.installmentOverdueRemoveDays) || 3)
          : existing.installmentOverdueRemoveDays,
      installmentIntervalDays:
        body.installmentIntervalDays != null
          ? Math.max(1, Number(body.installmentIntervalDays) || 30)
          : existing.installmentIntervalDays,
    },
  })

  return NextResponse.json({ ok: true, cohort })
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireAdmin()
  if (isNextResponse(auth)) return auth

  const { id } = await context.params
  const existing = await db.cohort.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: "Cohort not found." }, { status: 404 })
  }

  const cohort = await db.cohort.update({
    where: { id },
    data: { status: "closed" },
  })

  return NextResponse.json({ ok: true, cohort })
}
