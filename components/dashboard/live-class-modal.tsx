"use client"

import { useEffect, useId, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { format, isBefore, isSameDay, startOfDay } from "date-fns"
import toast from "react-hot-toast"
import {
  CalendarDaysIcon,
  ExternalLinkIcon,
  RadioIcon,
  XIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export type LiveTrackOption = { id: string; label: string }

export type TutorLiveSession = {
  id: string
  title: string
  track: string
  trackLabel: string
  platform: string
  joinUrl: string
  audience: string
  isActive: boolean
  scheduledAt?: string | null
  endedAt?: string | null
}

const TIME_OPTIONS = Array.from({ length: 24 * 4 }, (_, index) => {
  const hours = Math.floor(index / 4)
  const minutes = (index % 4) * 15
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
})

const fieldControlClass =
  "h-10 w-full min-w-0 rounded-lg border border-input bg-transparent px-3 text-sm shadow-none data-[size=default]:h-10"

function nextQuarterTime() {
  const now = new Date()
  const minutes = now.getMinutes()
  const next = Math.ceil((minutes + 1) / 15) * 15
  now.setSeconds(0, 0)
  if (next >= 60) {
    now.setHours(now.getHours() + 1, 0, 0, 0)
  } else {
    now.setMinutes(next)
  }
  return format(now, "HH:mm")
}

function combineDateAndTime(date: Date, time: string) {
  const [hours, minutes] = time.split(":").map(Number)
  const value = new Date(date)
  value.setHours(hours || 0, minutes || 0, 0, 0)
  return value
}

function formatSessionWhen(iso?: string | null) {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return format(date, "EEE, MMM d · h:mm a")
}

function Field({
  label,
  className,
  children,
}: {
  label: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}

export function LiveClassModal({
  open,
  onClose,
  tracks,
  sessions,
  onChanged,
}: {
  open: boolean
  onClose: () => void
  tracks: LiveTrackOption[]
  sessions: TutorLiveSession[]
  onChanged: () => Promise<void> | void
}) {
  const titleId = useId()
  const [visible, setVisible] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [track, setTrack] = useState("")
  const [title, setTitle] = useState("Live class")
  const [platform, setPlatform] = useState("meet")
  const [joinUrl, setJoinUrl] = useState("")
  const [audience, setAudience] = useState("both")
  const [date, setDate] = useState<Date>(() => new Date())
  const [time, setTime] = useState(nextQuarterTime)
  const [pending, setPending] = useState(false)
  const [endingId, setEndingId] = useState<string | null>(null)
  const [startingId, setStartingId] = useState<string | null>(null)

  const activeSessions = sessions.filter((session) => session.isActive)
  const upcomingSessions = sessions.filter((session) => {
    if (session.isActive || session.endedAt) return false
    if (!session.scheduledAt) return false
    return new Date(session.scheduledAt).getTime() > Date.now() - 60_000
  })

  const scheduledAtValue = useMemo(
    () => combineDateAndTime(date, time),
    [date, time],
  )
  const goesLiveNow =
    scheduledAtValue.getTime() <= Date.now() + 2 * 60 * 1000
  const scheduledPreview = format(scheduledAtValue, "EEEE, MMM d · h:mm a")

  useEffect(() => {
    if (!open) {
      setVisible(false)
      return
    }
    setTrack(tracks[0]?.id || "")
    setTitle("Live class")
    setPlatform("meet")
    setJoinUrl("")
    setAudience("both")
    setDate(new Date())
    setTime(nextQuarterTime())
    setCalendarOpen(false)
    const frame = window.requestAnimationFrame(() => setVisible(true))
    return () => window.cancelAnimationFrame(frame)
  }, [open, tracks])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  if (!open || typeof document === "undefined") return null

  async function startSession(event: React.FormEvent) {
    event.preventDefault()
    setPending(true)
    try {
      const scheduledAt = combineDateAndTime(date, time).toISOString()
      const response = await fetch("/api/tutor/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          track,
          title,
          platform,
          joinUrl,
          audience,
          scheduledAt,
        }),
      })
      const payload = (await response.json()) as {
        error?: string
        session?: { isActive?: boolean }
      }
      if (!response.ok) {
        toast.error(payload.error || "Could not create session.")
        return
      }
      toast.success(
        payload.session?.isActive ? "You're live." : "Live class scheduled.",
      )
      setJoinUrl("")
      await onChanged()
      onClose()
    } catch {
      toast.error("Network error.")
    } finally {
      setPending(false)
    }
  }

  async function endSession(id: string) {
    setEndingId(id)
    try {
      const response = await fetch(`/api/tutor/live/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "end" }),
      })
      const payload = (await response.json()) as { error?: string }
      if (!response.ok) {
        toast.error(payload.error || "Could not end session.")
        return
      }
      toast.success("Live session ended.")
      await onChanged()
    } catch {
      toast.error("Network error.")
    } finally {
      setEndingId(null)
    }
  }

  async function activateSession(id: string) {
    setStartingId(id)
    try {
      const response = await fetch(`/api/tutor/live/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      })
      const payload = (await response.json()) as { error?: string }
      if (!response.ok) {
        toast.error(payload.error || "Could not start session.")
        return
      }
      toast.success("You're live.")
      await onChanged()
    } catch {
      toast.error("Network error.")
    } finally {
      setStartingId(null)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close"
        className={cn(
          "absolute inset-0 bg-[#001028]/55 backdrop-blur-[6px] transition-opacity duration-200",
          visible ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "relative z-10 flex max-h-[min(94dvh,760px)] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl border border-black/8 bg-background shadow-[0_28px_80px_-28px_rgba(0,32,111,0.45)] transition-[opacity,transform] duration-200 sm:rounded-2xl",
          visible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-3 scale-[0.98] opacity-0",
        )}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 border-b border-border/70 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2
              id={titleId}
              className="text-lg font-semibold tracking-tight text-[#001752]"
            >
              Live class
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {scheduledPreview}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <XIcon className="size-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-6">
          {activeSessions.length > 0 || upcomingSessions.length > 0 ? (
            <div className="space-y-2">
              {activeSessions.map((session) => (
                <SessionRow
                  key={session.id}
                  session={session}
                  tone="live"
                  actionLabel={endingId === session.id ? "Ending…" : "End"}
                  actionDisabled={endingId === session.id}
                  onAction={() => void endSession(session.id)}
                />
              ))}
              {upcomingSessions.slice(0, 3).map((session) => (
                <SessionRow
                  key={session.id}
                  session={session}
                  tone="upcoming"
                  actionLabel={
                    startingId === session.id ? "Starting…" : "Start now"
                  }
                  actionDisabled={startingId === session.id}
                  onAction={() => void activateSession(session.id)}
                />
              ))}
            </div>
          ) : null}

          <form
            id="live-class-form"
            onSubmit={startSession}
            className="grid gap-4 sm:grid-cols-2"
          >
            <Field label="Title" className="sm:col-span-2">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={fieldControlClass}
              />
            </Field>

            <Field label="Track">
              <Select
                value={track || null}
                onValueChange={(value) => {
                  if (value != null) setTrack(String(value))
                }}
                modal={false}
                items={tracks.map((item) => ({
                  value: item.id,
                  label: item.label,
                }))}
              >
                <SelectTrigger className={fieldControlClass}>
                  <SelectValue placeholder="Select track" />
                </SelectTrigger>
                <SelectContent align="start" alignItemWithTrigger={false}>
                  {tracks.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Platform">
              <Select
                value={platform}
                onValueChange={(value) => {
                  if (value != null) setPlatform(String(value))
                }}
                modal={false}
                items={[
                  { value: "meet", label: "Google Meet" },
                  { value: "zoom", label: "Zoom" },
                ]}
              >
                <SelectTrigger className={fieldControlClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="start" alignItemWithTrigger={false}>
                  <SelectItem value="meet">Google Meet</SelectItem>
                  <SelectItem value="zoom">Zoom</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label="Date">
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        fieldControlClass,
                        "justify-start gap-2 font-normal text-foreground hover:bg-transparent",
                      )}
                    />
                  }
                >
                  <CalendarDaysIcon className="size-4 text-muted-foreground" />
                  {format(date, "MMM d, yyyy")}
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  className="w-(--anchor-width) min-w-72 overflow-hidden p-0"
                >
                  <Calendar
                    mode="single"
                    selected={date}
                    className="w-full [--cell-size:2.5rem]"
                    classNames={{
                      root: "w-full",
                      months: "w-full",
                      month: "w-full",
                    }}
                    onSelect={(next) => {
                      if (!next) return
                      setDate(next)
                      setCalendarOpen(false)
                    }}
                    disabled={(day) =>
                      isBefore(startOfDay(day), startOfDay(new Date()))
                    }
                  />
                </PopoverContent>
              </Popover>
            </Field>

            <Field label="Time">
              <Select
                value={time}
                onValueChange={(value) => {
                  if (value != null) setTime(String(value))
                }}
                modal={false}
                items={TIME_OPTIONS.map((option) => ({
                  value: option,
                  label: format(combineDateAndTime(date, option), "h:mm a"),
                }))}
              >
                <SelectTrigger className={fieldControlClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  align="start"
                  alignItemWithTrigger={false}
                  className="max-h-64"
                >
                  {TIME_OPTIONS.filter((option) => {
                    if (!isSameDay(date, new Date())) return true
                    return (
                      combineDateAndTime(date, option).getTime() >=
                      Date.now() - 60_000
                    )
                  }).map((option) => (
                    <SelectItem key={option} value={option}>
                      {format(combineDateAndTime(date, option), "h:mm a")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Audience" className="sm:col-span-2">
              <Select
                value={audience}
                onValueChange={(value) => {
                  if (value != null) setAudience(String(value))
                }}
                modal={false}
                items={[
                  { value: "both", label: "Free + paid" },
                  { value: "free", label: "Free only" },
                  { value: "paid", label: "Paid only" },
                ]}
              >
                <SelectTrigger className={fieldControlClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="start" alignItemWithTrigger={false}>
                  <SelectItem value="both">Free + paid</SelectItem>
                  <SelectItem value="free">Free only</SelectItem>
                  <SelectItem value="paid">Paid only</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label="Join URL" className="sm:col-span-2">
              <Input
                value={joinUrl}
                onChange={(e) => setJoinUrl(e.target.value)}
                placeholder="https://meet.google.com/..."
                required
                className={fieldControlClass}
              />
            </Field>
          </form>
        </div>

        <footer className="flex flex-col-reverse gap-2 border-t border-border/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-10 rounded-lg"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="live-class-form"
            disabled={pending || tracks.length === 0}
            className={cn(
              "h-10 rounded-lg text-white",
              goesLiveNow
                ? "bg-[#FB7801] hover:bg-[#e56c00]"
                : "bg-[#00206F] hover:bg-[#001752]",
            )}
          >
            {pending
              ? "Saving…"
              : goesLiveNow
                ? "Go live now"
                : "Schedule class"}
          </Button>
        </footer>
      </div>
    </div>,
    document.body,
  )
}

function SessionRow({
  session,
  tone,
  actionLabel,
  actionDisabled,
  onAction,
}: {
  session: TutorLiveSession
  tone: "live" | "upcoming"
  actionLabel: string
  actionDisabled?: boolean
  onAction: () => void
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-border/80 px-3.5 py-3">
      <div className="min-w-0">
        <p
          className={cn(
            "inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.12em] uppercase",
            tone === "live" ? "text-[#FB7801]" : "text-[#00206F]",
          )}
        >
          {tone === "live" ? (
            <RadioIcon className="size-3.5" />
          ) : (
            <CalendarDaysIcon className="size-3.5" />
          )}
          {tone === "live" ? "Live now" : "Upcoming"}
        </p>
        <p className="mt-1 truncate text-sm font-medium text-[#001752]">
          {session.title}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {session.trackLabel} ·{" "}
          {formatSessionWhen(session.scheduledAt) || "Unscheduled"}
        </p>
        <a
          href={session.joinUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-[#00206F]"
        >
          Open link <ExternalLinkIcon className="size-3" />
        </a>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={actionDisabled}
        className="shrink-0"
        onClick={onAction}
      >
        {actionLabel}
      </Button>
    </div>
  )
}
