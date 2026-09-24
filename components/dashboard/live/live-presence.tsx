"use client"

import { useEffect, useId, useState } from "react"
import { createPortal } from "react-dom"

import { SolarIcon } from "@/components/icons/solar-icon"
import { cn } from "@/lib/utils"

export type PresenceStudent = {
  id: string
  name: string
  avatarUrl?: string | null
  here?: boolean
  handUp?: boolean
  speaking?: boolean
}

function initials(name?: string) {
  const parts = String(name || "Student")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
  return parts.map((part) => part[0]?.toUpperCase() || "").join("") || "S"
}

function Face({
  name,
  avatarUrl,
  className,
}: {
  name: string
  avatarUrl?: string | null
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden rounded-full bg-[#00206F] text-[10px] font-semibold text-white",
        className,
      )}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt="" className="size-full object-cover" />
      ) : (
        initials(name)
      )}
    </div>
  )
}

function FaceCell({
  student,
  canGiveMic,
  onGiveMic,
}: {
  student?: PresenceStudent
  canGiveMic?: boolean
  onGiveMic?: (student: PresenceStudent) => void
}) {
  if (!student) {
    return (
      <div className="aspect-square rounded-xl bg-[#f4f7fc] ring-1 ring-inset ring-black/4" />
    )
  }

  const interactive = Boolean(canGiveMic && student.handUp && onGiveMic)

  return (
    <button
      type="button"
      title={
        interactive
          ? `Give ${student.name} the mic`
          : student.name
      }
      disabled={!interactive}
      onClick={() => onGiveMic?.(student)}
      className={cn(
        "relative grid aspect-square place-items-center rounded-xl ring-1 ring-inset transition-transform duration-150 ease-out",
        student.handUp
          ? "bg-[#fff1e6] ring-[#FB7801]/40"
          : student.speaking
            ? "bg-[#eefaf3] ring-emerald-300"
            : "bg-[#f4f7fc] ring-black/4",
        interactive && "cursor-pointer active:scale-[0.97]",
        !interactive && "cursor-default",
      )}
    >
      <Face
        name={student.name}
        avatarUrl={student.avatarUrl}
        className="size-8 sm:size-9"
      />
      {student.here ? (
        <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-emerald-500" />
      ) : null}
      {student.handUp ? (
        <span className="absolute bottom-1 right-1 text-sm">✋</span>
      ) : null}
    </button>
  )
}

function StudentRow({
  student,
  canGiveMic,
  onGiveMic,
}: {
  student: PresenceStudent
  canGiveMic?: boolean
  onGiveMic?: (student: PresenceStudent) => void
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="relative">
        <Face
          name={student.name}
          avatarUrl={student.avatarUrl}
          className="size-9"
        />
        {student.here ? (
          <span className="absolute -right-0.5 -bottom-0.5 size-2 rounded-full bg-emerald-500 ring-2 ring-white" />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[#001752]">
          {student.name}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {student.speaking
            ? "On mic"
            : student.handUp
              ? canGiveMic
                ? "Wants to speak"
                : "Hand raised"
              : student.here
                ? "In class"
                : "Joined"}
        </p>
      </div>
      {canGiveMic && student.handUp ? (
        <button
          type="button"
          onClick={() => onGiveMic?.(student)}
          className="cursor-pointer rounded-full bg-[#FB7801] px-2.5 py-1 text-[10px] font-bold tracking-[0.08em] text-white uppercase"
        >
          Give mic
        </button>
      ) : student.handUp ? (
        <span className="text-base">✋</span>
      ) : student.speaking ? (
        <SolarIcon name="microphone" className="size-4 text-emerald-600" />
      ) : null}
    </div>
  )
}

function RosterModal({
  students,
  onClose,
  canGiveMic,
  onGiveMic,
}: {
  students: PresenceStudent[]
  onClose: () => void
  canGiveMic?: boolean
  onGiveMic?: (student: PresenceStudent) => void
}) {
  const titleId = useId()
  const [visible, setVisible] = useState(false)

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
        <header className="flex items-start justify-between gap-3 border-b border-black/6 px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.14em] text-[#00206F]/65 uppercase">
              In class
            </p>
            <h2
              id={titleId}
              className="mt-1 font-display text-lg font-semibold text-[#001752]"
            >
              {students.length} {students.length === 1 ? "student" : "students"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-9 items-center justify-center rounded-xl text-[#001752] transition-transform duration-150 ease-out hover:bg-[#f4f7fc] active:scale-[0.97]"
          >
            <SolarIcon name="close-circle" className="size-4" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-2">
          {students.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nobody has joined yet.
            </p>
          ) : (
            <div className="divide-y divide-black/5">
              {students.map((student) => (
                <StudentRow
                  key={student.id}
                  student={student}
                  canGiveMic={canGiveMic}
                  onGiveMic={onGiveMic}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}

export function LivePresence({
  students,
  isHost,
  onGiveMic,
}: {
  students: PresenceStudent[]
  isHost?: boolean
  onGiveMic?: (student: PresenceStudent) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [allOpen, setAllOpen] = useState(false)
  const overflow = students.length > 6
  const faces = overflow ? students.slice(0, 5) : students.slice(0, 6)
  const extra = overflow ? students.length - 5 : 0

  return (
    <div className="border-b border-black/6 px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-[#00206F]/65 uppercase">
          Joined · {students.length}
        </p>
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#00206F] transition-transform duration-150 ease-out active:scale-[0.97]"
        >
          {expanded ? "Hide" : "Expand"}
          <SolarIcon
            name="alt-arrow-down"
            className={cn(
              "size-3.5 transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]",
              expanded && "rotate-180",
            )}
          />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-1.5">
        {Array.from({ length: 6 }, (_, index) => {
          if (overflow && index === 5) {
            return (
              <button
                key="overflow"
                type="button"
                onClick={() => setAllOpen(true)}
                className="grid aspect-square place-items-center rounded-xl bg-[#001752] px-1 text-center transition-transform duration-150 ease-out active:scale-[0.97]"
              >
                <span className="text-[10px] leading-tight font-semibold text-white">
                  and {extra} {extra === 1 ? "other" : "others"}
                </span>
              </button>
            )
          }
          return (
            <FaceCell
              key={faces[index]?.id || index}
              student={faces[index]}
              canGiveMic={isHost}
              onGiveMic={onGiveMic}
            />
          )
        })}
      </div>

      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]",
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="mt-3 max-h-40 overflow-y-auto divide-y divide-black/5">
            {students.length === 0 ? (
              <p className="py-2 text-sm text-muted-foreground">
                Waiting for students.
              </p>
            ) : (
              students.map((student) => (
                <StudentRow
                  key={student.id}
                  student={student}
                  canGiveMic={isHost}
                  onGiveMic={onGiveMic}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setAllOpen(true)}
        className="mt-3 inline-flex h-8 items-center text-xs font-semibold text-[#00206F] transition-transform duration-150 ease-out active:scale-[0.97]"
      >
        See all
        <SolarIcon name="alt-arrow-right" className="ml-1 size-3.5" />
      </button>

      {allOpen ? (
        <RosterModal
          students={students}
          onClose={() => setAllOpen(false)}
          canGiveMic={isHost}
          onGiveMic={onGiveMic}
        />
      ) : null}
    </div>
  )
}
