"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"

import { courseHref } from "@/components/dashboard/learn-courses"
import { LearningPanelSkeleton } from "@/components/dashboard/page-skeletons"
import { useStudentLearn } from "@/components/dashboard/use-student-learn"

export default function CourseEntryPage() {
  const params = useParams<{ courseId: string }>()
  const router = useRouter()
  const { data, loading } = useStudentLearn()

  useEffect(() => {
    if (loading && !data) return
    const course = data?.courses.find((row) => row.id === params.courseId)
    if (!course) {
      router.replace("/dashboard/learn")
      return
    }
    router.replace(courseHref(course))
  }, [data, loading, params.courseId, router])

  return <LearningPanelSkeleton />
}
