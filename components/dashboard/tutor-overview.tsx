"use client"

import Image from "next/image"
import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import toast from "react-hot-toast"
import type { LucideIcon } from "lucide-react"
import {
  ArrowRightIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  ClipboardCheckIcon,
  ExternalLinkIcon,
  LayersIcon,
  PlusIcon,
  RadioIcon,
  SparklesIcon,
} from "lucide-react"

import {
  LiveClassModal,
  type TutorLiveSession,
} from "@/components/dashboard/live-class-modal"
import { TutorCoursesSkeleton } from "@/components/dashboard/page-skeletons"
import { useSessionUser } from "@/components/dashboard/use-session"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type CourseRow = {
  id: string
  track: string
  trackLabel: string
  title: string
  coverUrl?: string | null
  published: boolean
  moduleCount: number
}

const ACTIONS: Array<{
  title: string
  href: string
  copy: string
  icon: LucideIcon
  accent: string
}> = [
  {
    title: "My courses",
    href: "/dashboard/courses/manage",
    copy: "Build modules, media, and quizzes",
    icon: BookOpenIcon,
    accent: "bg-[#eef2f9] text-[#00206F]",
  },
  {
    title: "Assignments",
    href: "/dashboard/assignments/review",
    copy: "Review student submissions",
    icon: ClipboardCheckIcon,
    accent: "bg-[#eefaf3] text-emerald-700",
  },
]

