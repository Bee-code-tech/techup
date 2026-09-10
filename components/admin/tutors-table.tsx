"use client"

import { useEffect, useId, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import toast from "react-hot-toast"
import { PlusIcon, SearchIcon, XIcon } from "lucide-react"

import { adminFieldClass, adminPrimaryBtnClass } from "@/components/admin/admin-ui"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { bootcampTracks } from "@/lib/bootcamp"
import { cn } from "@/lib/utils"

export type TutorRow = {
  id: string
  name: string
  email: string
  bio: string | null
  tracks: string[]
  trackLabels: string[]
  mustChangePassword: boolean
  createdAt: string
}

export type TrackOption = { id: string; label: string }

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
  }).format(new Date(value))
}

export function TutorsTable({
  tutors,
  tracks,
  loading,
  onChanged,
}: {
  tutors: TutorRow[]
  tracks: TrackOption[]
  loading?: boolean
  onChanged: () => Promise<void>
}) {
  const [query, setQuery] = useState("")
  const [inviteOpen, setInviteOpen] = useState(false)
  const [editTutor, setEditTutor] = useState<TutorRow | null>(null)

  const trackOptions =
    tracks.length > 0
      ? tracks
      : Object.entries(bootcampTracks).map(([id, label]) => ({ id, label }))

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return tutors
    return tutors.filter(
      (tutor) =>
        tutor.name.toLowerCase().includes(normalized) ||
        tutor.email.toLowerCase().includes(normalized) ||
        tutor.trackLabels.some((label) =>
          label.toLowerCase().includes(normalized),
        ),
    )
  }, [query, tutors])

  async function handleDelete(id: string) {
    if (!window.confirm("Remove this tutor account?")) return
    const response = await fetch(`/api/admin/tutors/${id}`, {
      method: "DELETE",
    })
    const payload = (await response.json()) as { error?: string }
    if (!response.ok) {
      toast.error(payload.error || "Could not remove tutor.")
      return
    }
    toast.success("Tutor removed.")
    await onChanged()
  }

  return (
    <div className="flex flex-col gap-5 px-4 lg:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-[1.35rem] font-semibold tracking-tight text-[#001752]">
            Faculty roster
          </h2>
          <p className="mt-1 text-[14.5px] text-muted-foreground">
            {loading && tutors.length === 0
              ? "Loading tutors…"
              : `${filtered.length} of ${tutors.length} tutor${tutors.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <Button
          type="button"
          className={cn(adminPrimaryBtnClass, "h-10 shrink-0 px-4")}
          onClick={() => setInviteOpen(true)}
        >
          <PlusIcon className="size-4" />
          Invite tutor
        </Button>
      </div>

      <div className="relative max-w-md">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search name, email, or track"
          className="h-11 rounded-xl border-black/[0.06] bg-[#f4f6fa] px-3.5 pl-10 text-[15px] shadow-none md:text-[15px]"
        />
      </div>

      <div className="admin-panel overflow-hidden">
        <Table>
          <TableHeader className="bg-[#f4f6fa]/90">
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-12 w-16 px-4 text-[12px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                S/N
              </TableHead>
              <TableHead className="h-12 px-4 text-[12px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                Tutor
              </TableHead>
              <TableHead className="h-12 px-4 text-[12px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                Tracks
              </TableHead>
              <TableHead className="h-12 px-4 text-[12px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                Status
              </TableHead>
              <TableHead className="h-12 px-4 text-[12px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                Joined
              </TableHead>
              <TableHead className="h-12 w-36 px-4 text-right text-[12px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && tutors.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={6}
                  className="h-28 text-center text-[15px] text-muted-foreground"
                >
                  Loading tutors…
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={6}
                  className="h-28 text-center text-[15px] text-muted-foreground"
                >
                  {tutors.length === 0
                    ? "No tutors yet. Invite the first one."
                    : "No tutors match your search."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((tutor, index) => (
                <TableRow
                  key={tutor.id}
                  className="transition-colors duration-150 ease-[var(--ease-out)] hover:bg-[#f7f9fc]"
                >
                  <TableCell className="px-4 py-3.5 font-medium tabular-nums text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#00206F]/[0.08] text-xs font-semibold text-[#00206F]">
                        {initials(tutor.name)}
                      </span>
                      <span>
                        <span className="block text-[15px] font-medium text-[#001752]">
                          {tutor.name}
                        </span>
                        <span className="block text-sm text-muted-foreground">
                          {tutor.email}
                        </span>
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1.5">
                      {tutor.trackLabels.length > 0 ? (
                        tutor.trackLabels.map((label) => (
                          <Badge
                            key={label}
                            variant="secondary"
                            className="h-auto rounded-lg px-2.5 py-1 text-xs font-medium"
                          >
                            {label}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          No tracks
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    {tutor.mustChangePassword ? (
                      <span className="rounded-md bg-[#fff1e6] px-2 py-0.5 text-[11px] font-semibold text-[#b85700]">
                        Temp password
                      </span>
                    ) : (
                      <span className="rounded-md bg-[#e8faf0] px-2 py-0.5 text-[11px] font-semibold text-[#128c4a]">
                        Active
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3.5 text-[15px] whitespace-nowrap text-muted-foreground">
                    {formatDate(tutor.createdAt)}
                  </TableCell>
                  <TableCell className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-lg border-black/[0.08] px-2.5 text-xs"
                        onClick={() => setEditTutor(tutor)}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 rounded-lg px-2.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => void handleDelete(tutor.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <InviteTutorModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        trackOptions={trackOptions}
        onInvited={onChanged}
      />

      <EditTutorTracksModal
        tutor={editTutor}
        open={editTutor != null}
        onClose={() => setEditTutor(null)}
        trackOptions={trackOptions}
        onSaved={onChanged}
      />
    </div>
  )
}

function InviteTutorModal({
  open,
  onClose,
  trackOptions,
  onInvited,
}: {
  open: boolean
  onClose: () => void
  trackOptions: TrackOption[]
  onInvited: () => Promise<void>
}) {
  const formId = useId()
  const [visible, setVisible] = useState(false)
  const [pending, setPending] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [bio, setBio] = useState("")
  const [selectedTracks, setSelectedTracks] = useState<string[]>([])

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
    setName("")
    setEmail("")
    setBio("")
    setSelectedTracks([])
  }, [open])

  if (!open || typeof document === "undefined") return null

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setPending(true)
    try {
      const response = await fetch("/api/admin/tutors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, bio, tracks: selectedTracks }),
      })
      const payload = (await response.json()) as {
        error?: string
        emailSent?: boolean
        tempPassword?: string
      }
      if (!response.ok) {
        toast.error(payload.error || "Could not invite tutor.")
        return
      }
      if (payload.emailSent) {
        toast.success("Tutor invited · email sent.")
      } else if (payload.tempPassword) {
        toast.success(
          `Tutor created. Temp password: ${payload.tempPassword}`,
          { duration: 12000 },
        )
      } else {
        toast.success("Tutor created.")
      }
      await onInvited()
      onClose()
    } catch {
      toast.error("Network error while inviting tutor.")
    } finally {
      setPending(false)
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
          "relative z-10 w-full max-w-lg origin-center overflow-hidden rounded-[24px] border border-white/10 bg-[#f7f8fb] shadow-[0_28px_80px_-28px_rgba(0,32,111,0.55)] transition-[opacity,transform] duration-200 ease-[var(--ease-out)]",
          visible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-2 scale-[0.96] opacity-0",
        )}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-black/5 bg-white px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.16em] text-[#00206F]/70 uppercase">
              New invite
            </p>
            <h2
              id={`${formId}-title`}
              className="mt-1 text-lg font-semibold tracking-tight text-[#001752]"
            >
              Invite tutor
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="admin-press flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-black/[0.04] hover:text-[#001752]"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#001752]">Full name</span>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              placeholder="Ada Okafor"
              className={adminFieldClass}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#001752]">Email</span>
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              placeholder="tutor@email.com"
              className={adminFieldClass}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#001752]">Bio</span>
            <Input
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              placeholder="Optional short intro"
              className={adminFieldClass}
            />
          </label>
          <div>
            <p className="mb-2 text-sm font-medium text-[#001752]">
              Assign tracks
            </p>
            <div className="flex flex-wrap gap-2">
              {trackOptions.map((track) => {
                const selected = selectedTracks.includes(track.id)
                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() =>
                      setSelectedTracks((current) =>
                        current.includes(track.id)
                          ? current.filter((value) => value !== track.id)
                          : [...current, track.id],
                      )
                    }
                    className={cn(
                      "admin-press rounded-xl border px-3 py-2 text-sm font-medium",
                      selected
                        ? "border-[#00206F] bg-[#00206F] text-white"
                        : "border-black/[0.08] bg-white text-[#001752]",
                    )}
                  >
                    {track.label}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              className="h-10 rounded-xl"
              disabled={pending}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={pending || selectedTracks.length === 0}
              className={cn(adminPrimaryBtnClass, "h-10")}
            >
              {pending ? "Sending..." : "Send invite"}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}

function EditTutorTracksModal({
  tutor,
  open,
  onClose,
  trackOptions,
  onSaved,
}: {
  tutor: TutorRow | null
  open: boolean
  onClose: () => void
  trackOptions: TrackOption[]
  onSaved: () => Promise<void>
}) {
  const formId = useId()
  const [visible, setVisible] = useState(false)
  const [pending, setPending] = useState(false)
  const [selectedTracks, setSelectedTracks] = useState<string[]>([])

  useEffect(() => {
    if (!open) {
      setVisible(false)
      return
    }
    const frame = window.requestAnimationFrame(() => setVisible(true))
    return () => window.cancelAnimationFrame(frame)
  }, [open])

  useEffect(() => {
    if (tutor) setSelectedTracks(tutor.tracks)
  }, [tutor])

  if (!open || !tutor || typeof document === "undefined") return null

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setPending(true)
    try {
      const response = await fetch(`/api/admin/tutors/${tutor!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tracks: selectedTracks }),
      })
      const payload = (await response.json()) as { error?: string }
      if (!response.ok) {
        toast.error(payload.error || "Could not update tracks.")
        return
      }
      toast.success("Tracks updated.")
      await onSaved()
      onClose()
    } catch {
      toast.error("Network error.")
    } finally {
      setPending(false)
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
          "relative z-10 w-full max-w-md origin-center overflow-hidden rounded-[24px] border border-white/10 bg-white shadow-[0_28px_80px_-28px_rgba(0,32,111,0.55)] transition-[opacity,transform] duration-200 ease-[var(--ease-out)]",
          visible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-2 scale-[0.96] opacity-0",
        )}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-black/5 px-5 py-4">
          <div>
            <h2
              id={`${formId}-title`}
              className="text-lg font-semibold tracking-tight text-[#001752]"
            >
              Edit tracks
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{tutor.name}</p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="admin-press flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-black/[0.04]"
          >
            <XIcon className="size-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          <div className="flex flex-wrap gap-2">
            {trackOptions.map((track) => {
              const selected = selectedTracks.includes(track.id)
              return (
                <button
                  key={track.id}
                  type="button"
                  onClick={() =>
                    setSelectedTracks((current) =>
                      current.includes(track.id)
                        ? current.filter((value) => value !== track.id)
                        : [...current, track.id],
                    )
                  }
                  className={cn(
                    "admin-press rounded-xl border px-3 py-2 text-sm font-medium",
                    selected
                      ? "border-[#00206F] bg-[#00206F] text-white"
                      : "border-black/[0.08] bg-[#f4f6fa] text-[#001752]",
                  )}
                >
                  {track.label}
                </button>
              )
            })}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              className="h-10 rounded-xl"
              disabled={pending}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={pending}
              className={cn(adminPrimaryBtnClass, "h-10")}
            >
              {pending ? "Saving..." : "Save tracks"}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}
