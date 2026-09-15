"use client"

import { useCallback, useEffect, useState } from "react"
import toast from "react-hot-toast"

import type { CheckoutCohort } from "@/components/dashboard/cohort-checkout-modal"

function pickCohort(cohorts: CheckoutCohort[], track?: string | null) {
  if (track) {
    const match = cohorts.find((row) => row.tracks.includes(track))
    if (match) return match
  }
  return cohorts[0] ?? null
}

export function useCohortCheckout(options?: { track?: string | null }) {
  const track = options?.track ?? null
  const [cohorts, setCohorts] = useState<CheckoutCohort[]>([])
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [activeCohort, setActiveCohort] = useState<CheckoutCohort | null>(null)

  const loadCohorts = useCallback(async () => {
    try {
      const response = await fetch("/api/student/cohorts")
      const payload = (await response.json()) as {
        cohorts?: CheckoutCohort[]
      }
      if (!response.ok) return []
      const rows = payload.cohorts || []
      setCohorts(rows)
      return rows
    } catch {
      return []
    }
  }, [])

  useEffect(() => {
    void loadCohorts()
  }, [loadCohorts])

  const openCheckout = useCallback(
    async (preferred?: CheckoutCohort | null) => {
      let rows = cohorts
      if (rows.length === 0) {
        rows = (await loadCohorts()) ?? []
      }

      const cohort = preferred ?? pickCohort(rows, track)
      if (!cohort) {
        toast.error("No cohort is open for enrollment right now.")
        return false
      }

      setActiveCohort(cohort)
      setCheckoutOpen(true)
      return true
    },
    [cohorts, loadCohorts, track],
  )

  const closeCheckout = useCallback(() => {
    setCheckoutOpen(false)
  }, [])

  return {
    cohorts,
    checkoutOpen,
    activeCohort,
    openCheckout,
    closeCheckout,
    loadCohorts,
  }
}
