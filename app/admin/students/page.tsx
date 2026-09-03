"use client"

import { DashboardShell } from "@/components/admin/dashboard-shell"
import { StudentsTable } from "@/components/admin/students-table"

export default function AdminStudentsPage() {
  return (
    <DashboardShell title="Students">
      {({ data }) => (
        <div className="flex flex-col gap-6 py-6 md:py-8">
          <StudentsTable registrations={data!.registrations} />
        </div>
      )}
    </DashboardShell>
  )
}
