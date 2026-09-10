"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import toast from "react-hot-toast"
import { BookOpenIcon, PlusIcon } from "lucide-react"

import { TutorCoursesSkeleton } from "@/components/dashboard/page-skeletons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type TrackOption = { id: string; label: string }

type CourseRow = {
  id: string
  track: string
  trackLabel: string
  title: string
  description: string
  coverUrl?: string | null
  published: boolean
  moduleCount: number
}

export default function TutorCoursesPage() {
  const router = useRouter()
  const [tracks, setTracks] = useState<TrackOption[]>([])
  const [courses, setCourses] = useState<CourseRow[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/tutor/courses")
      const payload = (await response.json()) as {
        tracks?: TrackOption[]
        courses?: CourseRow[]
        error?: string
      }
      if (!response.ok) {
        toast.error(payload.error || "Could not load courses.")
        return
      }
      setTracks(payload.tracks || [])
      setCourses(payload.courses || [])
    } catch {
      toast.error("Network error while loading courses.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function createDraft() {
    if (!tracks[0]?.id) {
      toast.error("You need a track assignment first.")
      return
    }
    setCreating(true)
    try {
      const response = await fetch("/api/tutor/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          track: tracks[0].id,
          title: "Untitled course",
          description: "",
        }),
      })
      const payload = (await response.json()) as {
        error?: string
        course?: { id: string }
      }
      if (!response.ok || !payload.course) {
        toast.error(payload.error || "Could not create course.")
        return
      }
      router.push(`/dashboard/courses/manage/${payload.course.id}/edit`)
    } catch {
      toast.error("Network error.")
    } finally {
      setCreating(false)
    }
  }

  if (loading) return <TutorCoursesSkeleton />

  return (
    <div className="px-4 py-6 lg:px-6 md:py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#001752]">
            My courses
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Build modules, upload media, and publish when ready.
          </p>
        </div>
        <Button
          type="button"
          disabled={creating}
          onClick={() => void createDraft()}
          className="h-10 gap-2 rounded-xl bg-[#00206F] text-white hover:bg-[#001752]"
        >
          <PlusIcon className="size-4" />
          {creating ? "Creating…" : "New course"}
        </Button>
      </div>

      {courses.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-black/10 px-6 py-16 text-center">
          <BookOpenIcon className="mx-auto size-8 text-[#FB7801]" />
          <p className="mt-3 text-sm font-medium text-[#001752]">
            No courses yet
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a draft and set it up module by module.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/dashboard/courses/manage/${course.id}/edit`}
              className="admin-press group overflow-hidden rounded-xl border border-black/10 bg-white transition-[border-color,box-shadow] hover:border-[#00206F]/20"
            >
              <div className="relative aspect-video bg-[#eef2f9]">
                {course.coverUrl ? (
                  <Image
                    src={course.coverUrl}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <BookOpenIcon className="size-8 opacity-40" />
                  </div>
                )}
              </div>
              <div className="space-y-2 p-4">
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="secondary" className="rounded-md text-[10px]">
                    {course.trackLabel}
                  </Badge>
                  <Badge
                    className={
                      course.published
                        ? "rounded-md border-none bg-emerald-100 text-[10px] text-emerald-700 hover:bg-emerald-100"
                        : "rounded-md text-[10px]"
                    }
                    variant={course.published ? "default" : "secondary"}
                  >
                    {course.published ? "Published" : "Draft"}
                  </Badge>
                </div>
                <h2 className="line-clamp-2 font-semibold text-[#001752]">
                  {course.title}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {course.moduleCount} module
                  {course.moduleCount === 1 ? "" : "s"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
