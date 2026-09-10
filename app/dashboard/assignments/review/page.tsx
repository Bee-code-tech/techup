"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

import { TutorAssignmentsPanel } from "@/components/dashboard/tutor-assignments-panel"

function ReviewInner() {
  const params = useSearchParams()
  return <TutorAssignmentsPanel initialId={params.get("id")} />
}

export default function TutorAssignmentsPage() {
  return (
    <Suspense
      fallback={
        <div className="px-4 py-8 text-sm text-muted-foreground lg:px-6">
          Loading assignments…
        </div>
      }
    >
      <ReviewInner />
    </Suspense>
  )
}
