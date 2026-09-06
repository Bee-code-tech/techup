"use client"

import { DashboardChrome } from "@/components/dashboard/dashboard-chrome"
import { SessionProvider } from "@/components/dashboard/use-session"

export function DashboardProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <DashboardChrome>{children}</DashboardChrome>
    </SessionProvider>
  )
}
