import { NextResponse } from "next/server"
import { isNextResponse, requireAdmin } from "@/lib/api-auth"
import { clampPercent } from "@/lib/cohort-pricing"
import { db } from "@/lib/db"

export async function GET() {
  const auth = await requireAdmin()
  if (isNextResponse(auth)) return auth

  const coupons = await db.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      cohort: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json({
    coupons: coupons.map((row) => ({
      id: row.id,
      code: row.code,
      percentOff: row.percentOff,
      cohortId: row.cohortId,
      cohortName: row.cohort?.name ?? null,
      maxUses: row.maxUses,
      usedCount: row.usedCount,
      expiresAt: row.expiresAt?.toISOString() ?? null,
      isActive: row.isActive,
      createdAt: row.createdAt.toISOString(),
    })),
  })
}

type Body = {
  code?: string
  percentOff?: number
  cohortId?: string | null
  maxUses?: number | null
  expiresAt?: string | null
  isActive?: boolean
}

export async function POST(request: Request) {
  const auth = await requireAdmin()
  if (isNextResponse(auth)) return auth

  const body = (await request.json()) as Body
  const code = String(body.code ?? "")
    .trim()
    .toUpperCase()
  const percentOff = clampPercent(Number(body.percentOff))

  if (code.length < 2) {
    return NextResponse.json({ error: "Coupon code is required." }, { status: 400 })
  }
  if (percentOff <= 0) {
    return NextResponse.json(
      { error: "Percent off must be between 1 and 100." },
      { status: 400 },
    )
  }

  let cohortId: string | null = null
  if (body.cohortId) {
    const cohort = await db.cohort.findUnique({
      where: { id: String(body.cohortId) },
      select: { id: true },
    })
    if (!cohort) {
      return NextResponse.json({ error: "Cohort not found." }, { status: 404 })
    }
    cohortId = cohort.id
  }

  let expiresAt: Date | null = null
  if (body.expiresAt) {
    const parsed = new Date(String(body.expiresAt))
    if (Number.isNaN(parsed.getTime())) {
      return NextResponse.json({ error: "Invalid expiresAt." }, { status: 400 })
    }
    expiresAt = parsed
  }

  let maxUses: number | null = null
  if (body.maxUses != null) {
    maxUses = Math.max(1, Math.round(Number(body.maxUses)))
    if (!Number.isFinite(maxUses)) {
      return NextResponse.json({ error: "Invalid maxUses." }, { status: 400 })
    }
  }

  const existing = await db.coupon.findUnique({ where: { code } })
  if (existing) {
    return NextResponse.json(
      { error: "A coupon with this code already exists." },
      { status: 409 },
    )
  }

  const coupon = await db.coupon.create({
    data: {
      code,
      percentOff,
      cohortId,
      maxUses,
      expiresAt,
      isActive: body.isActive !== false,
    },
  })

  return NextResponse.json({ ok: true, coupon })
}
