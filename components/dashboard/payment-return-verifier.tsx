"use client"

import { Suspense } from "react"

import { usePaymentReturnVerify } from "@/components/dashboard/use-payment-return-verify"

function PaymentReturnVerifyInner({
  onVerified,
}: {
  onVerified?: () => void | Promise<void>
}) {
  usePaymentReturnVerify({ onVerified })
  return null
}

/** Drop-in verifier for Paystack `?paid=1&ref=` return URLs. */
export function PaymentReturnVerifier({
  onVerified,
}: {
  onVerified?: () => void | Promise<void>
}) {
  return (
    <Suspense fallback={null}>
      <PaymentReturnVerifyInner onVerified={onVerified} />
    </Suspense>
  )
}
