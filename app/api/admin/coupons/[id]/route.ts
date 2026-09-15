import { NextResponse } from "next/server"
import { isNextResponse, requireAdmin } from "@/lib/api-auth"
import { clampPercent } from "@/lib/cohort-pricing"
import { db } from "@/lib/db"

type RouteContext = { params: Promise<{ id: string }> }

type Body = {
  code?: string
  percentOff?: number
  cohortId?: string | null
  maxUses?: number | null
  expiresAt?: string | null
  isActive?: boolean
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAdmin()
  if (isNextResponse(auth)) return auth

  const { id } = await context.params
  const existing = await db.coupon.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: "Coupon not found." }, { status: 404 })
  }

  const body = (await request.json()) as Body
  const data: {
    code?: string
    percentOff?: number
    cohortId?: string | null
    maxUses?: number | null
    expiresAt?: Date | null
    isActive?: boolean
  } = {}

  if (body.code != null) {
    const code = String(body.code).trim().toUpperCase()
    if (code.length < 2) {
      return NextResponse.json({ error: "Coupon code is required." }, { status: 400 })
    }
    if (code !== existing.code) {
      const clash = await db.coupon.findUnique({ where: { code } })
      if (clash) {
        return NextResponse.json(
          { error: "A coupon with this code already exists." },
          { status: 409 },
        )
      }
    }
    data.code = code
  }

  if (body.percentOff != null) {
    const percentOff = clampPercent(Number(body.percentOff))
    if (percentOff <= 0) {
      return NextResponse.json(
        { error: "Percent off must be between 1 and 100." },
        { status: 400 },
      )
    }
    data.percentOff = percentOff
  }

  if (body.cohortId !== undefined) {
    if (body.cohortId == null || body.cohortId === "") {
      data.cohortId = null
    } else {
      const cohort = await db.cohort.findUnique({
        where: { id: String(body.cohortId) },
        select: { id: true },
      })
      if (!cohort) {
        return NextResponse.json({ error: "Cohort not found." }, { status: 404 })
      }
      data.cohortId = cohort.id
    }
  }

  if (body.maxUses !== undefined) {
    if (body.maxUses == null) {
      data.maxUses = null
    } else {
      const maxUses = Math.max(1, Math.round(Number(body.maxUses)))
      if (!Number.isFinite(maxUses)) {
        return NextResponse.json({ error: "Invalid maxUses." }, { status: 400 })
      }
      data.maxUses = maxUses
    }
  }

  if (body.expiresAt !== undefined) {
    if (body.expiresAt == null || !String(body.expiresAt).trim()) {
      data.expiresAt = null
    } else {
      const parsed = new Date(String(body.expiresAt))
      if (Number.isNaN(parsed.getTime())) {
        return NextResponse.json({ error: "Invalid expiresAt." }, { status: 400 })
      }
      data.expiresAt = parsed
    }
  }

  if (body.isActive != null) {
    data.isActive = Boolean(body.isActive)
  }

  const coupon = await db.coupon.update({
    where: { id },
    data,
  })

  return NextResponse.json({ ok: true, coupon })
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireAdmin()
  if (isNextResponse(auth)) return auth

  const { id } = await context.params
  const existing = await db.coupon.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: "Coupon not found." }, { status: 404 })
  }

  await db.coupon.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
