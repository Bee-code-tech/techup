"use client"

import { useEffect, useId, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { format } from "date-fns"
import toast from "react-hot-toast"

import { SolarIcon } from "@/components/icons/solar-icon"
import { cn } from "@/lib/utils"

type Person = {
  id: string
  name: string
  role?: string
  avatarUrl?: string | null
}

type RecapPayload = {
  session: {
    id: string
    title: string
    trackLabel: string
    endedAt: string | null
    recordingStatus: string
    recordingUrl: string | null
    publishedModuleId: string | null
  }
  attendance: {
    joined: Person[]
    absent: Person[]
  }
  courses: Array<{ id: string; title: string }>
}

function initials(name?: string) {
  const parts = String(name || "Student")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
  return parts.map((part) => part[0]?.toUpperCase() || "").join("") || "S"
}

function Face({ name, avatarUrl }: { name: string; avatarUrl?: string | null }) {
  return (
    <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#eef2f9] text-[11px] font-semibold text-[#00206F]">
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt="" className="size-full object-cover" />
      ) : (
        initials(name)
      )}
    </div>
  )
}

function StudentRow({
  person,
  tone,
}: {
  person: Person
  tone: "present" | "absent"
}) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <Face name={person.name} avatarUrl={person.avatarUrl} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[#001752]">
          {person.name}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {tone === "present" ? "Attended" : "Did not join"}
        </p>
      </div>
    </div>
  )
}

