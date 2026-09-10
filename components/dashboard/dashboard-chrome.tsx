"use client"

import { usePathname } from "next/navigation"

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { useSessionUser } from "@/components/dashboard/use-session"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

function titleForPath(pathname: string, role?: string | null) {
  if (pathname === "/dashboard") {
    if (role === "admin") return "Dashboard"
    if (role === "tutor") return "Tutor overview"
    return "Overview"
  }
  if (pathname.startsWith("/dashboard/students")) return "Students"
  if (pathname.startsWith("/dashboard/tutors")) return "Tutors"
  if (pathname.startsWith("/dashboard/broadcast")) return "Broadcast"
  if (pathname.startsWith("/dashboard/courses/manage")) return "My courses"
  if (pathname.startsWith("/dashboard/live/manage")) return "Live class"
  if (pathname.startsWith("/dashboard/assignments")) return "Assignments"
  if (pathname.startsWith("/dashboard/leaderboard")) return "Leaderboard"
  if (pathname.startsWith("/dashboard/settings")) return "Settings"
  if (pathname.startsWith("/dashboard/learn/course/")) return "Learning"
  if (pathname.startsWith("/dashboard/learn/")) return "Learning"
  if (pathname.startsWith("/dashboard/learn")) return "My learning"
  if (pathname === "/dashboard/live") return "Live class"
  return "Dashboard"
}

/** Persistent chrome for all /dashboard routes — sidebar does not remount on nav. */
export function DashboardChrome({ children }: { children: React.ReactNode }) {
  const session = useSessionUser()
  const pathname = usePathname()
  const title = titleForPath(pathname, session.user?.role)
  const awaitingFirstSession = session.loading && !session.user
  const inCoursePlayer = pathname.startsWith("/dashboard/learn/course/")

  return (
    <TooltipProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": inCoursePlayer
              ? "22.5rem"
              : "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 14)",
          } as React.CSSProperties
        }
      >
        <DashboardSidebar
          variant="inset"
          user={session.user}
          sessionLoading={awaitingFirstSession}
        />
        <SidebarInset>
          <div className="dashboard-shell flex min-h-0 flex-1 flex-col">
            <SiteHeader title={title} />
            <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                {awaitingFirstSession ? (
                  <div className="flex flex-col gap-4 px-4 py-8 lg:px-6">
                    <div>
                      <h2 className="text-2xl font-semibold tracking-tight text-[#001752]">
                        Overview
                      </h2>
                      <p className="mt-2 text-[15px] text-muted-foreground">
                        Loading your workspace…
                      </p>
                    </div>
                  </div>
                ) : session.error || !session.user ? (
                  <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24">
                    <p className="text-sm text-destructive">
                      {session.error || "Session unavailable."}
                    </p>
                    <Button
                      onClick={() => void session.reload({ silent: false })}
                    >
                      Retry
                    </Button>
                  </div>
                ) : (
                  children
                )}
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
