"use client"

import { useCallback, useEffect, useId, useState } from "react"
import { createPortal } from "react-dom"
import { format } from "date-fns"
import Link from "next/link"
import toast from "react-hot-toast"

import {
  LiveClassModal,
  type LiveTrackOption,
  type TutorLiveSession,
} from "@/components/dashboard/live-class-modal"
import { SolarIcon } from "@/components/icons/solar-icon"
import {
  formatLiveDuration,
  isInAppLive,
  liveJoinHref,
} from "@/lib/live-session"
import { cn } from "@/lib/utils"

function sessionHref(session: TutorLiveSession) {
  if (session.endedAt) return `/dashboard/live/${session.id}/recap`
  if (session.inApp || isInAppLive(session.platform)) {
    return liveJoinHref(session)
  }
  return session.joinUrl
}

function recordingLabel(status?: string) {
  if (status === "ready") return "Ready"
  if (status === "recording") return "Taping"
  if (status === "failed") return "Failed"
  return "Off"
}

function SessionBox({
  session,
  onDelete,
}: {
  session: TutorLiveSession
  onDelete: (session: TutorLiveSession) => void
}) {
  const live = session.isActive
  const upcoming = !live && !session.endedAt
  const when = session.scheduledAt || session.endedAt
  const date = when ? new Date(when) : null
  const href = sessionHref(session)
  const external = href.startsWith("http")
  const joined = session.joinedCount ?? 0
  const length = upcoming ? "—" : formatLiveDuration(session.durationMs)

  return (
    <article className="admin-card-hover flex h-full flex-col overflow-hidden rounded-2xl border border-black/8 bg-white">
      <div
        className={cn(
          "h-1.5",
          live ? "bg-[#FB7801]" : upcoming ? "bg-[#001752]" : "bg-[#d8dee9]",
        )}
      />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <span
            className={cn(
              "rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase",
              live
                ? "bg-[#fff1e6] text-[#c05600]"
                : upcoming
                  ? "bg-[#eef2f9] text-[#00206F]"
                  : "bg-[#f4f6fa] text-muted-foreground",
            )}
          >
            {live ? "Live now" : upcoming ? "Upcoming" : "Ended"}
          </span>
          <button
            type="button"
            onClick={() => onDelete(session)}
            className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors duration-150 hover:bg-[#fff1e6] hover:text-[#c05600]"
            aria-label={`Delete ${session.title}`}
          >
            <SolarIcon name="trash-bin-trash" className="size-4" />
          </button>
        </div>

        <Link
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noreferrer" : undefined}
          className="mt-3 block"
        >
          <h3 className="line-clamp-2 font-display text-lg font-semibold tracking-tight text-[#001752]">
            {session.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {session.trackLabel}
          </p>
        </Link>

        {date ? (
          <p className="mt-3 inline-flex items-center gap-2 text-sm text-[#001752]">
            <span className="grid size-7 place-items-center rounded-lg bg-[#eef2f9] text-[#00206F]">
              <SolarIcon name="calendar" className="size-3.5" />
            </span>
            <span>
              {format(date, "EEE, MMM d")}
              <span className="text-muted-foreground">
                {" "}
                · {format(date, "h:mm a")}
              </span>
            </span>
          </p>
        ) : null}

        <div className="mt-5 grid grid-cols-3 border-t border-black/5 pt-4 text-center">
          <div>
            <p className="text-[11px] text-muted-foreground">Joined</p>
            <p className="mt-1 text-base font-semibold text-[#001752]">{joined}</p>
          </div>
          <div className="border-x border-black/5">
            <p className="text-[11px] text-muted-foreground">Length</p>
            <p className="mt-1 text-base font-semibold text-[#001752]">{length}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Video</p>
            <p className="mt-1 text-base font-semibold text-[#001752]">
              {recordingLabel(session.recordingStatus)}
            </p>
          </div>
        </div>

        <Link
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noreferrer" : undefined}
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#00206F]"
        >
          {live ? "Enter classroom" : upcoming ? "Open classroom" : "Open recap"}
          <SolarIcon name="alt-arrow-right" className="size-3.5" />
        </Link>
      </div>
    </article>
  )
}

function DeleteSessionModal({
  session,
  busy,
  onClose,
  onConfirm,
}: {
  session: TutorLiveSession
  busy: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  const titleId = useId()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setVisible(true))
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener("keydown", onKey)
    }
  }, [busy, onClose])

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close"
        disabled={busy}
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
          "relative z-10 w-full max-w-md overflow-hidden rounded-t-2xl border border-black/8 bg-white p-5 shadow-[0_28px_80px_-28px_rgba(0,32,111,0.45)] transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] sm:rounded-2xl sm:p-6",
          visible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-3 scale-[0.97] opacity-0",
        )}
      >
        <p className="text-[11px] font-semibold tracking-[0.14em] text-[#c05600] uppercase">
          Delete class
        </p>
        <h2
          id={titleId}
          className="mt-1 font-display text-lg font-semibold text-[#001752]"
        >
          Remove “{session.title}”?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          This deletes the session, attendance, and recap. A published course
          module stays, but this class will no longer be linked.
        </p>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl border border-black/8 px-4 text-sm font-semibold text-[#001752] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl bg-[#c05600] px-4 text-sm font-semibold text-white disabled:opacity-60"
          >
            {busy ? "Deleting…" : "Delete class"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export function LiveManagePage() {
  const [tracks, setTracks] = useState<LiveTrackOption[]>([])
  const [sessions, setSessions] = useState<TutorLiveSession[]>([])
  const [livekitConfigured, setLivekitConfigured] = useState(false)
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<"instant" | "schedule">("instant")
  const [loading, setLoading] = useState(true)
  const [pendingDelete, setPendingDelete] = useState<TutorLiveSession | null>(
    null,
  )
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/tutor/live")
      const payload = (await response.json().catch(() => ({}))) as {
        tracks?: LiveTrackOption[]
        sessions?: TutorLiveSession[]
        livekitConfigured?: boolean
      }
      if (!response.ok) return
      setTracks(payload.tracks || [])
      setSessions(payload.sessions || [])
      setLivekitConfigured(Boolean(payload.livekitConfigured))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function confirmDelete() {
    if (!pendingDelete || deleting) return
    setDeleting(true)
    try {
      const response = await fetch(`/api/tutor/live/${pendingDelete.id}`, {
        method: "DELETE",
      })
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string
      }
      if (!response.ok) {
        toast.error(payload.error || "Could not delete this class.")
        return
      }
      setSessions((current) =>
        current.filter((row) => row.id !== pendingDelete.id),
      )
      setPendingDelete(null)
      toast.success("Class deleted.")
    } catch {
      toast.error("Network error.")
    } finally {
      setDeleting(false)
    }
  }

  const active = sessions.filter((session) => session.isActive)
  const upcoming = sessions.filter((session) => {
    if (session.isActive || session.endedAt) return false
    if (!session.scheduledAt) return false
    return new Date(session.scheduledAt).getTime() > Date.now() - 60_000
  })
  const ended = sessions.filter((session) => Boolean(session.endedAt))
  const cards = [...active, ...upcoming, ...ended]
  const featured = active[0] || upcoming[0] || null

  return (
    <div className="flex flex-col gap-5 px-4 py-6 lg:px-6 md:py-8">
      <section className="admin-panel overflow-hidden">
        <div className="bg-[#001752] px-5 py-6 text-white sm:px-7 sm:py-7">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.16em] text-white/55 uppercase">
                Live class
              </p>
              <h1 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Teach in TechUp
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/72">
                {livekitConfigured
                  ? "Go live now or schedule for later. Students join from Overview. Recap holds attendance and the recording draft."
                  : "Add LiveKit keys to .env and restart before going live in-app."}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode("instant")
                    setOpen(true)
                  }}
                  className="admin-press inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#FB7801] px-5 text-sm font-semibold text-white hover:bg-[#e56c00]"
                >
                  <SolarIcon name="podcast" className="size-4" />
                  Go live now
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("schedule")
                    setOpen(true)
                  }}
                  className="admin-press inline-flex h-11 items-center justify-center rounded-xl border border-white/15 bg-white/8 px-4 text-sm font-semibold text-white hover:bg-white/12"
                >
                  Schedule
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/8 p-4">
              {featured ? (
                <>
                  <p className="text-[11px] font-medium text-white/60">
                    {featured.isActive ? "On air" : "Next up"}
                  </p>
                  <p className="mt-1 truncate text-lg font-semibold">
                    {featured.title}
                  </p>
                  <p className="mt-1 text-sm text-white/65">
                    {featured.trackLabel}
                    {featured.scheduledAt
                      ? ` · ${format(new Date(featured.scheduledAt), "h:mm a")}`
                      : ""}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[11px] font-medium text-white/60">
                    This week
                  </p>
                  <p className="mt-1 text-3xl font-semibold tracking-tight">
                    {ended.length}
                    <span className="text-base font-medium text-white/55">
                      {" "}
                      classes
                    </span>
                  </p>
                  <p className="mt-2 text-sm text-white/65">
                    Nothing live right now
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="admin-panel overflow-hidden">
        <div className="flex items-end justify-between gap-3 border-b border-black/5 px-5 py-4 sm:px-6">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.14em] text-[#00206F]/65 uppercase">
              Recent
            </p>
            <h2 className="mt-1 font-display text-lg font-semibold text-[#001752]">
              Your classes
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            {cards.length} {cards.length === 1 ? "session" : "sessions"}
          </p>
        </div>

        {loading ? (
          <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-60 animate-pulse rounded-2xl bg-[#eef2f9]"
              />
            ))}
          </div>
        ) : cards.length === 0 ? (
          <div className="px-5 py-12 text-center sm:px-6">
            <SolarIcon
              name="videocamera"
              className="mx-auto size-7 text-[#FB7801]"
            />
            <p className="mt-3 text-sm font-medium text-[#001752]">
              No classes yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Go live now and students will see Join on Overview.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">
            {cards.map((session) => (
              <SessionBox
                key={session.id}
                session={session}
                onDelete={setPendingDelete}
              />
            ))}
          </div>
        )}
      </section>

      <LiveClassModal
        open={open}
        onClose={() => setOpen(false)}
        tracks={tracks}
        sessions={sessions}
        livekitConfigured={livekitConfigured}
        initialMode={mode}
        onChanged={load}
      />

      {pendingDelete ? (
        <DeleteSessionModal
          session={pendingDelete}
          busy={deleting}
          onClose={() => {
            if (!deleting) setPendingDelete(null)
          }}
          onConfirm={() => void confirmDelete()}
        />
      ) : null}
    </div>
  )
}
