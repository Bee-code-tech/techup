"use client"

import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { SectionCards } from "@/components/section-cards"
import { DashboardShell } from "@/components/admin/dashboard-shell"

export function AdminOverviewPage() {
  return (
    <DashboardShell title="Dashboard">
      {({ data }) => {
        const week = data!.daily.reduce((sum, day) => sum + day.count, 0)
        return (
          <div className="flex flex-col gap-6 py-6 md:py-8">
            <SectionCards
              total={data!.stats.total}
              today={data!.stats.today}
              tracks={data!.stats.tracks}
              week={week}
            />
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive data={data!.daily} />
            </div>
          </div>
        )
      }}
    </DashboardShell>
  )
}
