"use client"

import { useMemo } from "react"
import {
  GraduationCapIcon,
  LaptopIcon,
  LayersIcon,
  UsersIcon,
} from "lucide-react"

import type { Registration } from "@/components/admin/use-admin-dashboard"
import { StatCards, type StatCardItem } from "@/components/section-cards"

function percentOf(part: number, whole: number) {
  if (!whole) return "0%"
  return `${Math.round((part / whole) * 100)}%`
}

export function StudentsStatCards({
  registrations,
  stats,
}: {
  registrations: Registration[]
  stats: {
    total: number
    today: number
    week: number
    month: number
    tracks: number
    topTrack: { label: string; count: number } | null
  }
}) {
  const cards = useMemo(() => {
    const withLaptop = registrations.filter((row) => row.laptop === "yes").length
    const needsSupport = registrations.length - withLaptop

    const items: StatCardItem[] = [
      {
        label: "Total students",
        value: stats.total,
        icon: UsersIcon,
        accent: "navy",
        details: [
          `${stats.month} joined this month`,
          stats.topTrack
            ? `Most popular: ${stats.topTrack.label}`
            : "No track leaders yet",
        ],
      },
      {
        label: "New this week",
        value: stats.week,
        icon: GraduationCapIcon,
        accent: "orange",
        details: [
          `${stats.today} registered today`,
          `${percentOf(stats.week, stats.total)} of all students`,
        ],
      },
      {
        label: "Active tracks",
        value: stats.tracks,
        icon: LayersIcon,
        accent: "green",
        details: [
          stats.topTrack
            ? `${stats.topTrack.label} · ${stats.topTrack.count} students`
            : "Waiting for first registration",
          stats.topTrack
            ? `${percentOf(stats.topTrack.count, stats.total)} of roster`
            : "Share unavailable",
        ],
      },
      {
        label: "Laptop ready",
        value: withLaptop,
        icon: LaptopIcon,
        accent: "navy",
        details: [
          `${percentOf(withLaptop, registrations.length || stats.total)} have a laptop`,
          needsSupport > 0
            ? `${needsSupport} need support`
            : "No laptop support requests",
        ],
      },
    ]

    return items
  }, [registrations, stats])

  return <StatCards cards={cards} />
}
