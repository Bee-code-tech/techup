"use client"

import { SolarIcon } from "@/components/icons/solar-icon"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import { TutorCoursesSkeleton } from "@/components/dashboard/page-skeletons"
import { useSessionUser } from "@/components/dashboard/use-session"
import { Select } from "@/components/marketing/Select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type TrackOption = { id: string; label: string }
type TutorOption = { id: string; name: string; tracks: string[] }

type CourseRow = {
  id: string
  track: string
  trackLabel: string
  title: string
  description: string
  coverUrl?: string | null
  published: boolean
  moduleCount: number
  tutor?: { id: string; name: string; email: string } | null
}

export default function TutorCoursesPage() {
  const router = useRouter()
  const session = useSessionUser()
  const isAdmin = session.user?.role === "admin"
  const [tracks, setTracks] = useState<TrackOption[]>([])
  const [tutors, setTutors] = useState<TutorOption[]>([])
  const [courses, setCourses] = useState<CourseRow[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [trackFilter, setTrackFilter] = useState("all")
  const [tutorFilter, setTutorFilter] = useState("all")

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/tutor/courses")
      const payload = (await response.json()) as {
        tracks?: TrackOption[]
        tutors?: TutorOption[]
        courses?: CourseRow[]
        error?: string
      }
      if (!response.ok) {
        toast.error(payload.error || "Could not load courses.")
        return
      }
      setTracks(payload.tracks || [])
      setTutors(payload.tutors || [])
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

  const visibleCourses = useMemo(
    () =>
      courses.filter((course) => {
        if (trackFilter !== "all" && course.track !== trackFilter) return false
        if (tutorFilter !== "all" && course.tutor?.id !== tutorFilter) {
          return false
        }
        return true
      }),
    [courses, trackFilter, tutorFilter],
  )

  const tutorsForCreate = useMemo(() => {
    const track =
      trackFilter !== "all" ? trackFilter : tracks[0]?.id ?? ""
    return tutors.filter((tutor) => tutor.tracks.includes(track))
  }, [trackFilter, tracks, tutors])

  async function createDraft() {
    const track =
      trackFilter !== "all" ? trackFilter : tracks[0]?.id ?? ""
    if (!track) {
      toast.error(
        isAdmin
          ? "Pick a track first."
          : "You need a track assignment first.",
      )
      return
    }
    const tutorId =
      isAdmin && tutorFilter !== "all" ? tutorFilter : undefined
    if (isAdmin && !tutorId && tutorsForCreate.length === 0) {
      toast.error("Assign a tutor to this track before creating a course.")
      return
    }

    setCreating(true)
    try {
      const response = await fetch("/api/tutor/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          track,
          title: "Untitled course",
          description: "",
          tutorId,
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
            {isAdmin ? "Courses" : "My courses"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isAdmin
              ? "Edit any tutor course, or create a draft and assign it to a tutor."
              : "Build modules, upload media, and publish when ready."}
          </p>
        </div>
        <Button
          type="button"
          disabled={creating}
          onClick={() => void createDraft()}
          className="h-10 gap-2 rounded-xl bg-[#00206F] text-white hover:bg-[#001752]"
        >
          <SolarIcon name="add-circle" className="size-4" />
          {creating ? "Creating…" : "New course"}
        </Button>
      </div>

      {isAdmin || tracks.length > 1 ? (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex flex-wrap gap-2">
            <FilterChip
              label="All tracks"
              active={trackFilter === "all"}
              onClick={() => setTrackFilter("all")}
            />
            {tracks.map((track) => (
              <FilterChip
                key={track.id}
                label={track.label}
                active={trackFilter === track.id}
                onClick={() => setTrackFilter(track.id)}
              />
            ))}
          </div>
          {isAdmin && tutors.length > 0 ? (
            <div className="sm:ml-auto sm:w-64">
              <Select
                value={tutorFilter}
                onValueChange={setTutorFilter}
                options={[
                  { value: "all", label: "All tutors" },
                  ...tutors.map((tutor) => ({
                    value: tutor.id,
                    label: tutor.name,
                  })),
                ]}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {visibleCourses.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-black/10 px-6 py-16 text-center">
          <SolarIcon name="book" className="mx-auto size-8 text-[#FB7801]" />
          <p className="mt-3 text-sm font-medium text-[#001752]">
            {courses.length === 0 ? "No courses yet" : "No courses match"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {courses.length === 0
              ? "Create a draft and set it up module by module."
              : "Try another track or tutor filter."}
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleCourses.map((course) => (
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
                    <SolarIcon name="book" className="size-8 opacity-40" />
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
                  {isAdmin && course.tutor?.name
                    ? ` · ${course.tutor.name}`
                    : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-8 rounded-lg px-3 text-xs font-semibold transition-colors",
        active
          ? "bg-[#00206F] text-white"
          : "bg-[#eef2f9] text-[#001752] hover:bg-[#e4eaf6]",
      )}
    >
      {label}
    </button>
  )
}
