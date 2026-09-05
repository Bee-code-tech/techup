"use client"

import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { SectionCards } from "@/components/section-cards"
import { DashboardShell } from "@/components/admin/dashboard-shell"

export function AdminOverviewPage() {
  return (
    <DashboardShell title="Dashboard">
      {({ data }) => (
        <div className="flex flex-col gap-6 py-6 md:py-8">
          <SectionCards
            total={data!.stats.total}
            today={data!.stats.today}
            yesterday={data!.stats.yesterday}
            week={data!.stats.week}
            month={data!.stats.month}
            tracks={data!.stats.tracks}
            topTrack={data!.stats.topTrack}
          />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive registrations={data!.registrations} />
          </div>
        </div>
      )}
    </DashboardShell>
  )
}
