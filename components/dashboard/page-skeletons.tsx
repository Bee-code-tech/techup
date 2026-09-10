"use client"

import { Skeleton } from "@/components/ui/skeleton"
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export function SidebarNavSkeleton({ count = 4 }: { count?: number }) {
  const widths = ["72%", "64%", "80%", "58%", "76%", "68%"]
  return (
    <SidebarMenu className="gap-1 px-2">
      {Array.from({ length: count }).map((_, i) => (
        <SidebarMenuItem key={i}>
          <SidebarMenuSkeleton showIcon width={widths[i % widths.length]} />
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}

/** Matches StatCards grid — values only, labels stay real when parent provides them. */
export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4"
      aria-busy
      aria-label="Loading stats"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl border border-black/[0.05] bg-white p-5 shadow-[0_14px_40px_-30px_rgba(0,32,111,0.28)]"
        >
          <div className="flex items-center gap-2.5">
            <Skeleton className="size-9 rounded-xl" />
            <Skeleton className="h-3 w-24 rounded-md" />
          </div>
          <Skeleton className="mt-4 h-9 w-20 rounded-lg" />
          <div className="mt-3 space-y-2">
            <Skeleton className="h-3 w-full max-w-[12rem] rounded-md" />
            <Skeleton className="h-3 w-full max-w-[9rem] rounded-md" />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Registration pace chart shell with real chrome, skeleton for the plot. */
export function OverviewChartSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-xl border border-black/5 bg-linear-to-b from-white to-[#f6f8fc] shadow-[0_18px_50px_-36px_rgba(0,32,111,0.32)] ring-1 ring-foreground/10"
      aria-busy
      aria-label="Loading chart"
    >
      <div className="space-y-1.5 border-b border-black/4 px-5 pt-5 pb-4 sm:px-6">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-[#00206F] uppercase">
          Momentum
        </p>
        <h3 className="text-xl font-semibold tracking-tight text-[#001752]">
          Registration pace
        </h3>
        <p className="text-[14px] text-muted-foreground">
          Daily signups for your selected week
        </p>
      </div>
      <div className="space-y-4 px-5 py-5 sm:px-6">
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-8 w-40 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
        <Skeleton className="h-56 w-full rounded-xl" />
      </div>
    </div>
  )
}

export function OverviewPageSkeleton() {
  return (
    <div className="flex flex-col gap-6 py-6 md:py-8">
      <StatCardsSkeleton />
      <div className="px-4 lg:px-6">
        <OverviewChartSkeleton />
      </div>
    </div>
  )
}

export function StudentsTableSkeleton() {
  return (
    <div className="flex flex-col gap-5 px-4 lg:px-6" aria-busy>
      <div>
        <h2 className="text-[1.35rem] font-semibold tracking-tight text-[#001752]">
          Registered students
        </h2>
        <p className="mt-1 text-[14.5px] text-muted-foreground">
          Loading roster…
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Skeleton className="h-11 w-full rounded-xl sm:flex-1" />
        <Skeleton className="h-11 w-full rounded-xl sm:w-56" />
      </div>
      <div className="admin-panel overflow-hidden">
        <div className="border-b border-black/[0.05] bg-[#f4f6fa]/90 px-4 py-3">
          <div className="flex gap-6">
            {["S/N", "Student", "Track", "WhatsApp", "Education", "Registered"].map(
              (label) => (
                <span
                  key={label}
                  className="hidden text-[12px] font-semibold tracking-[0.08em] text-muted-foreground uppercase first:inline sm:inline"
                >
                  {label}
                </span>
              ),
            )}
          </div>
        </div>
        <div className="divide-y divide-black/[0.05]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-4 py-3.5"
            >
              <Skeleton className="h-4 w-6 rounded-md" />
              <Skeleton className="size-9 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-3.5 w-40 rounded-md" />
                <Skeleton className="h-3 w-52 rounded-md" />
              </div>
              <Skeleton className="hidden h-6 w-24 rounded-lg sm:block" />
              <Skeleton className="hidden h-3.5 w-28 rounded-md md:block" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function StudentsPageSkeleton() {
  return (
    <div className="flex flex-col gap-6 py-6 md:py-8">
      <StatCardsSkeleton />
      <StudentsTableSkeleton />
    </div>
  )
}

export function BroadcastPageSkeleton() {
  return (
    <div className="flex flex-col gap-6 py-6 md:py-8" aria-busy>
      <StatCardsSkeleton />
      <div className="grid items-start gap-6 px-4 xl:grid-cols-[minmax(0,1fr)_28rem] xl:gap-8 lg:px-6">
        <div className="overflow-hidden rounded-[24px] border border-black/[0.05] bg-card shadow-[0_18px_50px_-36px_rgba(0,32,111,0.32)]">
          <div className="bg-[#00206F] px-5 py-6 text-white sm:px-6">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-white/55 uppercase">
              Campaign studio
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">
              Compose broadcast
            </h2>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-white/70">
              Name the campaign once. New students can get it later without
              duplicate sends.
            </p>
          </div>
          <div className="space-y-4 px-5 py-5 sm:px-6">
            <div className="grid gap-3 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-2xl" />
              ))}
            </div>
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>
        </div>
        <div className="overflow-hidden rounded-[24px] border border-black/5 bg-[#F4F7FC] p-5">
          <p className="text-sm font-semibold text-[#001752]">Email preview</p>
          <Skeleton className="mt-4 h-72 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}

/** Tutor roster rows matching premium tutor cards. */
export function TutorListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="divide-y divide-black/[0.05]" aria-busy aria-label="Loading tutors">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
        >
          <div className="flex items-start gap-3.5">
            <Skeleton className="size-12 rounded-2xl" />
            <div className="space-y-2 pt-0.5">
              <Skeleton className="h-4 w-36 rounded-md" />
              <Skeleton className="h-3 w-48 rounded-md" />
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-6 w-20 rounded-lg" />
                <Skeleton className="h-6 w-24 rounded-lg" />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Matches tutor My courses card grid (cover + badges + title). */
export function TutorCoursesSkeleton({
  count = 6,
  compact,
}: {
  count?: number
  compact?: boolean
}) {
  return (
    <div
      className={cn(!compact && "px-4 py-6 lg:px-6 md:py-8")}
      aria-busy
      aria-label="Loading courses"
    >
      {!compact ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-40 rounded-lg" />
            <Skeleton className="h-4 w-64 max-w-full rounded-md" />
          </div>
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      ) : null}
      <div
        className={cn(
          "grid gap-4 sm:grid-cols-2 xl:grid-cols-3",
          !compact && "mt-6",
        )}
      >
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl border border-black/10 bg-white"
          >
            <Skeleton className="aspect-video w-full rounded-none" />
            <div className="space-y-3 p-4">
              <div className="flex gap-1.5">
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="h-5 w-14 rounded-md" />
              </div>
              <Skeleton className="h-5 w-[80%] max-w-[14rem] rounded-md" />
              <Skeleton className="h-3 w-20 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/** @deprecated Prefer page-specific skeletons */
export function DashboardContentSkeleton({
  className,
}: {
  className?: string
}) {
  return (
    <div className={cn("py-6", className)}>
      <OverviewPageSkeleton />
    </div>
  )
}

/** Matches the student module learning panel layout. */
export function LearningPanelSkeleton() {
  return (
    <div
      className="flex flex-col gap-5 px-4 py-6 lg:px-6 md:py-8"
      aria-busy
      aria-label="Loading module"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-28 rounded-md" />
          <Skeleton className="h-8 w-72 max-w-full rounded-lg" />
          <Skeleton className="h-4 w-40 rounded-md" />
        </div>
        <Skeleton className="h-10 w-56 rounded-xl" />
      </div>
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)]">
        <Skeleton className="aspect-video w-full rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-36 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export function DashboardListSkeleton({ rows = 5 }: { rows?: number }) {
  return <TutorListSkeleton rows={rows} />
}

export function DashboardCardsSkeleton({ count = 3 }: { count?: number }) {
  return <StatCardsSkeleton count={count} />
}
