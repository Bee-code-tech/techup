"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import { clearProfileCache } from "@/components/dashboard/use-profile"

export type SessionUser = {
  id: string
  name: string
  email: string
  role: string
  track?: string | null
  accessTier?: string
  mustChangePassword?: boolean
  avatarUrl?: string | null
  bio?: string | null
  whatsapp?: string | null
}

type SessionContextValue = {
  user: SessionUser | null
  /** True only while waiting for the first session payload (no cached user). */
  loading: boolean
  /** True while refreshing with a known user still on screen. */
  refreshing: boolean
  error: string
  reload: (options?: { silent?: boolean }) => Promise<void>
  clear: () => void
}

type CacheShape = { user: SessionUser | null }

const g = globalThis as typeof globalThis & {
  __techupSessionCache?: CacheShape
}

function getCache(): CacheShape {
  if (!g.__techupSessionCache) {
    g.__techupSessionCache = { user: null }
  }
  return g.__techupSessionCache
}

export function clearSessionCache() {
  getCache().user = null
  clearProfileCache()
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const cache = getCache()
  const [user, setUser] = useState<SessionUser | null>(cache.user)
  const [loading, setLoading] = useState(!cache.user)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")

  const clear = useCallback(() => {
    clearSessionCache()
    setUser(null)
    setError("")
    setLoading(false)
    setRefreshing(false)
  }, [])

  const reload = useCallback(async (options?: { silent?: boolean }) => {
    const hasCached = Boolean(getCache().user)
    const silent = options?.silent ?? hasCached

    if (silent) setRefreshing(true)
    else {
      setLoading(true)
      setError("")
    }

    try {
      const response = await fetch("/api/auth/me")
      const payload = (await response.json()) as {
        user?: SessionUser
        error?: string
      }

      if (!response.ok) {
        clearSessionCache()
        setUser(null)
        setError(payload.error || "Could not load session.")
        return
      }

      const next = payload.user || null
      getCache().user = next
      setUser(next)
      setError("")
    } catch {
      if (!getCache().user) {
        setUser(null)
        setError("Network error while loading session.")
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    void reload({ silent: Boolean(getCache().user) })
  }, [reload])

  const value = useMemo(
    () => ({ user, loading, refreshing, error, reload, clear }),
    [user, loading, refreshing, error, reload, clear],
  )

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  )
}

export function useSessionUser() {
  const ctx = useContext(SessionContext)
  if (!ctx) {
    throw new Error("useSessionUser must be used within SessionProvider")
  }
  return ctx
}
