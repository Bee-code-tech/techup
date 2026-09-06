"use client"

import { AdminOverviewPage } from "@/components/admin/AdminDashboard"
import { StudentOverview } from "@/components/dashboard/student-overview"
import { useSessionUser } from "@/components/dashboard/use-session"

export default function DashboardHomePage() {
  const { user, loading } = useSessionUser()

  if (loading && !user) {
    return (
      <div className="px-4 py-8 lg:px-6">
        <h2 className="text-2xl font-semibold tracking-tight text-[#001752]">
          Overview
        </h2>
        <p className="mt-2 text-[15px] text-muted-foreground">
          Loading your workspace…
        </p>
      </div>
    )
  }

  if (!user) return null

  if (user.role === "admin") {
    return <AdminOverviewPage />
  }

  if (user.role === "tutor") {
    return (
      <div className="px-4 py-8 lg:px-6">
        <h2 className="text-2xl font-semibold tracking-tight text-[#001752]">
          Welcome, {user.name?.split(" ")[0]}
        </h2>
        <p className="mt-2 max-w-xl text-[15px] text-muted-foreground">
          Create courses and modules for your tracks, run live classes, and
          review student assignments from the sidebar.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "My courses",
              href: "/dashboard/courses/manage",
              copy: "Build courses and modules",
            },
            {
              title: "Live class",
              href: "/dashboard/live/manage",
              copy: "Share Zoom or Meet links",
            },
            {
              title: "Assignments",
              href: "/dashboard/assignments/review",
              copy: "Review student submissions",
            },
          ].map((card) => (
            <a
              key={card.href}
              href={card.href}
              className="admin-press admin-card-hover rounded-xl border border-black/5 bg-white p-5 shadow-xs transition-[border-color,box-shadow,transform] duration-150"
            >
              <p className="font-semibold text-[#001752]">{card.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{card.copy}</p>
            </a>
          ))}
        </div>
      </div>
    )
  }

  return <StudentOverview />
}