export function TutorOverview() {
  const { user } = useSessionUser()
  const firstName = user?.name?.split(" ")[0] || "Tutor"
  const [courses, setCourses] = useState<CourseRow[]>([])
  const [tracks, setTracks] = useState<Array<{ id: string; label: string }>>([])
  const [live, setLive] = useState<TutorLiveSession[]>([])
  const [loading, setLoading] = useState(true)
  const [liveOpen, setLiveOpen] = useState(false)
  const [liveActionId, setLiveActionId] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const [coursesRes, liveRes] = await Promise.all([
        fetch("/api/tutor/courses"),
        fetch("/api/tutor/live"),
      ])
      const coursesPayload = (await coursesRes.json().catch(() => ({}))) as {
        courses?: CourseRow[]
        tracks?: Array<{ id: string; label: string }>
      }
      const livePayload = (await liveRes.json().catch(() => ({}))) as {
        sessions?: TutorLiveSession[]
        tracks?: Array<{ id: string; label: string }>
      }
      if (coursesRes.ok) {
        setCourses(coursesPayload.courses || [])
      }
      const nextTracks =
        (liveRes.ok && livePayload.tracks?.length
          ? livePayload.tracks
          : null) ||
        (coursesRes.ok ? coursesPayload.tracks : null) ||
        []
      setTracks(nextTracks)
      if (liveRes.ok) {
        setLive(livePayload.sessions || [])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function patchLiveSession(id: string, action: "start" | "end") {
    setLiveActionId(id)
    try {
      const response = await fetch(`/api/tutor/live/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string
      }
      if (!response.ok) {
        toast.error(
          payload.error ||
            (action === "start"
              ? "Could not start session."
              : "Could not end session."),
        )
        return
      }
      toast.success(action === "start" ? "You're live." : "Live session ended.")
      await load()
    } catch {
      toast.error("Network error.")
    } finally {
      setLiveActionId(null)
    }
  }

  const stats = useMemo(() => {
    const published = courses.filter((c) => c.published).length
    const drafts = courses.length - published
    const modules = courses.reduce((sum, c) => sum + (c.moduleCount || 0), 0)
    const activeLive = live.filter((s) => s.isActive).length
    const upcomingLive = live.filter((s) => {
      if (s.isActive || s.endedAt) return false
      if (!s.scheduledAt) return false
      return new Date(s.scheduledAt).getTime() > Date.now() - 60_000
    }).length
    return {
      published,
      drafts,
      modules,
      activeLive,
      upcomingLive,
      total: courses.length,
    }
  }, [courses, live])

  const recent = courses.slice(0, 3)
  const awaiting = loading
  const activeLive = live.filter((session) => session.isActive)
  const upcomingLive = live
    .filter((session) => {
      if (session.isActive || session.endedAt) return false
      if (!session.scheduledAt) return false
      return new Date(session.scheduledAt).getTime() > Date.now() - 60_000
    })
    .sort(
      (a, b) =>
        new Date(a.scheduledAt || 0).getTime() -
        new Date(b.scheduledAt || 0).getTime(),
    )
  const featuredLive = activeLive[0] || upcomingLive[0] || null
  const featuredIsLive = Boolean(activeLive[0])
  const featuredWhen = featuredLive?.scheduledAt
    ? format(new Date(featuredLive.scheduledAt), "EEE, MMM d · h:mm a")
    : null

  return (
    <div className="flex flex-col gap-5 px-4 py-6 lg:px-6 md:py-8">
      <section className="admin-panel overflow-hidden">
        <div className="overflow-hidden bg-[#001752] px-5 py-6 text-white sm:px-7 sm:py-7">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.16em] text-white/55 uppercase">
                Tutor workspace
              </p>
              <h1 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Welcome back, {firstName}
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/72">
                {awaiting ? (
                  "Loading your teaching snapshot…"
                ) : tracks.length > 0 ? (
                  <>
                    You teach{" "}
                    <span className="font-semibold text-white">
                      {tracks.map((t) => t.label).join(", ")}
                    </span>
                    . Publish courses, go live when ready, and keep modules
                    moving.
                  </>
                ) : (
                  "Create courses, go live, and review assignments from here."
                )}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/8 p-4">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-[11px] font-medium text-white/60">
                    Catalog status
                  </p>
                  {awaiting ? (
                    <Skeleton className="mt-2 h-8 w-24 rounded-lg bg-white/15" />
                  ) : (
                    <p className="mt-1 text-3xl font-semibold tracking-tight">
                      {stats.published}
                      <span className="text-base font-medium text-white/55">
                        {" "}
                        live
                      </span>
                    </p>
                  )}
                </div>
                <p className="text-sm text-white/65">
                  {awaiting
                    ? "—"
                    : `${stats.drafts} draft${stats.drafts === 1 ? "" : "s"}`}
                </p>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/12">
                <div
                  className="h-full rounded-full bg-[#FB7801] transition-[width] duration-400 ease-out"
                  style={{
                    width: `${
                      awaiting || stats.total === 0
                        ? 0
                        : Math.round((stats.published / stats.total) * 100)
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className={cn(
          "admin-panel overflow-hidden",
          featuredIsLive
            ? "border-[#FB7801]/25"
            : featuredLive
              ? "border-[#00206F]/15"
              : "border-black/8",
        )}
      >
        <div
          className={cn(
            "flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6",
            featuredIsLive
              ? "bg-[#fff8f1]"
              : featuredLive
                ? "bg-[#f4f7fc]"
                : "bg-white",
          )}
        >
          <div className="flex min-w-0 items-start gap-3">
            <span
              className={cn(
                "mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-xl",
                featuredIsLive
                  ? "bg-[#FB7801]/15 text-[#FB7801]"
                  : "bg-[#eef2f9] text-[#00206F]",
              )}
            >
              {featuredIsLive ? (
                <RadioIcon className="size-5" />
              ) : (
                <CalendarDaysIcon className="size-5" />
              )}
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-[#00206F]/65 uppercase">
                {featuredIsLive
                  ? "Live now"
                  : featuredLive
                    ? "Upcoming class"
                    : "Live class"}
              </p>
              {awaiting ? (
                <Skeleton className="mt-2 h-5 w-48 rounded-md" />
              ) : featuredLive ? (
                <>
                  <h2 className="mt-1 truncate text-lg font-semibold text-[#001752]">
                    {featuredIsLive
                      ? `${featuredLive.title} is live`
                      : featuredLive.title}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {featuredLive.trackLabel}
                    {featuredWhen ? ` · ${featuredWhen}` : ""}
                    {featuredIsLive ? " · students can join now" : ""}
                  </p>
                  <a
                    href={featuredLive.joinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-[#00206F]"
                  >
                    Open {featuredLive.platform === "zoom" ? "Zoom" : "Meet"}
                    <ExternalLinkIcon className="size-3.5" />
                  </a>
                </>
              ) : (
                <>
                  <h2 className="mt-1 text-lg font-semibold text-[#001752]">
                    Start a live session
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Schedule a class or go live with a Zoom or Meet link.
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
            {featuredLive ? (
              <>
                {featuredIsLive ? (
                  <button
                    type="button"
                    disabled={liveActionId === featuredLive.id}
                    onClick={() => void patchLiveSession(featuredLive.id, "end")}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-[#FB7801]/30 bg-white px-5 text-sm font-semibold text-[#FB7801] transition-colors hover:bg-[#fff4ea] disabled:opacity-60"
                  >
                    {liveActionId === featuredLive.id ? "Ending…" : "End class"}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={liveActionId === featuredLive.id}
                    onClick={() =>
                      void patchLiveSession(featuredLive.id, "start")
                    }
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#FB7801] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#e56c00] disabled:opacity-60"
                  >
                    <RadioIcon className="size-4" />
                    {liveActionId === featuredLive.id
                      ? "Starting…"
                      : "Start now"}
                  </button>
                )}
                <button
                  type="button"
                  disabled={awaiting}
                  onClick={() => setLiveOpen(true)}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-black/10 bg-white px-4 text-sm font-semibold text-[#001752] transition-colors hover:bg-[#f7f8fb]"
                >
                  Schedule
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled={awaiting}
                onClick={() => setLiveOpen(true)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#00206F] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#001752]"
              >
                <CalendarDaysIcon className="size-4" />
                Go live
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Published"
          value={awaiting ? null : String(stats.published)}
          detail="Visible to students"
          icon={SparklesIcon}
        />
        <StatTile
          label="Drafts"
          value={awaiting ? null : String(stats.drafts)}
          detail="Still in setup"
          icon={BookOpenIcon}
        />
        <StatTile
          label="Modules"
          value={awaiting ? null : String(stats.modules)}
          detail="Across your courses"
          icon={LayersIcon}
        />
        <button
          type="button"
          onClick={() => setLiveOpen(true)}
          className="text-left"
        >
          <StatTile
            label={
              stats.activeLive > 0
                ? "Live now"
                : stats.upcomingLive > 0
                  ? "Scheduled"
                  : "Live now"
            }
            value={
              awaiting
                ? null
                : String(
                    stats.activeLive > 0
                      ? stats.activeLive
                      : stats.upcomingLive,
                  )
            }
            detail={
              stats.activeLive > 0
                ? "Tap to manage"
                : stats.upcomingLive > 0
                  ? "Upcoming class"
                  : "Tap to schedule"
            }
            icon={stats.activeLive > 0 ? RadioIcon : CalendarDaysIcon}
            highlight={stats.activeLive > 0 || stats.upcomingLive > 0}
          />
        </button>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="admin-panel p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.14em] text-[#00206F]/65 uppercase">
                Jump in
              </p>
              <h2 className="mt-1 text-lg font-semibold text-[#001752]">
                Quick actions
              </h2>
            </div>
            <Link
              href="/dashboard/courses/manage/new"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#00206F] px-3 text-sm font-medium text-white hover:bg-[#001752]"
            >
              <PlusIcon className="size-3.5" />
              New course
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {ACTIONS.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="admin-press group rounded-xl border border-black/8 bg-[#f7f8fb] p-4 transition-[border-color,background-color] hover:border-[#00206F]/18 hover:bg-white"
              >
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-xl",
                    action.accent,
                  )}
                >
                  <action.icon className="size-4" />
                </span>
                <p className="mt-3 text-sm font-semibold text-[#001752]">
                  {action.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {action.copy}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#00206F] opacity-80 group-hover:opacity-100">
                  Open <ArrowRightIcon className="size-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="admin-panel p-5 sm:p-6">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-[#00206F]/65 uppercase">
            Tracks
          </p>
          <h2 className="mt-1 text-lg font-semibold text-[#001752]">
            Your assignment
          </h2>
          {awaiting ? (
            <div className="mt-4 space-y-2">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ) : tracks.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No tracks assigned yet. Ask an admin to assign you.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {tracks.map((track) => {
                const count = courses.filter((c) => c.track === track.id).length
                return (
                  <li
                    key={track.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-black/8 bg-[#f7f8fb] px-3.5 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#001752]">
                        {track.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {count} course{count === 1 ? "" : "s"}
                      </p>
                    </div>
                    <Badge variant="secondary" className="rounded-md text-[10px]">
                      {track.id}
                    </Badge>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </section>

      <section className="admin-panel p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.14em] text-[#00206F]/65 uppercase">
              Recent courses
            </p>
            <h2 className="mt-1 text-lg font-semibold text-[#001752]">
              Keep building
            </h2>
          </div>
          <Link
            href="/dashboard/courses/manage"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#00206F]"
          >
            View all <ArrowRightIcon className="size-3.5" />
          </Link>
        </div>

        {awaiting ? (
          <div className="mt-4">
            <TutorCoursesSkeleton count={3} compact />
          </div>
        ) : recent.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-black/10 px-5 py-10 text-center">
            <BookOpenIcon className="mx-auto size-7 text-[#FB7801]" />
            <p className="mt-3 text-sm font-medium text-[#001752]">
              No courses yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Start a draft and set it up module by module.
            </p>
            <Link
              href="/dashboard/courses/manage/new"
              className="mt-4 inline-flex h-9 items-center justify-center rounded-lg bg-[#00206F] px-4 text-sm font-medium text-white hover:bg-[#001752]"
            >
              Create course
            </Link>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {recent.map((course) => (
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
                      className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
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
                  <h3 className="line-clamp-2 font-semibold text-[#001752]">
                    {course.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {course.moduleCount} module
                    {course.moduleCount === 1 ? "" : "s"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <LiveClassModal
        open={liveOpen}
        onClose={() => setLiveOpen(false)}
        tracks={tracks}
        sessions={live}
        onChanged={load}
      />
    </div>
  )
}

function StatTile({
  label,
  value,
  detail,
  icon: Icon,
  highlight,
}: {
  label: string
  value: string | null
  detail: string
  icon: LucideIcon
  highlight?: boolean
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-black/8 bg-white p-4",
        highlight && "border-[#FB7801]/25 bg-[#fff8f1]",
      )}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-xl",
            highlight
              ? "bg-[#FB7801]/15 text-[#FB7801]"
              : "bg-[#eef2f9] text-[#00206F]",
          )}
        >
          <Icon className="size-4" />
        </span>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      </div>
      {value == null ? (
        <Skeleton className="mt-3 h-8 w-12 rounded-lg" />
      ) : (
        <p className="mt-3 text-2xl font-semibold tracking-tight text-[#001752]">
          {value}
        </p>
      )}
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  )
}
