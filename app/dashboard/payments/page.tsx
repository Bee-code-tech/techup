"use client"

import { useCallback, useEffect, useState } from "react"
import toast from "react-hot-toast"

import { CohortsPanel } from "@/components/dashboard/payments/cohorts-panel"
import { CouponsPanel } from "@/components/dashboard/payments/coupons-panel"
import { PaymentsStatCards } from "@/components/dashboard/payments/payments-stat-cards"
import type {
  CohortRow,
  CouponRow,
  TrackOption,
} from "@/components/dashboard/payments/types"
import { StatCardsSkeleton } from "@/components/dashboard/page-skeletons"

export default function PaymentsPage() {
  const [cohorts, setCohorts] = useState<CohortRow[]>([])
  const [tracks, setTracks] = useState<TrackOption[]>([])
  const [coupons, setCoupons] = useState<CouponRow[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const [cohortRes, couponRes] = await Promise.all([
        fetch("/api/admin/cohorts"),
        fetch("/api/admin/coupons"),
      ])
      const cohortPayload = (await cohortRes.json()) as {
        cohorts?: CohortRow[]
        tracks?: TrackOption[]
        error?: string
      }
      const couponPayload = (await couponRes.json()) as {
        coupons?: CouponRow[]
        error?: string
      }
      if (!cohortRes.ok) {
        if (!silent) {
          toast.error(cohortPayload.error || "Could not load cohorts.")
        }
        return
      }
      if (!couponRes.ok) {
        if (!silent) {
          toast.error(couponPayload.error || "Could not load coupons.")
        }
      }
      setCohorts(cohortPayload.cohorts || [])
      setTracks(cohortPayload.tracks || [])
      setCoupons(couponPayload.coupons || [])
    } catch {
      if (!silent) toast.error("Network error while loading payments.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load(false)
  }, [load])

  return (
    <div className="flex flex-col gap-8 py-6 md:py-8">
      {loading && cohorts.length === 0 ? (
        <StatCardsSkeleton count={4} />
      ) : (
        <PaymentsStatCards
          cohorts={cohorts}
          coupons={coupons}
          loading={loading}
        />
      )}

      <div className="px-4 lg:px-6">
        <h1 className="text-[1.65rem] font-semibold tracking-tight text-[#001752]">
          Payments
        </h1>
        <p className="mt-1.5 max-w-2xl text-[14.5px] leading-relaxed text-muted-foreground">
          Configure cohort pricing, scholarship discounts, installment plans,
          and reusable coupon codes.
        </p>
      </div>

      <CohortsPanel
        cohorts={cohorts}
        tracks={tracks}
        loading={loading}
        onChanged={() => void load(true)}
      />
      <CouponsPanel
        coupons={coupons}
        cohorts={cohorts}
        loading={loading}
        onChanged={() => void load(true)}
      />
    </div>
  )
}
