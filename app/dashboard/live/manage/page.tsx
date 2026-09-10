"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/** Live creation moved to the tutor overview modal. */
export default function TutorLiveManagePage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/dashboard")
  }, [router])

  return (
    <div className="px-4 py-8 text-sm text-muted-foreground lg:px-6">
      Opening live class from overview…
    </div>
  )
}
