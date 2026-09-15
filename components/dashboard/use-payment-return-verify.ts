"use client"

import { useEffect, useRef } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import toast from "react-hot-toast"

import { useSessionUser } from "@/components/dashboard/use-session"

/**
 * Verifies Paystack returns when `?paid=1&ref=` is present.
 * Runs once per reference on the current page.
 */
export function usePaymentReturnVerify(options?: {
  /** Extra work after a successful verify (e.g. reload learn data). */
  onVerified?: () => void | Promise<void>
}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const session = useSessionUser()
  const handled = useRef<string | null>(null)
  const onVerified = options?.onVerified

  useEffect(() => {
    const paid = searchParams.get("paid")
    const reference = searchParams.get("ref")
    if (paid !== "1" || !reference) return
    if (handled.current === reference) return
    handled.current = reference

    void (async () => {
      try {
        const response = await fetch("/api/student/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference }),
        })
        const payload = (await response.json()) as {
          error?: string
          already?: boolean
        }
        if (!response.ok) {
          toast.error(payload.error || "Payment verification failed.")
        } else {
          toast.success(
            payload.already
              ? "Payment already confirmed."
              : "Payment confirmed.",
          )
          await session.reload({ silent: true })
          await onVerified?.()
        }
      } catch {
        toast.error("Could not verify payment.")
      } finally {
        const params = new URLSearchParams(searchParams.toString())
        params.delete("paid")
        params.delete("ref")
        const next = params.toString()
        router.replace(next ? `${pathname}?${next}` : pathname)
      }
    })()
  }, [onVerified, pathname, router, searchParams, session])
}
