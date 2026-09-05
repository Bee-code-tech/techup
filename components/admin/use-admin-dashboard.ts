"use client"

import { useCallback, useEffect, useState } from "react"

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

export type DashboardData = {
  stats: {
    total: number
    today: number
    yesterday: number
    week: number
    month: number
    tracks: number
    topTrack: { track: string; label: string; count: number } | null
  }
  daily: Array<{ date: string; count: number }>
  trackBreakdown: Array<{ track: string; label: string; count: number }>
  broadcasts: BroadcastRecord[]
  registrations: Registration[]
}

export type AdminUser = {
  name: string
  email: string
  role: string
}

export function useAdminDashboard() {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const [meRes, dataRes] = await Promise.all([
        fetch("/api/admin/me"),
        fetch("/api/admin/registrations"),
      ])
      const mePayload = (await meRes.json()) as { user?: AdminUser }
      const payload = (await dataRes.json()) as DashboardData & { error?: string }

      if (mePayload.user) setUser(mePayload.user)
      if (!dataRes.ok) {
        setError(payload.error || "Could not load dashboard data.")
        return
      }
      setData(payload)
    } catch {
      setError("Network error while loading dashboard.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return { user, data, loading, error, reload: load }
}
