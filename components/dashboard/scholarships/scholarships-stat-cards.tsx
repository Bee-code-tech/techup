"use client"

import { useMemo } from "react"
import { StatCards, type StatCardItem } from "@/components/section-cards"

export type ScholarshipStats = {
  awarded: number
  revoked: number
  paid: number
  expired: number
  total: number
}

export function ScholarshipsStatCards({
  stats,
  loading,
}: {
  stats: ScholarshipStats | null
  loading?: boolean
}) {
  const cards = useMemo(() => {
    const s = stats || {
      awarded: 0,
      revoked: 0,
      paid: 0,
      expired: 0,
      total: 0,
    }
    const items: StatCardItem[] = [
      {
        label: "Awarded",
        value: s.awarded,
        icon: "square-academic-cap",
        accent: "navy",
        details: [
          `${s.awarded} active awards`,
          "Awaiting remnant payment",
        ],
      },
      {
        label: "Paid",
        value: s.paid,
        icon: "verified-check",
        accent: "green",
        details: [
          `${s.paid} fully settled`,
          "Scholarship remnant paid",
        ],
      },
      {
        label: "Revoked",
        value: s.revoked,
        icon: "forbidden-circle",
        accent: "orange",
        details: [
          `${s.revoked} revoked`,
          "Access returned to free",
        ],
      },
      {
        label: "Expired",
        value: s.expired,
        icon: "clock-circle",
        accent: "navy",
        details: [
          `${s.expired} past deadline`,
          `${s.total} applications total`,
        ],
      },
    ]
    return items
  }, [stats])

  if (loading && !stats) return null
  return <StatCards cards={cards} />
}
