"use client"

import { BroadcastHistory } from "@/components/admin/broadcast-history"
import { BroadcastPanel } from "@/components/admin/broadcast-panel"
import { BroadcastStatCards } from "@/components/admin/broadcast-stat-cards"
import { DashboardShell } from "@/components/admin/dashboard-shell"

export default function AdminBroadcastPage() {
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
            onSent={() => void reload()}
          />
          <div className="px-4 lg:px-6">
            <BroadcastHistory broadcasts={data!.broadcasts ?? []} />
          </div>
        </div>
      )}
    </DashboardShell>
  )
}
