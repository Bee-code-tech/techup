"use client"

import { BroadcastPanel } from "@/components/admin/broadcast-panel"
import { DashboardShell } from "@/components/admin/dashboard-shell"

export default function AdminBroadcastPage() {
  return (
    <DashboardShell title="Broadcast">
      {({ data }) => (
        <div className="flex flex-col gap-6 py-6 md:py-8">
          <BroadcastPanel registrations={data!.registrations} />
        </div>
      )}
    </DashboardShell>
  )
}
