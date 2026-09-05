"use client"

import { useCallback, useState } from "react"

import { BroadcastHistory } from "@/components/admin/broadcast-history"
import { BroadcastPanel } from "@/components/admin/broadcast-panel"
import { BroadcastStatCards } from "@/components/admin/broadcast-stat-cards"
import { DashboardShell } from "@/components/admin/dashboard-shell"
import type { BroadcastRecord } from "@/components/admin/use-admin-dashboard"

type BroadcastDraft = {
  campaignKey: string
  subject: string
  heading: string
  message: string
  ctaLabel: string
  ctaUrl: string
  tracks: string[]
}

export default function AdminBroadcastPage() {
  const [draft, setDraft] = useState<BroadcastDraft | null>(null)

  const handleReuse = useCallback((broadcast: BroadcastRecord) => {
    setDraft({
      campaignKey: broadcast.campaignKey,
      subject: broadcast.subject,
      heading: broadcast.heading,
      message: broadcast.body,
      ctaLabel: broadcast.ctaLabel,
      ctaUrl: broadcast.ctaUrl,
      tracks: broadcast.tracks,
    })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  return (
    <DashboardShell title="Broadcast">
      {({ data, reload }) => (
        <div className="flex flex-col gap-6 py-6 md:py-8">
          <BroadcastStatCards
            broadcasts={data!.broadcasts ?? []}
            registrations={data!.registrations}
          />
          <BroadcastPanel
            registrations={data!.registrations}
            draft={draft}
            onDraftConsumed={() => setDraft(null)}
            onSent={() => void reload()}
          />
          <div className="px-4 lg:px-6">
            <BroadcastHistory
              broadcasts={data!.broadcasts ?? []}
              onSent={() => void reload()}
              onReuse={handleReuse}
            />
          </div>
        </div>
      )}
    </DashboardShell>
  )
}
