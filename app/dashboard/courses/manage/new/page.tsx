"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

import { Skeleton } from "@/components/ui/skeleton"

/** Creates a draft course then redirects into the Hoa-style builder. */
export default function NewCourseRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        const listRes = await fetch("/api/tutor/courses")
        const listPayload = (await listRes.json()) as {
          tracks?: Array<{ id: string }>
          error?: string
        }
        if (!listRes.ok) {
          toast.error(listPayload.error || "Could not start course.")
          router.replace("/dashboard/courses/manage")
          return
        }
        const track = listPayload.tracks?.[0]?.id
        if (!track) {
          toast.error("Assign yourself to a track first.")
          router.replace("/dashboard/courses/manage")
          return
        }
        const response = await fetch("/api/tutor/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            track,
            title: "Untitled course",
            description: "",
          }),
        })
        const payload = (await response.json()) as {
          course?: { id: string }
          error?: string
        }
        if (cancelled) return
        if (!response.ok || !payload.course) {
          toast.error(payload.error || "Could not create course.")
          router.replace("/dashboard/courses/manage")
          return
        }
        router.replace(`/dashboard/courses/manage/${payload.course.id}/edit`)
      } catch {
        if (!cancelled) {
          toast.error("Network error.")
          router.replace("/dashboard/courses/manage")
        }
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [router])

  return (
    <div className="space-y-4 px-4 py-8 lg:px-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-40 w-full rounded-xl" />
      <p className="text-sm text-muted-foreground">Starting course setup…</p>
    </div>
  )
}
