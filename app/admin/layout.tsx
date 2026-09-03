import { AppToaster } from "@/components/admin/toaster"

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-svh bg-background text-foreground">
      {children}
      <AppToaster />
    </div>
  )
}
