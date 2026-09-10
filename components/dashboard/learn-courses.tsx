"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"

export type LearnModule = {
  id: string
  title: string
  description: string
  access: string
  unlocked: boolean
  lockedReason: "paid" | "sequence" | null
  progress: {
    videoCompleted: boolean
    quizPassed: boolean
    quizScore: number | null
  } | null
}

export type LearnCourse = {
  id: string
  title: string
  description: string
  coverUrl?: string | null
  modules: LearnModule[]
}

const TRACK_COVERS: Record<string, string> = {
  frontend: "/course-frontend.jpg",
  backend: "/course-backend.jpg",
  uiux: "/course-ux.jpg",
  graphic: "/course-graphic.jpg",
  data: "/course-data.jpg",
}

function courseCover(
  course: LearnCourse,
  track: string | null,
  index: number,
) {
  if (course.coverUrl) return course.coverUrl
  if (track && TRACK_COVERS[track]) return TRACK_COVERS[track]
  const covers = Object.values(TRACK_COVERS)
  return covers[index % covers.length]
}

export function courseHref(course: LearnCourse) {
  const continueModule =
    course.modules.find(
      (m) =>
        m.unlocked &&
        m.lockedReason == null &&
        !m.progress?.quizPassed,
    ) ??
    course.modules.find((m) => m.unlocked && m.lockedReason == null) ??
    course.modules[0]

  if (continueModule) {
    return `/dashboard/learn/course/${course.id}/${continueModule.id}`
  }
  return `/dashboard/learn/course/${course.id}`
}

function courseStats(course: LearnCourse) {
  const total = course.modules.length
  const completed = course.modules.filter((m) => m.progress?.quizPassed).length
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100)

  const status: "complete" | "in_progress" | "not_started" =
    completed === total && total > 0
      ? "complete"
      : completed > 0 ||
          course.modules.some((m) => m.progress?.videoCompleted)
        ? "in_progress"
        : "not_started"

  return { total, completed, percent, status }
}

function statusLabel(status: "complete" | "in_progress" | "not_started") {
  if (status === "complete") return "Completed"
  if (status === "in_progress") return "In progress"
  return "Not started"
}

export function LearnCoursesGrid({
  track,
  courses,
}: {
  track: string | null
  courses: LearnCourse[]
}) {
  if (courses.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-black/10 bg-white/70 px-5 py-14 text-center">
        <Sparkles className="mx-auto size-6 text-[#FB7801]" aria-hidden />
        <p className="mt-3 text-sm font-medium text-[#001752]">
          No published courses yet
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Your tutor will publish modules here soon.
        </p>
      </div>
    )
  }

  return (
    <div className="admin-stagger grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {courses.map((course, courseIndex) => {
        const stats = courseStats(course)
        const cover = courseCover(course, track, courseIndex)
        const href = courseHref(course)

        return (
          <Link
            key={course.id}
            href={href}
            className="admin-panel admin-card-hover admin-press group flex h-full flex-col overflow-hidden transition-[transform,box-shadow,border-color] duration-200"
          >
            <div className="relative aspect-video overflow-hidden bg-[#e8edf6] sm:aspect-wide">
              <Image
                src={cover}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 ease-[var(--ease-out)] group-hover:scale-[1.02]"
                priority={courseIndex < 2}
              />
            </div>

            <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "rounded-lg px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase",
                      stats.status === "complete"
                        ? "bg-emerald-50 text-emerald-700"
                        : stats.status === "in_progress"
                          ? "bg-[#fff1e6] text-[#9a4d00]"
                          : "bg-[#eef2f9] text-[#00206F]",
                    )}
                  >
                    {statusLabel(stats.status)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {stats.total} module{stats.total === 1 ? "" : "s"}
                  </span>
                </div>
                <h3 className="font-display text-base font-bold tracking-tight text-[#001752] sm:text-lg">
                  {course.title}
                </h3>
                {course.description ? (
                  <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {course.description}
                  </p>
                ) : null}
              </div>

              <div className="mt-auto space-y-3">
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>
                    <span className="font-semibold text-[#001752]">
                      {stats.completed}
                    </span>
                    /{stats.total} complete
                  </span>
                  <span className="font-semibold text-[#001752]">
                    {stats.percent}%
                  </span>
                </div>
                <div
                  className="h-1.5 overflow-hidden rounded-full bg-[#eef2f9]"
                  role="progressbar"
                  aria-valuenow={stats.percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${course.title} progress`}
                >
                  <div
                    className="learn-progress-fill h-full rounded-full bg-[#00206F]"
                    style={{ width: `${stats.percent}%` }}
                  />
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#00206F]">
                  {stats.status === "not_started"
                    ? "Open course"
                    : stats.status === "complete"
                      ? "Review course"
                      : "Continue"}
                  <ArrowRight
                    className="size-4 transition-transform duration-150 ease-[var(--ease-out)] group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

export function LearnCoursesSkeleton() {
  return (
    <div
      className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
      aria-busy
      aria-label="Loading courses"
    >
      {[0, 1, 2].map((i) => (
        <div key={i} className="admin-panel overflow-hidden">
          <div className="aspect-wide animate-pulse bg-[#e8edf6]" />
          <div className="space-y-3 p-5">
            <div className="h-3 w-24 animate-pulse rounded bg-[#e8edf6]" />
            <div className="h-5 w-3/4 animate-pulse rounded-lg bg-[#e8edf6]" />
            <div className="h-4 w-full animate-pulse rounded bg-[#e8edf6]" />
            <div className="h-1.5 w-full animate-pulse rounded-full bg-[#e8edf6]" />
          </div>
        </div>
      ))}
    </div>
  )
}
