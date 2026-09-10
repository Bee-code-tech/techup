"use client"

import { useCallback, useEffect, useState } from "react"

import type { LearnCourse } from "@/components/dashboard/learn-courses"

export type LearnTutor = {
  id: string
  name: string
  bio: string | null
  avatarUrl: string | null
  email: string
  whatsapp?: string | null
}

export type StudentLearnData = {
  track: string | null
  trackLabel: string
  tutor: LearnTutor | null
  tutors: LearnTutor[]
  courses: LearnCourse[]
  accessTier?: string
  currentStreak?: number
  longestStreak?: number
}

type CacheEntry = {
  data: StudentLearnData
  fetchedAt: number
}

const TTL_MS = 60_000

const g = globalThis as typeof globalThis & {
  __techupStudentLearnCache?: CacheEntry | null
}

function getCache() {
  return g.__techupStudentLearnCache ?? null
}

function setCache(entry: CacheEntry | null) {
  g.__techupStudentLearnCache = entry
}

export function clearStudentLearnCache() {
  setCache(null)
}

function isFresh(fetchedAt?: number) {
  if (!fetchedAt) return false
  return Date.now() - fetchedAt < TTL_MS
}

async function fetchStudentLearn(): Promise<StudentLearnData> {
  const response = await fetch("/api/student/learn")
  const payload = (await response.json()) as StudentLearnData & {
    error?: string
  }
  if (!response.ok) {
    throw new Error(payload.error || "Could not load courses.")
  }
  return {
    track: payload.track || null,
    trackLabel: payload.trackLabel || "",
    tutor: payload.tutor || payload.tutors?.[0] || null,
    tutors:
      payload.tutors && payload.tutors.length > 0
        ? payload.tutors
        : payload.tutor
          ? [payload.tutor]
          : [],
    courses: payload.courses || [],
    accessTier: payload.accessTier,
    currentStreak: payload.currentStreak ?? 0,
    longestStreak: payload.longestStreak ?? 0,
  }
}

export function useStudentLearn() {
  const cached = getCache()
  const [data, setData] = useState<StudentLearnData | null>(
    cached?.data ?? null,
  )
  const [loading, setLoading] = useState(!cached?.data)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")

  const load = useCallback(
    async (options?: { silent?: boolean; force?: boolean }) => {
      const existing = getCache()
      const hasCached = Boolean(existing?.data)
      const silent = options?.silent ?? hasCached

      if (!options?.force && isFresh(existing?.fetchedAt) && existing?.data) {
        setData(existing.data)
        setLoading(false)
        return
      }

      if (silent) setRefreshing(true)
      else {
        setLoading(true)
        setError("")
      }

      try {
        const next = await fetchStudentLearn()
        setCache({ data: next, fetchedAt: Date.now() })
        setData(next)
        setError("")
      } catch (err) {
        if (!existing?.data) {
          setError(
            err instanceof Error
              ? err.message
              : "Network error while loading courses.",
          )
        }
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [],
  )

  useEffect(() => {
    const existing = getCache()
    void load({
      silent: Boolean(existing?.data),
      force: !isFresh(existing?.fetchedAt),
    })
  }, [load])

  useEffect(() => {
    const onProgress = () => {
      void load({ silent: true, force: true })
    }
    window.addEventListener("learn-progress-updated", onProgress)
    return () =>
      window.removeEventListener("learn-progress-updated", onProgress)
  }, [load])

  return {
    data,
    loading,
    refreshing,
    error,
    reload: (options?: { silent?: boolean }) =>
      load({
        silent: options?.silent ?? Boolean(getCache()?.data),
        force: true,
      }),
  }
}
