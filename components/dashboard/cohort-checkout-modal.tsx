"use client"

import { useEffect, useId, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import toast from "react-hot-toast"

import { SolarIcon } from "@/components/icons/solar-icon"
import { Select } from "@/components/marketing/Select"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { formatNgnFromKobo, quoteCheckout } from "@/lib/cohort-pricing"
import { cn } from "@/lib/utils"

const inputClass =
  "h-10 rounded-lg border border-black/10 bg-transparent px-3 text-sm text-[#001752] shadow-none transition-[border-color,box-shadow] duration-150 ease-out placeholder:text-muted-foreground/70 focus-visible:border-[#00206F]/40 focus-visible:ring-2 focus-visible:ring-[#00206F]/12 md:text-sm"

const selectClass =
  "h-10 rounded-lg border border-black/10 bg-transparent px-3 text-sm text-[#001752] shadow-none transition-[border-color,box-shadow] duration-150 ease-out focus-visible:border-[#00206F]/40 focus-visible:ring-2 focus-visible:ring-[#00206F]/12"

const primaryBtnClass =
  "h-10 rounded-lg bg-[#FB7801] text-sm font-medium text-white transition-[transform,filter] duration-150 ease-out hover:brightness-105 active:scale-[0.98]"

const ghostBtnClass =
  "h-10 rounded-lg border border-black/10 bg-transparent text-sm font-medium text-[#001752] transition-transform duration-150 ease-out hover:bg-black/[0.03] active:scale-[0.98]"

export type CheckoutCohort = {
  id: string
  name: string
  description: string
  priceKobo: number
  tracks: string[]
  trackOptions: { id: string; label: string }[]
  scholarshipEnabled: boolean
  scholarshipPercentOff: number
  installmentEnabled: boolean
  installmentPercents: number[]
  enrollment: {
    id: string
    track: string
    paymentType: string
    status: string
    totalDueKobo: number
    amountPaidKobo: number
    scholarshipApplicationId: string | null
    couponCode: string | null
  } | null
  scholarship: {
    id: string
    status: string
    percentOff: number
    amountDueKobo: number
    payDeadline: string | null
    track: string
  } | null
}

export function CohortCheckoutModal({
  open,
  onClose,
  cohort,
  defaultTrack,
}: {
  open: boolean
  onClose: () => void
  cohort: CheckoutCohort | null
  defaultTrack?: string | null
}) {
  const titleId = useId()
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const [mode, setMode] = useState<"full" | "installment">("full")
  const [track, setTrack] = useState("")
  const [couponCode, setCouponCode] = useState("")
  const [paying, setPaying] = useState(false)

  const hasScholarship = Boolean(
    cohort?.scholarship && cohort.scholarship.status === "awarded",
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open || !cohort) {
      setVisible(false)
      return
    }
    const preferred =
      cohort.scholarship?.track ||
      defaultTrack ||
      cohort.trackOptions[0]?.id ||
      ""
    setTrack(preferred)
    setMode("full")
    setCouponCode("")
    const frame = requestAnimationFrame(() => setVisible(true))
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      cancelAnimationFrame(frame)
      document.body.style.overflow = prev
    }
  }, [open, cohort, defaultTrack, hasScholarship])

  const quote = useMemo(() => {
    if (!cohort) return null
    try {
      return quoteCheckout({
        priceKobo: cohort.priceKobo,
        mode,
        scholarshipPercentOff: hasScholarship
          ? (cohort.scholarship?.percentOff ?? null)
          : null,
        couponPercentOff: null,
        installmentPercents: cohort.installmentPercents,
      })
    } catch {
      return null
    }
  }, [cohort, hasScholarship, mode])

  async function checkout() {
    if (!cohort) return
    if (!track) {
      toast.error("Pick a track.")
      return
    }
    setPaying(true)
    try {
      const response = await fetch("/api/student/cohorts/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cohortId: cohort.id,
          mode,
          track,
          couponCode: hasScholarship
            ? undefined
            : couponCode.trim() || undefined,
        }),
      })
      const payload = (await response.json()) as {
        error?: string
        authorizationUrl?: string
        alreadyPaid?: boolean
        message?: string
      }
      if (!response.ok) {
        toast.error(payload.error || "Could not start checkout.")
        return
      }
      if (payload.alreadyPaid) {
        toast.success(payload.message || "Already paid.")
        onClose()
        return
      }
      if (payload.authorizationUrl) {
        window.location.href = payload.authorizationUrl
        return
      }
      toast.error("No checkout URL returned.")
    } catch {
      toast.error("Network error.")
    } finally {
      setPaying(false)
    }
  }

  if (!mounted || !open || !cohort) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close overlay"
        className={cn(
          "absolute inset-0 bg-[#001028]/50 backdrop-blur-[4px] transition-opacity duration-200 ease-out",
          visible ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "relative z-10 flex max-h-[min(94dvh,720px)] w-full max-w-[420px] flex-col overflow-hidden rounded-t-2xl border border-black/10 bg-[#fafafa] shadow-[0_28px_80px_-28px_rgba(0,16,40,0.55)] transition-[opacity,transform] duration-200 ease-out sm:rounded-2xl",
          visible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-3 scale-[0.985] opacity-0",
        )}
      >
        <div className="flex items-center justify-between border-b border-black/6 px-5 py-3.5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-full bg-[#FB7801]/12 text-[#FB7801]">
              <SolarIcon name="card" className="size-4" />
            </span>
            <div>
              <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                Checkout
              </p>
              <h2
                id={titleId}
                className="text-sm font-semibold tracking-tight text-[#001752]"
              >
                {cohort.name}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-150 hover:bg-black/4 hover:text-[#001752] active:scale-[0.96]"
          >
            <SolarIcon name="close-circle" className="size-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-6 sm:px-6">
          <div className="rounded-xl border border-black/8 bg-white p-4">
            {hasScholarship && quote ? (
              <>
                <div className="flex items-center gap-2">
                  <SolarIcon
                    name="medal-ribbons-star"
                    className="size-4 text-[#FB7801]" />
                  <p className="text-[11px] font-semibold tracking-[0.1em] text-[#FB7801] uppercase">
                    Scholarship applied
                  </p>
                </div>
                <p className="mt-3 text-sm text-muted-foreground line-through">
                  {formatNgnFromKobo(quote.listPriceKobo)}
                </p>
                <p className="mt-0.5 text-3xl font-semibold tabular-nums tracking-tight text-[#001752]">
                  {formatNgnFromKobo(quote.totalDueKobo)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {cohort.scholarship?.percentOff}% off · remnant due
                </p>
              </>
            ) : quote ? (
              <>
                <p className="text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                  Cohort fee
                </p>
                <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-[#001752]">
                  {formatNgnFromKobo(quote.listPriceKobo)}
                </p>
              </>
            ) : null}

            {quote && mode === "installment" ? (
              <div className="mt-4 border-t border-black/6 pt-3">
                <p className="text-sm text-muted-foreground">
                  Due now{" "}
                  <span className="font-semibold text-[#001752]">
                    {formatNgnFromKobo(quote.dueNowKobo)}
                  </span>
                  <span className="mx-1.5 text-black/20">·</span>
                  {cohort.installmentPercents.join(" / ")}%
                </p>
              </div>
            ) : null}
          </div>

          <FieldGroup>
            <Field>
              <FieldLabel>Track</FieldLabel>
              <Select
                options={cohort.trackOptions.map((item) => ({
                  value: item.id,
                  label: item.label,
                }))}
                value={track || undefined}
                onValueChange={setTrack}
                placeholder="Select track"
                className={selectClass}
              />
            </Field>

            {cohort.installmentEnabled ? (
              <Field>
                <FieldLabel>Payment type</FieldLabel>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      {
                        id: "full" as const,
                        title: "Pay in full",
                        hint: "One payment now",
                        icon: "wallet-money",
                      },
                      {
                        id: "installment" as const,
                        title: "Installments",
                        hint: cohort.installmentPercents.join(" / ") + "%",
                        icon: "calendar-mark",
                      },
                    ] as const
                  ).map((option) => {
                    const active = mode === option.id
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setMode(option.id)}
                        className={cn(
                          "rounded-xl border px-3 py-3 text-left transition-[border-color,background-color,transform,box-shadow] duration-150 ease-out active:scale-[0.98]",
                          active
                            ? "border-[#00206F] bg-[#00206F] text-white shadow-[0_0_0_3px_rgba(0,32,111,0.12)]"
                            : "border-black/10 bg-white text-[#001752] hover:border-[#00206F]/25",
                        )}
                      >
                        <SolarIcon
                          name={option.icon}
                          className={cn(
                            "size-4",
                            active ? "text-white" : "text-[#00206F]",
                          )} />
                        <p className="mt-2 text-sm font-semibold">
                          {option.title}
                        </p>
                        <p
                          className={cn(
                            "mt-0.5 text-xs",
                            active ? "text-white/75" : "text-muted-foreground",
                          )}
                        >
                          {option.hint}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </Field>
            ) : null}

            {hasScholarship ? null : (
              <Field>
                <FieldLabel htmlFor="coupon">Coupon code (optional)</FieldLabel>
                <Input
                  id="coupon"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter code"
                  className={inputClass}
                />
              </Field>
            )}
          </FieldGroup>
        </div>

        <div className="flex items-center gap-2 border-t border-black/6 bg-white/80 px-5 py-4 backdrop-blur-sm sm:px-6">
          <Button
            type="button"
            variant="ghost"
            className={cn(ghostBtnClass, "flex-1")}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={paying}
            className={cn(primaryBtnClass, "flex-[1.5] gap-2")}
            onClick={() => void checkout()}
          >
            <SolarIcon name="card" className="size-4 text-white" />
            {paying
              ? "Redirecting…"
              : `Pay ${quote ? formatNgnFromKobo(quote.dueNowKobo) : ""}`}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
