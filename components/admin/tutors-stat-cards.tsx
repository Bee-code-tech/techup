"use client"

import { useMemo } from "react"
import {
  LayersIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react"

import { StatCards, type StatCardItem } from "@/components/section-cards"

export type TutorStatRow = {
  tracks: string[]
}

export function TutorsStatCards({
  tutors,
  trackCount,
  loading,
}: {
  tutors: TutorStatRow[]
  trackCount: number
  loading?: boolean
}) {
  const cards = useMemo(() => {
    const assignments = tutors.reduce(
      (sum, tutor) => sum + tutor.tracks.length,
      0,
    )
    const covered = new Set(tutors.flatMap((tutor) => tutor.tracks)).size
    const open = Math.max(0, trackCount - covered)

    const items: StatCardItem[] = [
      {
        label: "Total tutors",
        value: tutors.length,
        icon: UsersIcon,
        accent: "navy",
        details: [
          tutors.length === 1
            ? "1 instructor on the team"
            : `${tutors.length} instructors on the team`,
          "Multiple tutors per track allowed",
        ],
      },
      {
        label: "Track assignments",
        value: assignments,
        icon: LayersIcon,
        accent: "orange",
        details: [
          `${assignments} tutor–track link${assignments === 1 ? "" : "s"}`,
          `${covered} of ${trackCount} tracks covered`,
        ],
      },
      {
        label: "Uncovered tracks",
        value: open,
        icon: UserPlusIcon,
        accent: "green",
        details: [
          open === 0
            ? "Every track has at least one tutor"
            : `${open} track${open === 1 ? "" : "s"} still need a tutor`,
          "Invite or edit from the table",
        ],
      },
      {
        label: "Bootcamp tracks",
        value: trackCount,
        icon: ShieldCheckIcon,
        accent: "navy",
        details: [
          `${trackCount} bootcamp tracks total`,
          "Share tracks across faculty",
        ],
      },
    ]

    return items
  }, [trackCount, tutors])

  if (loading && tutors.length === 0) {
    return null
  }

  return <StatCards cards={cards} />
}
