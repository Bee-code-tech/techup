"use client"

import {
  useAdminBroadcast,
  useAdminStudents,
} from "@/components/admin/use-admin-dashboard"
import {
  BroadcastPageSkeleton,
  StudentsPageSkeleton,
} from "@/components/dashboard/page-skeletons"
import { Button } from "@/components/ui/button"

/** Students CRM — fetches roster only. */
export function AdminStudentsShell({
  children,
}: {
  children: (args: ReturnType<typeof useAdminStudents>) => React.ReactNode
}) {
  const dashboard = useAdminStudents()

  if (dashboard.error && !dashboard.data) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24">
        <p className="text-sm text-destructive">
          {dashboard.error || "Dashboard unavailable."}
        </p>
        <Button onClick={() => void dashboard.reload()}>Retry</Button>
      </div>
    )
  }

  if (dashboard.loading && !dashboard.data) {
    return <StudentsPageSkeleton />
  }

  if (!dashboard.data) return null

  return <>{children(dashboard)}</>
}

/** Broadcast CRM — fetches campaigns + light audience only. */
export function AdminBroadcastShell({
  children,
}: {
  children: (args: ReturnType<typeof useAdminBroadcast>) => React.ReactNode
}) {
  const dashboard = useAdminBroadcast()

  if (dashboard.error && !dashboard.data) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24">
        <p className="text-sm text-destructive">
          {dashboard.error || "Dashboard unavailable."}
        </p>
        <Button onClick={() => void dashboard.reload()}>Retry</Button>
      </div>
    )
  }

  if (dashboard.loading && !dashboard.data) {
    return <BroadcastPageSkeleton />
  }

  if (!dashboard.data) return null

  return <>{children(dashboard)}</>
}

/** @deprecated Prefer AdminStudentsShell / AdminBroadcastShell */
export function AdminCrmShell({
  children,
}: {
  title?: string
  children: (args: ReturnType<typeof useAdminStudents>) => React.ReactNode
}) {
  return <AdminStudentsShell>{children}</AdminStudentsShell>
}
