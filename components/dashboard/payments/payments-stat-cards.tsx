"use client"

import { useMemo } from "react"

import type { CohortRow, CouponRow } from "@/components/dashboard/payments/types"
import { StatCards, type StatCardItem } from "@/components/section-cards"
import { formatNgnFromKobo } from "@/lib/cohort-pricing"

export function PaymentsStatCards({
  cohorts,
  coupons,
  loading,
}: {
  cohorts: CohortRow[]
  coupons: CouponRow[]
  loading?: boolean
}) {
  const cards = useMemo(() => {
    const active = cohorts.filter((c) => c.status === "active").length
    const draft = cohorts.filter((c) => c.status === "draft").length
    const enrollments = cohorts.reduce((sum, c) => sum + c.enrollmentCount, 0)
    const scholarships = cohorts.reduce(
      (sum, c) => sum + c.scholarshipCount,
      0,
    )
    const activeCoupons = coupons.filter((c) => c.isActive).length
    const topPrice = cohorts.reduce(
      (max, c) => Math.max(max, c.priceKobo),
      0,
    )

    const items: StatCardItem[] = [
      {
        label: "Active cohorts",
        value: active,
        icon: "users-group-rounded",
        accent: "navy",
        details: [
          `${cohorts.length} total · ${draft} draft`,
          topPrice
            ? `Top fee ${formatNgnFromKobo(topPrice)}`
            : "No pricing set yet",
        ],
      },
      {
        label: "Enrollments",
        value: enrollments,
        icon: "user-check",
        accent: "green",
        details: [
          `${enrollments} students across cohorts`,
          "Paid + scholarship enrollments",
        ],
      },
      {
        label: "Scholarships",
        value: scholarships,
        icon: "square-academic-cap",
        accent: "orange",
        details: [
          `${scholarships} applications linked`,
          "Managed on Scholarships page",
        ],
      },
      {
        label: "Active coupons",
        value: activeCoupons,
        icon: "tag-price",
        accent: "navy",
        details: [
          `${coupons.length} codes total`,
          activeCoupons
            ? "Ready for checkout discounts"
            : "Create a code to start",
        ],
      },
    ]
    return items
  }, [cohorts, coupons])

  if (loading && cohorts.length === 0) return null
  return <StatCards cards={cards} />
}
