"use client"

import { DashboardShell } from "@/components/admin/dashboard-shell"
import { StudentsStatCards } from "@/components/admin/students-stat-cards"
import { StudentsTable } from "@/components/admin/students-table"

export default function AdminStudentsPage() {
  return (
    <DashboardShell title="Students">
      {({ data, reload }) => (
        <div className="flex flex-col gap-6 py-6 md:py-8">
          <StudentsStatCards
            registrations={data!.registrations}
            stats={data!.stats}
          />
          <StudentsTable
            registrations={data!.registrations}
            onUpdated={() => void reload()}
          />
        </div>
      )}
    </DashboardShell>
  )
}
