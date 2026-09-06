"use client"

import { StudentsStatCards } from "@/components/admin/students-stat-cards"
import { StudentsTable } from "@/components/admin/students-table"
import { AdminStudentsShell } from "@/components/dashboard/admin-crm-shell"

export default function DashboardStudentsPage() {
  return (
    <AdminStudentsShell>
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
    </AdminStudentsShell>
  )
}
