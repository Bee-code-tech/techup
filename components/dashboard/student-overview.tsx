"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo } from "react"
import type { LucideIcon } from "lucide-react"
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  BookOpenIcon,
  CheckCircle2Icon,
  CircleDashedIcon,
  LayersIcon,
  LockIcon,
  MailIcon,
  PlayCircleIcon,
  SparklesIcon,
  TrophyIcon,
} from "lucide-react"

import {
  courseHref,
  type LearnCourse,
  type LearnModule,
} from "@/components/dashboard/learn-courses"
import { StudentLiveCallout } from "@/components/dashboard/student-live-callout"
import { useSessionUser } from "@/components/dashboard/use-session"
import { useStudentLearn } from "@/components/dashboard/use-student-learn"
import { Skeleton } from "@/components/ui/skeleton"
import { bootcampTracks } from "@/lib/bootcamp"
import { cn } from "@/lib/utils"

const TRACK_COVERS: Record<string, string> = {
  frontend: "/course-frontend.jpg",
  backend: "/course-backend.jpg",
  uiux: "/course-ux.jpg",
  graphic: "/course-graphic.jpg",
  data: "/course-data.jpg",
}

function findContinueTarget(courses: LearnCourse[]) {
  for (const course of courses) {
    const next = course.modules.find(
      (moduleRow) =>
        moduleRow.unlocked &&
        moduleRow.lockedReason == null &&
        !moduleRow.progress?.quizPassed,
    )
    if (next) {
      return { course, module: next }
    }
  }

  for (const course of courses) {
    const open = course.modules.find(
      (moduleRow) => moduleRow.unlocked && moduleRow.lockedReason == null,
    )
    if (open) return { course, module: open }
  }

  return null
}

function moduleStatus(moduleRow: LearnModule) {
  if (moduleRow.progress?.quizPassed) return "Completed"
  if (moduleRow.progress?.videoCompleted) return "Quiz ready"
  if (!moduleRow.unlocked || moduleRow.lockedReason) {
    return moduleRow.lockedReason === "paid" ? "Paid unlock" : "Locked"
  }
  return "Up next"
}

function tutorInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

