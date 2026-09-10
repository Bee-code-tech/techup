"use client"

import { useEffect, useId, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import toast from "react-hot-toast"
import { ArrowLeftRightIcon, XIcon } from "lucide-react"

import {
  LearnCoursesGrid,
  LearnCoursesSkeleton,
} from "@/components/dashboard/learn-courses"
import {
  clearStudentLearnCache,
  useStudentLearn,
} from "@/components/dashboard/use-student-learn"
import { Select } from "@/components/marketing/Select"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { bootcampTracks } from "@/lib/bootcamp"
import { cn } from "@/lib/utils"

export default function LearnPage() {
  return <LearnContent />
}

function LearnContent() {
  const { data, loading, error, reload } = useStudentLearn()
  const [changeOpen, setChangeOpen] = useState(false)

  useEffect(() => {
    if (error && !data) toast.error(error)
  }, [error, data])

  const track = data?.track ?? null
  const trackLabel = data?.trackLabel ?? ""
  const tutors =
    data?.tutors && data.tutors.length > 0
      ? data.tutors
      : data?.tutor
        ? [data.tutor]
        : []
  const courses = data?.courses ?? []
  const awaitingData = loading && !data

  const overview = useMemo(() => {
    const modules = courses.flatMap((c) => c.modules)
    const total = modules.length
    const completed = modules.filter((m) => m.progress?.quizPassed).length
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100)
    return { total, completed, percent, courseCount: courses.length }
  }, [courses])

  return (
    <div className="flex flex-col gap-4 px-3 py-4 sm:gap-6 sm:px-4 sm:py-6 lg:px-6 md:py-8">
      <section className="admin-panel">
        <div className="flex items-start justify-between gap-3 border-b border-black/5 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-[#00206F]/70 uppercase">
              My learning
            </p>
            {awaitingData ? (
              <Skeleton className="mt-2 h-7 w-48 rounded-lg sm:h-8 sm:w-56" />
            ) : (
              <h2 className="mt-1 font-display text-xl font-bold leading-snug tracking-tight text-[#001752] sm:text-3xl sm:leading-tight">
                {trackLabel || "Choose a track to begin"}
              </h2>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={awaitingData}
            onClick={() => setChangeOpen(true)}
            className="admin-press h-9 shrink-0 gap-1.5 rounded-xl border-black/8 bg-white px-2.5 text-xs font-semibold text-[#001752] hover:bg-[#f7f8fb] sm:h-10 sm:gap-2 sm:px-3 sm:text-sm"
          >
            <ArrowLeftRightIcon
              className="size-3.5 text-[#FB7801] sm:size-4"
              aria-hidden
            />
            <span className="hidden sm:inline">Change track</span>
            <span className="sm:hidden">Track</span>
          </Button>
        </div>

        <div className="grid gap-4 p-4 sm:gap-6 sm:p-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="max-w-xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
              Finish each module&apos;s video and quiz to unlock the next. Paid
              modules stay locked until you upgrade.
            </p>

            <div className="mt-4 grid grid-cols-3 gap-2 sm:mt-5 sm:flex sm:flex-wrap sm:gap-3">
              <div className="rounded-xl border border-black/5 bg-[#f7f8fb] px-2.5 py-2.5 sm:min-w-30 sm:px-3.5 sm:py-3">
                <p className="text-[10px] font-medium text-muted-foreground sm:text-[11px]">
                  <span className="sm:hidden">Progress</span>
                  <span className="hidden sm:inline">Track progress</span>
                </p>
                {awaitingData ? (
                  <Skeleton className="mt-1 h-6 w-10 rounded-md sm:h-7 sm:w-14" />
                ) : (
                  <p className="mt-0.5 text-base font-semibold text-[#001752] sm:text-xl">
                    {overview.percent}%
                  </p>
                )}
              </div>
              <div className="rounded-xl border border-black/5 bg-[#f7f8fb] px-2.5 py-2.5 sm:min-w-30 sm:px-3.5 sm:py-3">
                <p className="text-[10px] font-medium text-muted-foreground sm:text-[11px]">
                  <span className="sm:hidden">Modules</span>
                  <span className="hidden sm:inline">Modules done</span>
                </p>
                {awaitingData ? (
                  <Skeleton className="mt-1 h-6 w-12 rounded-md sm:h-7 sm:w-16" />
                ) : (
                  <p className="mt-0.5 text-base font-semibold text-[#001752] sm:text-xl">
                    {overview.completed}
                    <span className="text-xs font-medium text-muted-foreground sm:text-sm">
                      /{overview.total}
                    </span>
                  </p>
                )}
              </div>
              <div className="rounded-xl border border-black/5 bg-[#f7f8fb] px-2.5 py-2.5 sm:min-w-30 sm:px-3.5 sm:py-3">
                <p className="text-[10px] font-medium text-muted-foreground sm:text-[11px]">
                  Courses
                </p>
                {awaitingData ? (
                  <Skeleton className="mt-1 h-6 w-8 rounded-md sm:h-7 sm:w-10" />
                ) : (
                  <p className="mt-0.5 text-base font-semibold text-[#001752] sm:text-xl">
                    {overview.courseCount}
                  </p>
                )}
              </div>
            </div>
          </div>

          {awaitingData ? (
            <div className="rounded-xl border border-black/5 bg-[#f7f8fb] p-3 sm:p-4">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-[#00206F]/65 uppercase">
                Your tutors
              </p>
              <Skeleton className="mt-2 h-5 w-40 rounded-md" />
              <Skeleton className="mt-3 h-4 w-full rounded-md" />
            </div>
          ) : tutors.length > 0 ? (
            <div className="rounded-xl border border-black/5 bg-[#f7f8fb] p-3 sm:p-4">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-[#00206F]/65 uppercase">
                {tutors.length === 1 ? "Your tutor" : "Your tutors"}
              </p>
              <ul className="mt-2 space-y-3">
                {tutors.map((tutor) => (
                  <li key={tutor.id} className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#00206F] text-sm font-semibold text-white sm:size-11">
                      {tutor.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={tutor.avatarUrl}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : (
                        tutor.name
                          .split(" ")
                          .slice(0, 2)
                          .map((part) => part[0])
                          .join("")
                          .toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-[#001752] sm:text-base">
                        {tutor.name}
                      </h3>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground sm:text-sm">
                        {tutor.bio || `Track instructor for ${trackLabel}`}
                      </p>
                      <p className="mt-1.5 truncate text-xs font-medium text-[#00206F] sm:mt-2">
                        {tutor.email}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      <section>
        {awaitingData ? (
          <LearnCoursesSkeleton />
        ) : (
          <LearnCoursesGrid track={track} courses={courses} />
        )}
      </section>

      <ChangeTrackModal
        open={changeOpen}
        currentTrack={track}
        currentTrackLabel={trackLabel}
        onClose={() => setChangeOpen(false)}
        onChanged={async () => {
          clearStudentLearnCache()
          await reload({ silent: false })
        }}
      />
    </div>
  )
}

function ChangeTrackModal({
  open,
  currentTrack,
  currentTrackLabel,
  onClose,
  onChanged,
}: {
  open: boolean
  currentTrack: string | null
  currentTrackLabel: string
  onClose: () => void
  onChanged: () => Promise<void>
}) {
  const formId = useId()
  const [visible, setVisible] = useState(false)
  const [nextTrack, setNextTrack] = useState(currentTrack || "frontend")
  const [confirmChange, setConfirmChange] = useState(false)
  const [changing, setChanging] = useState(false)

  useEffect(() => {
    if (!open) {
      setVisible(false)
      return
    }
    const frame = window.requestAnimationFrame(() => setVisible(true))
    return () => window.cancelAnimationFrame(frame)
  }, [open])

  useEffect(() => {
    if (!open) return
    setNextTrack(currentTrack || "frontend")
    setConfirmChange(false)
  }, [open, currentTrack])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener("keydown", onKey)
    }
  }, [open, onClose])

  if (!open || typeof document === "undefined") return null

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!confirmChange) {
      toast.error("Confirm that you will lose previous track progress.")
      return
    }
    if (nextTrack === currentTrack) {
      toast.error("Pick a different track.")
      return
    }
    setChanging(true)
    try {
      const response = await fetch("/api/student/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ track: nextTrack, confirm: true }),
      })
      const payload = (await response.json()) as { error?: string }
      if (!response.ok) {
        toast.error(payload.error || "Could not change track.")
        return
      }
      toast.success("Track updated. Starting fresh.")
      await onChanged()
      onClose()
    } catch {
      toast.error("Network error.")
    } finally {
      setChanging(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className={cn(
          "absolute inset-0 bg-[#001028]/55 backdrop-blur-[6px] transition-opacity duration-200 ease-[var(--ease-out)]",
          visible ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${formId}-title`}
        className={cn(
          "relative z-10 w-full max-w-md origin-center overflow-hidden rounded-2xl border border-white/10 bg-[#f7f8fb] shadow-[0_28px_80px_-28px_rgba(0,32,111,0.55)] transition-[opacity,transform] duration-200 ease-[var(--ease-out)]",
          visible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-2 scale-[0.96] opacity-0",
        )}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-black/5 bg-white px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.16em] text-[#00206F]/70 uppercase">
              Switch path
            </p>
            <h2
              id={`${formId}-title`}
              className="mt-1 text-lg font-semibold tracking-tight text-[#001752]"
            >
              Change track
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="admin-press flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-black/4 hover:text-[#001752]"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="space-y-4 p-5"
        >
          <p className="rounded-xl border border-[#FB7801]/20 bg-[#fff8f1] px-3.5 py-3 text-sm leading-relaxed text-[#7a4a1a]">
            Changing tracks removes access and progress from{" "}
            <span className="font-semibold">
              {currentTrackLabel || "your current track"}
            </span>
            . You will start the new track from the beginning.
          </p>

          <div className="space-y-2">
            <label
              htmlFor={`${formId}-track`}
              className="text-sm font-medium text-[#001752]"
            >
              New track
            </label>
            <Select
              value={nextTrack}
              onValueChange={setNextTrack}
              options={Object.entries(bootcampTracks).map(([value, label]) => ({
                value,
                label,
              }))}
            />
          </div>

          <label className="flex items-start gap-2.5 text-sm text-[#334155]">
            <input
              type="checkbox"
              checked={confirmChange}
              onChange={(event) => setConfirmChange(event.target.checked)}
              className="mt-1"
            />
            <span>
              I understand I will lose my previous track progress and start
              over.
            </span>
          </label>

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="admin-press h-11 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={changing || nextTrack === currentTrack || !confirmChange}
              className="admin-press h-11 rounded-xl bg-[#00206F] text-white hover:bg-[#001752]"
            >
              {changing ? "Updating..." : "Confirm change"}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}
