"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"

import { LearningPanelSkeleton } from "@/components/dashboard/page-skeletons"

/** Legacy `/dashboard/learn/[moduleId]` → course-scoped learning route. */
export default function LegacyModuleRedirectPage() {
  const params = useParams<{ moduleId: string }>()
  const router = useRouter()

  useEffect(() => {
    let cancelled = false
    async function redirect() {
      try {
        const response = await fetch(`/api/student/modules/${params.moduleId}`)
        const payload = (await response.json()) as {
          module?: { courseId?: string; id?: string }
        }
        if (cancelled) return
        if (response.ok && payload.module?.courseId && payload.module.id) {
          router.replace(
            `/dashboard/learn/course/${payload.module.courseId}/${payload.module.id}`,
          )
          return
        }
      } catch {
        // fall through
      }
      if (!cancelled) router.replace("/dashboard/learn")
    }
    void redirect()
    return () => {
      cancelled = true
    }
  }, [params.moduleId, router])

  return <LearningPanelSkeleton />
}