function PeopleModal({
  title,
  people,
  tone,
  onClose,
}: {
  title: string
  people: Person[]
  tone: "present" | "absent"
  onClose: () => void
}) {
  const titleId = useId()
  const [visible, setVisible] = useState(false)
  const [query, setQuery] = useState("")

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setVisible(true))
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener("keydown", onKey)
    }
  }, [onClose])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return people
    return people.filter((person) => person.name.toLowerCase().includes(needle))
  }, [people, query])

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close"
        className={cn(
          "absolute inset-0 bg-[#001028]/50 backdrop-blur-[6px] transition-opacity duration-200",
          visible ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "relative z-10 flex max-h-[min(88dvh,640px)] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-black/8 bg-white shadow-[0_28px_80px_-28px_rgba(0,32,111,0.45)] transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] sm:rounded-2xl",
          visible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-3 scale-[0.97] opacity-0",
        )}
      >
        <header className="border-b border-black/6 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.14em] text-[#00206F]/65 uppercase">
                {tone === "present" ? "Joined" : "Missed"}
              </p>
              <h2
                id={titleId}
                className="mt-1 font-display text-lg font-semibold text-[#001752]"
              >
                {title}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex size-9 items-center justify-center rounded-xl text-[#001752] hover:bg-[#f4f7fc]"
            >
              <SolarIcon name="close-circle" className="size-4" />
            </button>
          </div>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search a student"
            className="mt-3 h-10 w-full rounded-xl border border-black/8 bg-[#f7f9fc] px-3 text-sm text-[#001752] placeholder:text-muted-foreground focus:border-[#00206F]/30 focus:outline-none"
          />
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-2">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No matching students.
            </p>
          ) : (
            <div className="divide-y divide-black/5">
              {filtered.map((person) => (
                <StudentRow key={person.id} person={person} tone={tone} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}

function AbsentCard({
  people,
  onOpen,
}: {
  people: Person[]
  onOpen: () => void
}) {
  const preview = people.slice(0, 5)
  return (
    <button
      type="button"
      onClick={onOpen}
      className="mt-5 flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-black/8 bg-[#f7f8fb] px-4 py-3 text-left transition-[background-color,border-color] duration-150 hover:border-[#00206F]/16 hover:bg-white"
    >
      <div className="flex -space-x-2">
        {preview.length === 0 ? (
          <div className="flex size-9 items-center justify-center rounded-lg bg-[#eef2f9] text-[#00206F]">
            <SolarIcon name="users-group-rounded" className="size-4" />
          </div>
        ) : (
          preview.map((person) => (
            <Face key={person.id} name={person.name} avatarUrl={person.avatarUrl} />
          ))
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#001752]">
          {people.length} missed
        </p>
        <p className="text-[11px] text-muted-foreground">
          {people.length === 0
            ? "Everyone on the track joined."
            : "Search the full list"}
        </p>
      </div>
      <SolarIcon name="alt-arrow-right" className="size-4 text-[#00206F]/40" />
    </button>
  )
}

export function LiveRecap({ sessionId }: { sessionId: string }) {
  const [data, setData] = useState<RecapPayload | null>(null)
  const [error, setError] = useState("")
  const [courseId, setCourseId] = useState("")
  const [publishing, setPublishing] = useState(false)
  const [listOpen, setListOpen] = useState<"present" | "absent" | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const response = await fetch(`/api/live/${sessionId}/recap`)
        const payload = (await response.json().catch(() => ({}))) as RecapPayload & {
          error?: string
        }
        if (cancelled) return
        if (!response.ok) {
          setError(payload.error || "Could not load recap.")
          return
        }
        setData(payload)
        setCourseId(payload.courses[0]?.id || "")
      } catch {
        if (!cancelled) setError("Network error.")
      }
    })()
    return () => {
      cancelled = true
    }
  }, [sessionId])

  async function publish() {
    setPublishing(true)
    try {
      const response = await fetch(`/api/live/${sessionId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      })
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string
      }
      if (!response.ok) {
        toast.error(payload.error || "Could not publish.")
        return
      }
      toast.success("Published as a Live module.")
      setData((current) =>
        current
          ? {
              ...current,
              session: { ...current.session, publishedModuleId: "ok" },
            }
          : current,
      )
    } catch {
      toast.error("Network error.")
    } finally {
      setPublishing(false)
    }
  }

  if (error) {
    return (
      <div className="px-4 py-10 text-sm text-destructive lg:px-6">{error}</div>
    )
  }

  if (!data) {
    return (
      <div className="px-4 py-10 text-sm text-muted-foreground lg:px-6">
        Loading class recap…
      </div>
    )
  }

  const students = data.attendance.joined.filter((row) => row.role === "student")
  const ended = data.session.endedAt
    ? format(new Date(data.session.endedAt), "EEEE, MMM d · h:mm a")
    : null
  const recordingReady =
    Boolean(data.session.recordingUrl) &&
    data.session.recordingStatus === "ready"

  return (
    <div className="flex flex-col gap-5 px-4 py-6 lg:px-6 md:py-8">
      <Link
        href="/dashboard/live/manage"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-[#00206F]"
      >
        <SolarIcon name="alt-arrow-left" className="size-3.5" />
        All classes
      </Link>

      <section className="admin-panel overflow-hidden">
        <div className="bg-[#001752] px-5 py-6 text-white sm:px-7 sm:py-7">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-white/55 uppercase">
            Recap
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {data.session.title}
          </h1>
          <p className="mt-2 text-sm text-white/72">
            {data.session.trackLabel}
            {ended ? ` · ${ended}` : ""}
          </p>
        </div>
        <div className="grid gap-px bg-[#eef2f9] sm:grid-cols-3">
          <div className="bg-white px-5 py-4">
            <p className="text-[11px] font-medium text-muted-foreground">Joined</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#001752]">
              {students.length}
            </p>
          </div>
          <div className="bg-white px-5 py-4">
            <p className="text-[11px] font-medium text-muted-foreground">Missed</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#001752]">
              {data.attendance.absent.length}
            </p>
          </div>
          <div className="bg-white px-5 py-4">
            <p className="text-[11px] font-medium text-muted-foreground">
              Recording
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#001752]">
              {recordingReady
                ? "Ready"
                : data.session.recordingStatus === "failed"
                  ? "Failed"
                  : data.session.recordingStatus === "recording"
                    ? "Pending"
                    : "Off"}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
        <section className="admin-panel p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.14em] text-[#00206F]/65 uppercase">
                Recording
              </p>
              <h2 className="mt-1 font-display text-lg font-semibold text-[#001752]">
                Draft for your course
              </h2>
            </div>
            <span className="rounded-full bg-[#fff1e6] px-2.5 py-1 text-[11px] font-semibold text-[#c05600]">
              Live
            </span>
          </div>

          {recordingReady ? (
            <video
              src={data.session.recordingUrl || undefined}
              controls
              className="mt-4 aspect-video w-full rounded-xl bg-[#001028]"
            />
          ) : (
            <div className="mt-4 flex aspect-video items-center justify-center rounded-xl bg-[#f7f9fc] px-6 text-center">
              <div>
                <SolarIcon
                  name="videocamera"
                  className="mx-auto size-7 text-[#FB7801]"
                />
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {data.session.recordingStatus === "recording"
                    ? "Recording is still finishing. Refresh in a minute."
                    : data.session.recordingStatus === "failed"
                      ? "Recording did not save. Check LiveKit and Tigris, then run the next class."
                      : "No recording. Start one from Record while the class is live."}
                </p>
              </div>
            </div>
          )}

          <div className="mt-5">
            {data.session.publishedModuleId ? (
              <p className="rounded-xl bg-[#eefaf3] px-4 py-3 text-sm font-medium text-emerald-800">
                Published to a course as a Live module.
              </p>
            ) : recordingReady ? (
              <div className="flex flex-col gap-2 sm:flex-row">
                <select
                  value={courseId}
                  onChange={(event) => setCourseId(event.target.value)}
                  className="h-11 min-w-0 flex-1 rounded-xl border border-black/8 bg-[#f7f9fc] px-3 text-sm"
                >
                  {data.courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={!courseId || publishing}
                  onClick={() => void publish()}
                  className="admin-press inline-flex h-11 items-center justify-center rounded-xl bg-[#00206F] px-4 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {publishing ? "Publishing…" : "Publish as module"}
                </button>
              </div>
            ) : null}
          </div>
        </section>

        <section className="admin-panel p-5 sm:p-6">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-[#00206F]/65 uppercase">
            Attendance
          </p>
          <h2 className="mt-1 font-display text-lg font-semibold text-[#001752]">
            Who showed up
          </h2>

          <div className="mt-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-[#001752]">
                Joined · {students.length}
              </p>
              {students.length > 6 ? (
                <button
                  type="button"
                  onClick={() => setListOpen("present")}
                  className="cursor-pointer text-xs font-semibold text-[#00206F]"
                >
                  See all
                </button>
              ) : null}
            </div>
            <div className="mt-1 max-h-64 divide-y divide-black/5 overflow-y-auto">
              {students.length === 0 ? (
                <p className="py-3 text-sm text-muted-foreground">
                  No students joined.
                </p>
              ) : (
                students.slice(0, 6).map((person) => (
                  <StudentRow key={person.id} person={person} tone="present" />
                ))
              )}
            </div>
          </div>

          <AbsentCard
            people={data.attendance.absent}
            onOpen={() => setListOpen("absent")}
          />
        </section>
      </div>

      {listOpen === "present" ? (
        <PeopleModal
          title={`${students.length} students`}
          people={students}
          tone="present"
          onClose={() => setListOpen(null)}
        />
      ) : null}
      {listOpen === "absent" ? (
        <PeopleModal
          title={`${data.attendance.absent.length} missed`}
          people={data.attendance.absent}
          tone="absent"
          onClose={() => setListOpen(null)}
        />
      ) : null}
    </div>
  )
}
