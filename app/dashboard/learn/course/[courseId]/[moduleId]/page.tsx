"use client"

import { ModuleLearningPanel } from "@/components/dashboard/module-learning-panel"
import { useParams } from "next/navigation"

export default function CourseModulePage() {
  const params = useParams<{ courseId: string; moduleId: string }>()
  return (
    <ModuleLearningPanel
      courseId={params.courseId}
      moduleId={params.moduleId}
    />
  )
}
