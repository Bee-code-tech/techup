"use client"

import { useCallback, useEffect, useState } from "react"

export type ProfileUser = {
  id: string
  name: string
  email: string
  role: string
  bio: string | null
  avatarUrl: string | null
  whatsapp: string | null
  age: number | null
  gender: string | null
  education: string | null
  laptop: string | null
  track: string | null
  accessTier: string
  mustChangePassword: boolean
}

type CacheEntry = {
  data: ProfileUser
  fetchedAt: number
}

const TTL_MS = 60_000

const g = globalThis as typeof globalThis & {
  __techupProfileCache?: CacheEntry | null
}

function getCache() {
  return g.__techupProfileCache ?? null
}

function setCache(entry: CacheEntry | null) {
  g.__techupProfileCache = entry
}

export function clearProfileCache() {
  setCache(null)
}

export function writeProfileCache(user: ProfileUser) {
  setCache({ data: user, fetchedAt: Date.now() })
}

function isFresh(fetchedAt?: number) {
  if (!fetchedAt) return false
  return Date.now() - fetchedAt < TTL_MS
}

async function fetchProfile(): Promise<ProfileUser> {
  const response = await fetch("/api/auth/profile")
  const payload = (await response.json()) as {
    user?: ProfileUser
    error?: string
  }
  if (!response.ok || !payload.user) {
    throw new Error(payload.error || "Could not load profile.")
  }
  return payload.user
}

export function useProfile() {
  const cached = getCache()
  const [profile, setProfile] = useState<ProfileUser | null>(
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
        setProfile(existing.data)
        setLoading(false)
        return
      }

      if (silent) setRefreshing(true)
      else {
        setLoading(true)
        setError("")
      }

      try {
        const next = await fetchProfile()
        writeProfileCache(next)
        setProfile(next)
        setError("")
      } catch (err) {
        if (!existing?.data) {
          setError(
            err instanceof Error
              ? err.message
              : "Network error while loading profile.",
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

  const applyProfile = useCallback((user: ProfileUser) => {
    writeProfileCache(user)
    setProfile(user)
  }, [])

  return {
    profile,
    loading,
    refreshing,
    error,
    reload: (options?: { silent?: boolean }) =>
      load({
        silent: options?.silent ?? Boolean(getCache()?.data),
        force: true,
      }),
    applyProfile,
  }
}
