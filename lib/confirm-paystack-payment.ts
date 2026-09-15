import { markPaymentSuccess } from "@/lib/cohort-access"
import { db } from "@/lib/db"
import { verifyPaystack } from "@/lib/paystack"

type PaymentRow = Awaited<ReturnType<typeof db.payment.findUnique>>

export type ConfirmPaystackPaymentResult =
  | { ok: true; already: boolean; payment: NonNullable<PaymentRow> }
  | { ok: false; error: string; status: number }

/**
 * Confirms a pending Paystack payment and grants access.
 * Used by the return-url verify endpoint, Paystack webhooks, and reconciliation jobs.
 */
export async function confirmPaystackPayment(
  reference: string,
  options?: {
    /** When true, skip the Paystack verify API (signed webhook). */
    trusted?: boolean
    /** Amount in kobo from a trusted Paystack payload. */
    amountKobo?: number
    /** Paystack transaction status from a trusted payload. */
    paystackStatus?: string
  },
): Promise<ConfirmPaystackPaymentResult> {
  const payment = await db.payment.findUnique({
    where: { paystackReference: reference },
  })
  if (!payment) {
    return { ok: false, error: "Payment not found.", status: 404 }
  }
  if (payment.status === "success") {
    return { ok: true, already: true, payment }
  }

  if (options?.trusted) {
    if (options.paystackStatus !== "success") {
      if (options.paystackStatus === "failed") {
        await db.payment.update({
          where: { id: payment.id },
          data: { status: "failed" },
        })
      }
      return {
        ok: false,
        error: "Payment was not successful.",
        status: 400,
      }
    }

    if (
      typeof options.amountKobo === "number" &&
      options.amountKobo !== payment.amount
    ) {
      return { ok: false, error: "Payment amount mismatch.", status: 400 }
    }
  } else {
    const verified = await verifyPaystack(reference)
    if (!verified.ok) {
      return { ok: false, error: verified.error, status: verified.status }
    }

    if (verified.data.status !== "success") {
      await db.payment.update({
        where: { id: payment.id },
        data: { status: "failed" },
      })
      return {
        ok: false,
        error: "Payment was not successful.",
        status: 400,
      }
    }

    if (
      typeof verified.data.amount === "number" &&
      verified.data.amount !== payment.amount
    ) {
      return { ok: false, error: "Payment amount mismatch.", status: 400 }
    }
  }

  const result = await markPaymentSuccess(reference)
  if (!result.ok) {
    return { ok: false, error: result.error, status: 404 }
  }

  return {
    ok: true,
    already: result.already,
    payment: result.payment,
  }
}

export async function failPendingPaystackPayment(reference: string) {
  const payment = await db.payment.findUnique({
    where: { paystackReference: reference },
  })
  if (!payment || payment.status !== "pending") return null

  return db.payment.update({
    where: { id: payment.id },
    data: { status: "failed" },
  })
}
