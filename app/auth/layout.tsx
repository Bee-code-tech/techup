import { AppToaster } from "@/components/admin/toaster"

export const metadata = {
  title: "Sign in · TechUp Academy",
  robots: { index: false, follow: false },
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-svh bg-[#fafafa] text-foreground">
      {children}
      <AppToaster />
    </div>
  )
}
