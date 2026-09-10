"use client"

import { AdminOverviewPage } from "@/components/admin/AdminDashboard"
import { StudentOverview } from "@/components/dashboard/student-overview"
import { TutorOverview } from "@/components/dashboard/tutor-overview"
import { useSessionUser } from "@/components/dashboard/use-session"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardHomePage() {
  const { user, loading } = useSessionUser()

  if (loading && !user) {
    return (
      <div className="flex flex-col gap-5 px-4 py-6 lg:px-6 md:py-8">
        <Skeleton className="h-44 w-full rounded-xl" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!user) return null

  if (user.role === "admin") {
    return <AdminOverviewPage />
  }

  if (user.role === "tutor") {
    return <TutorOverview />
  }

  return <StudentOverview />
}
