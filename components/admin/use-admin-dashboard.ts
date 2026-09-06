"use client"

import { useCallback, useEffect, useState } from "react"

import { useSessionUser } from "@/components/dashboard/use-session"

export type Registration = {
  id: string
  fullName: string
  email: string
  age: number
  gender: string
  whatsapp: string
  education: string
  laptop: string
  track: string
  trackLabel: string
  createdAt: string
}

export type BroadcastRecord = {
  id: string
  campaignKey: string
  subject: string
  heading: string
  body: string
  ctaLabel: string
  ctaUrl: string
  tracks: string[]
  recipientCount: number
  skippedCount: number
  alreadyReceived: number
  remaining: number
  audienceSize: number
  createdAt: string
}

export type DashboardStats = {
  total: number
  today: number
  yesterday: number
  week: number
  month: number
  tracks: number
  topTrack: { track: string; label: string; count: number } | null
}

export type OverviewData = {
  stats: DashboardStats
  daily: Array<{ date: string; count: number }>
  trackBreakdown: Array<{ track: string; label: string; count: number }>
  dayCounts: Array<{ date: string; count: number }>
}

export type StudentsData = {
  stats: DashboardStats
  registrations: Registration[]
}

export type BroadcastData = {
  broadcasts: BroadcastRecord[]
  registrations: Registration[]
}

export type DashboardData = {
  stats: DashboardStats
  daily: Array<{ date: string; count: number }>
  trackBreakdown: Array<{ track: string; label: string; count: number }>
  broadcasts: BroadcastRecord[]
  registrations: Registration[]
  dayCounts?: Array<{ date: string; count: number }>
}

export type AdminUser = {
  name: string
  email: string
  role: string
}

export type AdminScope = "overview" | "students" | "broadcast"

type CacheBucket = {
  overview?: { data: OverviewData; fetchedAt: number }
  students?: { data: StudentsData; fetchedAt: number }
  broadcast?: { data: BroadcastData; fetchedAt: number }
}

const TTL_MS = 60_000

const g = globalThis as typeof globalThis & {
  __techupAdminScopeCache?: CacheBucket
}

function getScopeCache(): CacheBucket {
  if (!g.__techupAdminScopeCache) g.__techupAdminScopeCache = {}
  return g.__techupAdminScopeCache
}

export function clearAdminDashboardCache() {
  g.__techupAdminScopeCache = {}
}

function isFresh(fetchedAt?: number) {
  if (!fetchedAt) return false
  return Date.now() - fetchedAt < TTL_MS
}

type ScopeResultMap = {
  overview: OverviewData
  students: StudentsData
  broadcast: BroadcastData
}

async function fetchScope<S extends AdminScope>(
  scope: S,
): Promise<ScopeResultMap[S]> {
  const response = await fetch(`/api/admin/registrations?scope=${scope}`)
  const payload = (await response.json()) as DashboardData &
    OverviewData & { error?: string }

  if (!response.ok) {
    throw new Error(payload.error || "Could not load dashboard data.")
  }

  if (scope === "overview") {
    return {
      stats: payload.stats,
      daily: payload.daily || [],
      trackBreakdown: payload.trackBreakdown || [],
      dayCounts: payload.dayCounts || [],
    } as ScopeResultMap[S]
  }

  if (scope === "broadcast") {
    return {
      broadcasts: payload.broadcasts || [],
      registrations: payload.registrations || [],
    } as ScopeResultMap[S]
  }

  return {
    stats: payload.stats,
    registrations: payload.registrations || [],
  } as ScopeResultMap[S]
}

function useAdminScope<S extends AdminScope>(scope: S) {
  const session = useSessionUser()
  const cached = getScopeCache()[scope] as
    | { data: ScopeResultMap[S]; fetchedAt: number }
    | undefined

  const [data, setData] = useState<ScopeResultMap[S] | null>(
    cached?.data ?? null,
  )
  const [loading, setLoading] = useState(!cached?.data)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")

  const load = useCallback(
    async (options?: { silent?: boolean; force?: boolean }) => {
      const existing = getScopeCache()[scope] as
        | { data: ScopeResultMap[S]; fetchedAt: number }
        | undefined
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
        const next = await fetchScope(scope)
        getScopeCache()[scope] = {
          data: next,
          fetchedAt: Date.now(),
        } as CacheBucket[typeof scope]
        setData(next)
        setError("")
      } catch (err) {
        if (!existing?.data) {
          setError(
            err instanceof Error
              ? err.message
              : "Network error while loading dashboard.",
          )
        }
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [scope],
  )

  useEffect(() => {
    const existing = getScopeCache()[scope] as
      | { data: ScopeResultMap[S]; fetchedAt: number }
      | undefined
    void load({
      silent: Boolean(existing?.data),
      force: !isFresh(existing?.fetchedAt),
    })
  }, [load, scope])

  return {
    user: session.user
      ? {
          name: session.user.name,
          email: session.user.email,
          role: session.user.role,
        }
      : null,
    data,
    loading,
    refreshing,
    error,
    reload: () => load({ silent: Boolean(data), force: true }),
  }
}

export function useAdminOverview() {
  return useAdminScope("overview")
}

export function useAdminStudents() {
  return useAdminScope("students")
}

export function useAdminBroadcast() {
  return useAdminScope("broadcast")
}

/** @deprecated Prefer scoped hooks. */
export function useAdminDashboard() {
  const students = useAdminStudents()
  return {
    ...students,
    data: students.data
      ? ({
          stats: students.data.stats,
          daily: [],
          trackBreakdown: [],
          broadcasts: [],
          registrations: students.data.registrations,
        } satisfies DashboardData)
      : null,
  }
}
