"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { useAdminDashboard } from "@/components/admin/use-admin-dashboard"
import { Button } from "@/components/ui/button"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

export function DashboardShell({
  title,
  children,
}: {
  title: string
  children: (args: ReturnType<typeof useAdminDashboard>) => React.ReactNode
}) {
  const dashboard = useAdminDashboard()

  return (
    <TooltipProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 14)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" user={dashboard.user} />
        <SidebarInset>
          <SiteHeader title={title} />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              {dashboard.loading ? (
                <div className="flex flex-1 items-center justify-center py-24 text-sm text-muted-foreground">
                  Loading dashboard...
                </div>
              ) : dashboard.error || !dashboard.data ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24">
                  <p className="text-sm text-destructive">
                    {dashboard.error || "Dashboard unavailable."}
                  </p>
                  <Button onClick={() => void dashboard.reload()}>Retry</Button>
                </div>
              ) : (
                children(dashboard)
              )}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
