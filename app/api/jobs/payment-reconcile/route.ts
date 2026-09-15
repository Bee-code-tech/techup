import { NextResponse } from "next/server"

import { confirmPaystackPayment } from "@/lib/confirm-paystack-payment"
import { db } from "@/lib/db"
import { paystackSecret } from "@/lib/paystack"

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

export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  if (!paystackSecret()) {
    return NextResponse.json(
      { error: "Paystack is not configured." },
      { status: 503 },
    )
  }

  const now = Date.now()
  const minAgeMs = 5 * 60 * 1000
  const failAfterMs = 24 * 60 * 60 * 1000

  const pending = await db.payment.findMany({
    where: {
      status: "pending",
      createdAt: { lt: new Date(now - minAgeMs) },
    },
    orderBy: { createdAt: "asc" },
    take: 50,
  })

  const summary = {
    checked: pending.length,
    confirmed: 0,
    alreadyConfirmed: 0,
    failed: 0,
    stillPending: 0,
    errors: 0,
  }

  for (const payment of pending) {
    const ageMs = now - payment.createdAt.getTime()

    const result = await confirmPaystackPayment(payment.paystackReference)
    if (result.ok) {
      if (result.already) summary.alreadyConfirmed += 1
      else summary.confirmed += 1
      continue
    }

    if (result.status === 400 && ageMs >= failAfterMs) {
      await db.payment.update({
        where: { id: payment.id },
        data: { status: "failed" },
      })
      summary.failed += 1
      continue
    }

    if (result.status === 400) {
      summary.stillPending += 1
      continue
    }

    summary.errors += 1
  }

  return NextResponse.json({ ok: true, summary })
}

/** Vercel Cron invokes jobs with GET. */
export async function GET(request: Request) {
  return POST(request)
}
