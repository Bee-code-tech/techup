"use client"

import { use } from "react"

import { CourseBuilder } from "@/components/dashboard/courses/course-builder"

export default function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = use(params)
  return <CourseBuilder courseId={courseId} />
}
