"use client"

import { useAdminOverview } from "@/components/admin/use-admin-dashboard"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { OverviewPageSkeleton } from "@/components/dashboard/page-skeletons"
import { SectionCards } from "@/components/section-cards"
import { Button } from "@/components/ui/button"

/** Admin overview — stats + chart only (no full roster / broadcasts). */
export function AdminOverviewPage() {
  const dashboard = useAdminOverview()

  if (dashboard.error && !dashboard.data) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24">
        <p className="text-sm text-destructive">
          {dashboard.error || "Dashboard unavailable."}
        </p>
        <Button onClick={() => void dashboard.reload()}>Retry</Button>
      </div>
    )
  }

  if (dashboard.loading && !dashboard.data) {
    return <OverviewPageSkeleton />
  }

  if (!dashboard.data) return null

  return (
    <div className="flex flex-col gap-6 py-6 md:py-8">
      <SectionCards
        total={dashboard.data.stats.total}
        today={dashboard.data.stats.today}
        yesterday={dashboard.data.stats.yesterday}
        week={dashboard.data.stats.week}
        month={dashboard.data.stats.month}
        tracks={dashboard.data.stats.tracks}
        topTrack={dashboard.data.stats.topTrack}
      />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive dayCounts={dashboard.data.dayCounts} />
      </div>
    </div>
  )
}
