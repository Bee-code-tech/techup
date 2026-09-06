import { AppToaster } from "@/components/admin/toaster"
import { DashboardProviders } from "@/components/dashboard/dashboard-providers"

export const metadata = {
  title: "Dashboard · TechUp Academy",
  robots: { index: false, follow: false },
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <DashboardProviders>{children}</DashboardProviders>
      <AppToaster />
    </div>
  )
}
