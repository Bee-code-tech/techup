"use client"

import { useCallback, useEffect, useState } from "react"
import toast from "react-hot-toast"

import { TutorsStatCards } from "@/components/admin/tutors-stat-cards"
import {
  TutorsTable,
  type TrackOption,
  type TutorRow,
} from "@/components/admin/tutors-table"
import { StatCardsSkeleton } from "@/components/dashboard/page-skeletons"
import { bootcampTracks } from "@/lib/bootcamp"

export default function TutorsPage() {
  const [tutors, setTutors] = useState<TutorRow[]>([])
  const [tracks, setTracks] = useState<TrackOption[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const response = await fetch("/api/admin/tutors")
      const payload = (await response.json()) as {
        tutors?: TutorRow[]
        tracks?: TrackOption[]
        error?: string
      }
      if (!response.ok) {
        if (!silent) toast.error(payload.error || "Could not load tutors.")
        return
      }
      setTutors(payload.tutors || [])
      setTracks(payload.tracks || [])
    } catch {
      if (!silent) toast.error("Network error while loading tutors.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load(false)
  }, [load])

  const trackCount =
    tracks.length || Object.keys(bootcampTracks).length

  return (
    <div className="flex flex-col gap-6 py-6 md:py-8">
      {loading && tutors.length === 0 ? (
        <StatCardsSkeleton count={4} />
      ) : (
        <TutorsStatCards
          tutors={tutors}
          trackCount={trackCount}
          loading={loading}
        />
      )}
      <TutorsTable
        tutors={tutors}
        tracks={tracks}
        loading={loading}
        onChanged={() => load(true)}
      />
    </div>
  )
}
