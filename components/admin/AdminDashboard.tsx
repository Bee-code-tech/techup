"use client"

import Link from "next/link"

import { useAdminOverview } from "@/components/admin/use-admin-dashboard"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { OverviewPageSkeleton } from "@/components/dashboard/page-skeletons"
import { SolarIcon } from "@/components/icons/solar-icon"
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
      <div className="px-4 lg:px-6">
        <Link
          href="/dashboard/live/manage"
          className="flex items-center justify-between gap-4 rounded-2xl border border-[#00206F]/12 bg-[#f4f7fc] px-5 py-5"
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#00206F] text-white">
              <SolarIcon name="videocamera" className="size-5" />
            </span>
            <div>
              <p className="text-[11px] font-semibold tracking-[0.14em] text-[#00206F] uppercase">
                Live class
              </p>
              <p className="mt-1 text-lg font-semibold text-[#001752]">
                TechUp classroom
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Start or schedule an in-app class. Students join from Overview.
              </p>
            </div>
          </div>
          <span className="inline-flex h-11 shrink-0 items-center rounded-xl bg-[#00206F] px-4 text-sm font-semibold text-white">
            Go live
          </span>
        </Link>
      </div>
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
