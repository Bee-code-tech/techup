import { NextResponse } from "next/server"

import {
  confirmPaystackPayment,
  failPendingPaystackPayment,
} from "@/lib/confirm-paystack-payment"
import { verifyPaystackWebhookSignature } from "@/lib/paystack"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type PaystackWebhookPayload = {
  event?: string
  data?: {
    reference?: string
    amount?: number
    status?: string
  }
}

export async function POST(request: Request) {
  const rawBody = await request.text()
  const signature = request.headers.get("x-paystack-signature")

  if (!verifyPaystackWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 })
  }

  let payload: PaystackWebhookPayload
  try {
    payload = JSON.parse(rawBody) as PaystackWebhookPayload
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 })
  }

  const event = String(payload.event ?? "")
  const reference = String(payload.data?.reference ?? "").trim()
  if (!reference) {
    return NextResponse.json({ ok: true, ignored: true, reason: "no reference" })
  }

  if (event === "charge.success") {
    const result = await confirmPaystackPayment(reference, {
      trusted: true,
      amountKobo: payload.data?.amount,
      paystackStatus: payload.data?.status ?? "success",
    })

    if (!result.ok && result.status !== 404) {
      console.error("[paystack webhook] charge.success failed", {
        reference,
        error: result.error,
      })
    }

    // Always 200 so Paystack does not retry endlessly on business-logic misses.
    return NextResponse.json({
      ok: result.ok,
      already: result.ok ? result.already : undefined,
      error: result.ok ? undefined : result.error,
    })
  }

  if (event === "charge.failed") {
    await failPendingPaystackPayment(reference)
    return NextResponse.json({ ok: true, handled: "charge.failed" })
  }

  return NextResponse.json({ ok: true, ignored: true, event })
}
