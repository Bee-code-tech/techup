import { NextResponse } from "next/server"
import { isNextResponse, requireStudent } from "@/lib/api-auth"
import { confirmPaystackPayment } from "@/lib/confirm-paystack-payment"
import { db } from "@/lib/db"

type Body = {
  reference?: string
}

export async function POST(request: Request) {
  const auth = await requireStudent()
  if (isNextResponse(auth)) return auth

  const body = (await request.json()) as Body
  const reference = String(body.reference ?? "").trim()
  if (!reference) {
    return NextResponse.json({ error: "Reference is required." }, { status: 400 })
  }

  const payment = await db.payment.findUnique({
    where: { paystackReference: reference },
  })
  if (!payment) {
    return NextResponse.json({ error: "Payment not found." }, { status: 404 })
  }
  if (payment.userId !== auth.userId) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 })
  }

  const result = await confirmPaystackPayment(reference)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  return NextResponse.json({
    ok: true,
    already: result.already,
    payment: result.payment,
  })
}
