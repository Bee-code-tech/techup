"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  BookOpenIcon,
  LayoutListIcon,
} from "lucide-react"

import { CoverForm } from "@/components/dashboard/courses/modular/cover-form"
import { ModulesForm } from "@/components/dashboard/courses/modular/modules-form"
import { PublishActions } from "@/components/dashboard/courses/modular/publish-actions"
import {
  DescriptionForm,
  TitleForm,
} from "@/components/dashboard/courses/modular/title-description-forms"
import { TrackForm } from "@/components/dashboard/courses/modular/track-form"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export type BuilderCourse = {
  id: string
  track: string
  trackLabel?: string
  title: string
  description: string
  coverUrl: string | null
  coverKey?: string | null
  published: boolean
  modules: Array<{
    id: string
    title: string
    access: string
    order: number
    videoUrl: string | null
    questions?: unknown[]
  }>
}

type TrackOption = { id: string; label: string }

export function CourseBuilder({ courseId }: { courseId: string }) {
  const router = useRouter()
  const [course, setCourse] = useState<BuilderCourse | null>(null)
  const [tracks, setTracks] = useState<TrackOption[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const [courseRes, listRes] = await Promise.all([
        fetch(`/api/tutor/courses/${courseId}`),
        fetch("/api/tutor/courses"),
      ])
      const coursePayload = (await courseRes.json()) as {
        course?: BuilderCourse
        error?: string
      }
      const listPayload = (await listRes.json()) as {
        tracks?: TrackOption[]
      }
      if (!courseRes.ok || !coursePayload.course) {
        toast.error(coursePayload.error || "Could not load course.")
        router.push("/dashboard/courses/manage")
        return
      }
      setCourse(coursePayload.course)
      setTracks(listPayload.tracks || [])
    } catch {
      toast.error("Network error.")
      router.push("/dashboard/courses/manage")
    } finally {
      setLoading(false)
    }
  }, [courseId, router])

  useEffect(() => {
    void load()
  }, [load])

  async function patchCourse(body: Record<string, unknown>) {
    const response = await fetch(`/api/tutor/courses/${courseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const payload = (await response.json()) as {
      error?: string
      course?: BuilderCourse
    }
    if (!response.ok || !payload.course) {
      throw new Error(payload.error || "Could not save.")
    }
    setCourse(payload.course)
    return payload.course
  }

  const checklist = useMemo(() => {
    if (!course) return []
    return [
      Boolean(course.title?.trim()),
      Boolean(course.description?.trim()),
      Boolean(course.coverUrl),
      Boolean(course.track),
      course.modules.length > 0,
    ]
  }, [course])

  const completed = checklist.filter(Boolean).length
  const canPublish = checklist.every(Boolean)

  if (loading || !course) {
    return (
      <div className="space-y-4 px-4 py-6 lg:px-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="px-4 py-6 lg:px-6 md:py-8">
      {!course.published ? (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          <AlertTriangleIcon className="size-4 shrink-0" />
          This course is unpublished. Students will not see it yet.
        </div>
      ) : null}

      <Link
        href="/dashboard/courses/manage"
        className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground transition-opacity hover:opacity-80"
      >
        <ArrowLeftIcon className="size-4" />
        Back to courses
      </Link>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#001752]">
            Course setup
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <p className="text-sm text-muted-foreground">
              Complete all fields ({completed}/{checklist.length})
            </p>
            {course.published ? (
              <Badge className="border-none bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                Published
              </Badge>
            ) : (
              <Badge variant="secondary">Draft</Badge>
            )}
          </div>
        </div>
        <PublishActions
          disabled={!canPublish && !course.published}
          published={course.published}
          onPublish={async () => {
            try {
              await patchCourse({ published: !course.published })
              toast.success(
                course.published ? "Course unpublished." : "Course published.",
              )
            } catch (err) {
              toast.error(
                err instanceof Error ? err.message : "Could not update status.",
              )
            }
          }}
          onDelete={async () => {
            try {
              const response = await fetch(`/api/tutor/courses/${courseId}`, {
                method: "DELETE",
              })
              const payload = (await response.json()) as { error?: string }
              if (!response.ok) {
                toast.error(payload.error || "Could not delete.")
                return
              }
              toast.success("Course deleted.")
              router.push("/dashboard/courses/manage")
            } catch {
              toast.error("Network error.")
            }
          }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <span className="rounded-xl bg-[#00206F]/8 p-2 text-[#00206F]">
              <BookOpenIcon className="size-5" />
            </span>
            <h2 className="text-lg font-semibold text-[#001752]">
              Customize course
            </h2>
          </div>
          <TitleForm
            initialTitle={course.title}
            onSave={async (title) => {
              try {
                await patchCourse({ title })
                toast.success("Title saved.")
              } catch (err) {
                toast.error(
                  err instanceof Error ? err.message : "Could not save title.",
                )
              }
            }}
          />
          <DescriptionForm
            initialDescription={course.description}
            onSave={async (description) => {
              try {
                await patchCourse({ description })
                toast.success("Description saved.")
              } catch (err) {
                toast.error(
                  err instanceof Error
                    ? err.message
                    : "Could not save description.",
                )
              }
            }}
          />
          <CoverForm
            initialUrl={course.coverUrl}
            onSave={async (payload) => {
              try {
                await patchCourse(payload)
              } catch (err) {
                toast.error(
                  err instanceof Error ? err.message : "Could not save cover.",
                )
                throw err
              }
            }}
          />
          <TrackForm
            initialTrack={course.track}
            tracks={tracks}
            onSave={async (track) => {
              try {
                await patchCourse({ track })
                toast.success("Track saved.")
              } catch (err) {
                toast.error(
                  err instanceof Error ? err.message : "Could not save track.",
                )
              }
            }}
          />
        </div>

        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <span className="rounded-xl bg-[#00206F]/8 p-2 text-[#00206F]">
              <LayoutListIcon className="size-5" />
            </span>
            <h2 className="text-lg font-semibold text-[#001752]">
              Course modules
            </h2>
          </div>
          <ModulesForm
            modules={course.modules.map((moduleRow) => ({
              id: moduleRow.id,
              title: moduleRow.title,
              access: moduleRow.access,
              order: moduleRow.order,
              videoUrl: moduleRow.videoUrl,
              questionCount: Array.isArray(moduleRow.questions)
                ? moduleRow.questions.length
                : 0,
            }))}
            onAdd={async (title) => {
              try {
                const response = await fetch(
                  `/api/tutor/courses/${courseId}/modules`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      title,
                      order: course.modules.length,
                    }),
                  },
                )
                const payload = (await response.json()) as { error?: string }
                if (!response.ok) {
                  toast.error(payload.error || "Could not add module.")
                  return
                }
                toast.success("Module added.")
                await load()
              } catch {
                toast.error("Network error.")
              }
            }}
            onReorder={async (moduleOrder) => {
              try {
                await patchCourse({ moduleOrder })
                toast.success("Module order saved.")
              } catch (err) {
                toast.error(
                  err instanceof Error ? err.message : "Could not reorder.",
                )
              }
            }}
            onEdit={(moduleId) => {
              router.push(
                `/dashboard/courses/manage/${courseId}/modules/${moduleId}`,
              )
            }}
          />
        </div>
      </div>
    </div>
  )
}
