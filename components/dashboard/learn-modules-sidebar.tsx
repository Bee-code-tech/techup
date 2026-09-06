"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useMemo } from "react"
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  LockIcon,
  PlayCircleIcon,
} from "lucide-react"

import { BrandLogo } from "@/components/admin/brand-logo"
import type { LearnModule } from "@/components/dashboard/learn-courses"
import { useStudentLearn } from "@/components/dashboard/use-student-learn"
import { NavUser } from "@/components/nav-user"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

type DashUser = {
  name: string
  email: string
  role: string
  avatarUrl?: string | null
}

function moduleMeta(moduleRow: LearnModule) {
  if (!moduleRow.unlocked || moduleRow.lockedReason) {
    return {
      locked: true as const,
      hint: moduleRow.lockedReason === "paid" ? "Paid" : "Locked",
    }
  }
  if (moduleRow.progress?.quizPassed) {
    return { locked: false as const, hint: "Done" }
  }
  if (moduleRow.progress?.videoCompleted) {
    return { locked: false as const, hint: "Quiz" }
  }
  return { locked: false as const, hint: "Start" }
}

export function LearnModulesSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: DashUser
}) {
  const params = useParams<{ courseId?: string; moduleId?: string }>()
  const courseId = params.courseId
  const activeModuleId = params.moduleId

  const { data, loading, error } = useStudentLearn()

  const course = useMemo(
    () => data?.courses.find((row) => row.id === courseId) ?? null,
    [data?.courses, courseId],
  )

  const completed =
    course?.modules.filter((m) => m.progress?.quizPassed).length ?? 0
  const total = course?.modules.length ?? 0
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100)
  const awaitingData = loading && !data

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="gap-3 border-b border-sidebar-border pb-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="gap-3 px-2"
              render={<Link href="/dashboard/learn" />}
            >
              <BrandLogo size={36} />
              <span className="flex min-w-0 flex-col items-start gap-0.5">
                <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <ArrowLeftIcon className="size-3" aria-hidden />
                  My learning
                </span>
                <span className="truncate text-sm font-semibold text-[#001752]">
                  {awaitingData ? "Loading…" : course?.title || "Course"}
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="px-2">
          <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
            <span>
              {completed}/{total} modules
            </span>
            <span className="font-semibold text-[#001752]">{percent}%</span>
          </div>
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[#eef2f9]">
            <div
              className="h-full rounded-full bg-[#00206F] transition-[width] duration-300 ease-[var(--ease-out)]"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-1 py-2">
        {awaitingData ? (
          <div className="space-y-2 px-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : error && !course ? (
          <p className="px-3 py-4 text-sm text-destructive">{error}</p>
        ) : !course ? (
          <p className="px-3 py-4 text-sm text-muted-foreground">
            Course not found.
          </p>
        ) : (
          <nav aria-label="Course modules" className="flex flex-col gap-1 px-1">
            {course.modules.map((moduleRow, index) => {
              const meta = moduleMeta(moduleRow)
              const active = moduleRow.id === activeModuleId
              const href = `/dashboard/learn/course/${courseId}/${moduleRow.id}`

              if (meta.locked) {
                return (
                  <div
                    key={moduleRow.id}
                    className="flex items-start gap-3 rounded-xl px-2.5 py-2.5 opacity-55"
                    aria-disabled
                  >
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#eef2f9] text-[11px] font-semibold text-[#00206F]/70">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 text-sm font-medium text-[#001752]/80">
                        {moduleRow.title}
                      </span>
                      <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                        <LockIcon className="size-3" aria-hidden />
                        {meta.hint}
                      </span>
                    </span>
                  </div>
                )
              }

              return (
                <Link
                  key={moduleRow.id}
                  href={href}
                  className={cn(
                    "admin-press flex items-start gap-3 rounded-xl px-2.5 py-2.5 transition-[background-color,color] duration-150",
                    active
                      ? "bg-[#00206F] text-white"
                      : "text-[#001752] hover:bg-[#eef2f9]",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-semibold",
                      active
                        ? "bg-white/15 text-white"
                        : "bg-[#eef2f9] text-[#00206F]",
                    )}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-sm font-medium">
                      {moduleRow.title}
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 inline-flex items-center gap-1 text-[11px]",
                        active ? "text-white/75" : "text-muted-foreground",
                      )}
                    >
                      {moduleRow.progress?.quizPassed ? (
                        <CheckCircle2Icon className="size-3" aria-hidden />
                      ) : (
                        <PlayCircleIcon className="size-3" aria-hidden />
                      )}
                      {meta.hint}
                      {moduleRow.access === "paid" ? " · Paid" : ""}
                    </span>
                  </span>
                </Link>
              )
            })}
          </nav>
        )}
      </SidebarContent>

      <SidebarFooter>
        <NavUser
          user={{
            name: user.name,
            email: user.email,
            avatar: user.avatarUrl || "",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
