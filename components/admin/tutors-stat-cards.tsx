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
    const assigned = new Set(tutors.flatMap((tutor) => tutor.tracks)).size
    const open = Math.max(0, trackCount - assigned)

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
          "One tutor per track",
        ],
      },
      {
        label: "Tracks covered",
        value: assigned,
        icon: LayersIcon,
        accent: "orange",
        details: [
          `${assigned} of ${trackCount} tracks staffed`,
          open === 0 ? "All tracks assigned" : `${open} still open`,
        ],
      },
      {
        label: "Open tracks",
        value: open,
        icon: UserPlusIcon,
        accent: "green",
        details: [
          open === 0
            ? "No open tracks right now"
            : "Available for a new invite",
          "Locked once assigned",
        ],
      },
      {
        label: "Faculty seats",
        value: trackCount,
        icon: ShieldCheckIcon,
        accent: "navy",
        details: [
          `${trackCount} bootcamp tracks total`,
          "Invite from the table below",
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