export function StudentOverview() {
  const session = useSessionUser()
  const { data, loading } = useStudentLearn()
  const user = session.user

  const firstName = user?.name?.split(" ")[0] || "there"
  const track = data?.track ?? user?.track ?? null
  const trackLabel =
    data?.trackLabel ||
    (track ? bootcampTracks[track] : null) ||
    "your track"
  const courses = data?.courses ?? []
  const tutor = data?.tutor
  const awaiting = loading && !data

  const summary = useMemo(() => {
    const modules = courses.flatMap((course) => course.modules)
    const total = modules.length
    const completed = modules.filter((m) => m.progress?.quizPassed).length
    const quizReady = modules.filter(
      (m) => m.progress?.videoCompleted && !m.progress?.quizPassed,
    ).length
    const unlockedOpen = modules.filter(
      (m) =>
        m.unlocked &&
        m.lockedReason == null &&
        !m.progress?.quizPassed,
    ).length
    const inProgress = modules.filter(
      (m) =>
        !m.progress?.quizPassed &&
        (m.progress?.videoCompleted ||
          (m.unlocked && m.lockedReason == null && completed > 0)),
    ).length
    const paidLocked = modules.filter((m) => m.lockedReason === "paid").length
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100)
    const continueTarget = findContinueTarget(courses)
    const coursesDone = courses.filter((course) => {
      if (course.modules.length === 0) return false
      return course.modules.every((m) => m.progress?.quizPassed)
    }).length

    return {
      total,
      completed,
      quizReady,
      unlockedOpen,
      inProgress,
      paidLocked,
      percent,
      continueTarget,
      coursesDone,
      courseCount: courses.length,
    }
  }, [courses])

  return (
    <div className="flex flex-col gap-5 px-4 py-6 lg:px-6 md:py-8">
      <section className="admin-panel overflow-hidden">
        <div className="overflow-hidden bg-[#001752] px-5 py-6 text-white sm:px-7 sm:py-7">
          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.16em] text-white/55 uppercase">
                Overview
              </p>
              <h1 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Welcome back, {firstName}
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/72">
                {awaiting ? (
                  "Loading your learning snapshot…"
                ) : (
                  <>
                    You&apos;re on{" "}
                    <span className="font-semibold text-white">
                      {trackLabel}
                    </span>
                    . Pick up where you left off, check live class, and track
                    how far you&apos;ve come.
                  </>
                )}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-[11px] font-medium text-white/60">
                    Track progress
                  </p>
                  {awaiting ? (
                    <Skeleton className="mt-2 h-8 w-20 rounded-lg bg-white/15" />
                  ) : (
                    <p className="mt-1 text-3xl font-semibold tracking-tight">
                      {summary.percent}
                      <span className="text-base font-medium text-white/55">
                        %
                      </span>
                    </p>
                  )}
                </div>
                <p className="text-sm text-white/65">
                  {awaiting
                    ? "—"
                    : `${summary.completed}/${summary.total} modules`}
                </p>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/12">
                <div
                  className="h-full rounded-full bg-[#FB7801] transition-[width] duration-400 ease-out"
                  style={{ width: `${awaiting ? 0 : summary.percent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <StudentLiveCallout />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Modules completed"
          awaiting={awaiting}
          value={summary.completed}
          icon={TrophyIcon}
          accent="orange"
          detail={`${summary.completed} of ${summary.total} finished`}
        />
        <StatCard
          label="Active learning"
          awaiting={awaiting}
          value={summary.inProgress}
          icon={CircleDashedIcon}
          accent="navy"
          detail={
            summary.quizReady > 0
              ? `${summary.quizReady} quiz ready`
              : `${summary.unlockedOpen} lessons open`
          }
        />
        <StatCard
          label="Courses"
          awaiting={awaiting}
          value={summary.coursesDone}
          icon={LayersIcon}
          accent="green"
          detail={`${summary.coursesDone} of ${summary.courseCount} complete`}
        />
        <StatCard
          label="Access"
          awaiting={awaiting}
          value={user?.accessTier === "paid" ? "Paid" : "Free"}
          icon={user?.accessTier === "paid" ? BadgeCheckIcon : LockIcon}
          accent={user?.accessTier === "paid" ? "green" : "navy"}
          detail={
            summary.paidLocked > 0
              ? `${summary.paidLocked} paid modules locked`
              : "Full free-track access"
          }
        />
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
        <div className="space-y-5">
          <ContinueCard
            awaiting={awaiting}
            track={track}
            continueTarget={summary.continueTarget}
            hasCourses={courses.length > 0}
          />

          <section className="admin-panel overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-black/5 px-5 py-4 sm:px-6">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.14em] text-[#00206F]/65 uppercase">
                  Your courses
                </p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight text-[#001752]">
                  Progress by course
                </h2>
              </div>
              <Link
                href="/dashboard/learn"
                className="admin-press inline-flex items-center gap-1 text-sm font-semibold text-[#00206F]"
              >
                All courses
                <ArrowRightIcon className="size-3.5" aria-hidden />
              </Link>
            </div>

            {awaiting ? (
              <div className="space-y-3 p-5 sm:p-6">
                {[0, 1].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-xl" />
                ))}
              </div>
            ) : courses.length === 0 ? (
              <div className="px-5 py-10 text-center sm:px-6">
                <SparklesIcon
                  className="mx-auto size-6 text-[#FB7801]"
                  aria-hidden
                />
                <p className="mt-3 text-sm font-medium text-[#001752]">
                  No courses published yet
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your tutor will add modules for {trackLabel} soon.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-black/5">
                {courses.map((course, index) => {
                  const total = course.modules.length
                  const completed = course.modules.filter(
                    (m) => m.progress?.quizPassed,
                  ).length
                  const percent =
                    total === 0 ? 0 : Math.round((completed / total) * 100)
                  const cover =
                    (track && TRACK_COVERS[track]) ||
                    Object.values(TRACK_COVERS)[index % 5]

                  return (
                    <li key={course.id}>
                      <Link
                        href={courseHref(course)}
                        className="admin-press admin-card-hover flex items-center gap-4 px-5 py-4 transition-[background-color] duration-150 hover:bg-[#fbfcfe] sm:px-6"
                      >
                        <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-[#e8edf6]">
                          <Image
                            src={cover}
                            alt=""
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-[#001752]">
                                {course.title}
                              </p>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {completed}/{total} modules · {percent}%
                              </p>
                            </div>
                            <ArrowRightIcon
                              className="mt-1 size-4 shrink-0 text-[#00206F]/50"
                              aria-hidden
                            />
                          </div>
                          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#eef2f9]">
                            <div
                              className="h-full rounded-full bg-[#00206F] transition-[width] duration-300 ease-out"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-5">
          <section className="admin-panel p-5 sm:p-6">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-[#00206F]/65 uppercase">
              Your tutor
            </p>
            {awaiting ? (
              <div className="mt-4 space-y-3">
                <Skeleton className="size-12 rounded-xl" />
                <Skeleton className="h-4 w-36 rounded-md" />
                <Skeleton className="h-4 w-full rounded-md" />
              </div>
            ) : tutor ? (
              <div className="mt-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#00206F] text-sm font-semibold text-white">
                    {tutor.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={tutor.avatarUrl}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      tutorInitials(tutor.name)
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-[#001752]">
                      {tutor.name}
                    </h3>
                    <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                      {tutor.bio ||
                        `Track instructor for ${trackLabel}. Reach out if you get stuck.`}
                    </p>
                  </div>
                </div>
                <a
                  href={`mailto:${tutor.email}`}
                  className="admin-press mt-4 inline-flex h-10 items-center gap-2 rounded-xl border border-black/8 bg-[#f7f8fb] px-3 text-sm font-medium text-[#001752] transition-[background-color] duration-150 hover:bg-white"
                >
                  <MailIcon className="size-4 text-[#00206F]" aria-hidden />
                  Email tutor
                </a>
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                No tutor assigned to this track yet.
              </p>
            )}
          </section>

          <section className="overflow-hidden rounded-xl border border-[#FB7801]/20 bg-[#fff8f1] p-5 sm:p-6">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-[#9a4d00] uppercase">
              Quick tip
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[#7a4a1a]">
              Finish each module quiz to unlock the next lesson. Paid modules
              stay locked until you unlock them.
            </p>
            <Link
              href="/dashboard/learn"
              className="admin-press mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-[#00206F] px-4 text-sm font-semibold text-white hover:bg-[#001752]"
            >
              <BookOpenIcon className="size-4" aria-hidden />
              Open my learning
            </Link>
          </section>
        </aside>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  detail,
  awaiting,
}: {
  label: string
  value: string | number
  icon: LucideIcon
  accent: "navy" | "orange" | "green"
  detail: string
  awaiting: boolean
}) {
  return (
    <div className="admin-panel overflow-hidden px-5 py-5">
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl",
            accent === "orange" && "bg-[#fff1e6] text-[#FB7801]",
            accent === "green" && "bg-[#e8faf0] text-[#128c4a]",
            accent === "navy" && "bg-[#00206F]/8 text-[#00206F]",
          )}
        >
          <Icon className="size-4" strokeWidth={2.25} aria-hidden />
        </span>
        <p className="text-[12px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
          {label}
        </p>
      </div>

      {awaiting ? (
        <Skeleton className="mt-3 h-9 w-16 rounded-md" />
      ) : (
        <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-[#001752]">
          {typeof value === "number" ? value.toLocaleString("en-NG") : value}
        </p>
      )}

      {awaiting ? (
        <Skeleton className="mt-2 h-3.5 w-28 rounded" />
      ) : (
        <p className="mt-2 text-[13px] leading-snug text-muted-foreground">
          {detail}
        </p>
      )}
    </div>
  )
}

function ContinueCard({
  awaiting,
  track,
  continueTarget,
  hasCourses,
}: {
  awaiting: boolean
  track: string | null
  continueTarget: { course: LearnCourse; module: LearnModule } | null
  hasCourses: boolean
}) {
  if (awaiting) {
    return <Skeleton className="h-44 w-full rounded-xl" />
  }

  if (!hasCourses || !continueTarget) {
    return (
      <section className="admin-panel p-5 sm:p-6">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-[#00206F]/65 uppercase">
          Continue learning
        </p>
        <h2 className="mt-1 text-lg font-semibold text-[#001752]">
          {hasCourses ? "You’re all caught up" : "Nothing to continue yet"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {hasCourses
            ? "Every unlocked module is complete. Check back when new lessons drop."
            : "As soon as courses are published, your next lesson will show up here."}
        </p>
        <Link
          href="/dashboard/learn"
          className="admin-press mt-4 inline-flex h-11 items-center gap-2 rounded-xl bg-[#00206F] px-4 text-sm font-semibold text-white hover:bg-[#001752]"
        >
          Browse courses
          <ArrowRightIcon className="size-4" aria-hidden />
        </Link>
      </section>
    )
  }

  const { course, module } = continueTarget
  const cover =
    (track && TRACK_COVERS[track]) || "/course-frontend.jpg"
  const status = moduleStatus(module)
  const done = Boolean(module.progress?.quizPassed)

  return (
    <section className="admin-panel overflow-hidden">
      <div className="grid sm:grid-cols-[9.5rem_minmax(0,1fr)]">
        <div className="relative min-h-36 bg-[#e8edf6] sm:min-h-full">
          <Image
            src={cover}
            alt=""
            fill
            sizes="180px"
            className="object-cover"
            priority
          />
        </div>
        <div className="flex flex-col justify-between gap-4 p-5 sm:p-6">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.14em] text-[#00206F]/65 uppercase">
              Continue learning
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-[#001752]">
              {module.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {course.title} · {status}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={courseHref(course)}
              className="admin-press inline-flex h-11 items-center gap-2 rounded-xl bg-[#FB7801] px-4 text-sm font-semibold text-white hover:brightness-105"
            >
              {done ? (
                <CheckCircle2Icon className="size-4" aria-hidden />
              ) : (
                <PlayCircleIcon className="size-4" aria-hidden />
              )}
              {module.progress?.videoCompleted && !done
                ? "Take quiz"
                : done
                  ? "Review module"
                  : "Resume lesson"}
              <ArrowRightIcon className="size-4" aria-hidden />
            </Link>
            <span
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-semibold",
                done
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-[#eef2f9] text-[#00206F]",
              )}
            >
              {module.access}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
