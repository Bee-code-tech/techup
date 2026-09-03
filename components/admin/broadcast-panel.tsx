"use client"

import { useMemo, useState } from "react"
import { CheckIcon, MegaphoneIcon, UsersIcon } from "lucide-react"
import toast from "react-hot-toast"

import type { Registration } from "@/components/admin/use-admin-dashboard"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type Audience = "general" | "track"

export function BroadcastPanel({
  registrations,
}: {
  registrations: Registration[]
}) {
  const [audience, setAudience] = useState<Audience>("general")
  const [selectedTracks, setSelectedTracks] = useState<string[]>([])
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [pending, setPending] = useState(false)

  const tracks = useMemo(() => {
    const counts = new Map<string, { label: string; count: number }>()
    for (const row of registrations) {
      const current = counts.get(row.track)
      if (current) {
        current.count += 1
      } else {
        counts.set(row.track, { label: row.trackLabel, count: 1 })
      }
    }
    return Array.from(counts.entries()).map(([track, value]) => ({
      track,
      ...value,
    }))
  }, [registrations])

  const recipients = useMemo(() => {
    if (audience === "general") return registrations
    return registrations.filter((row) => selectedTracks.includes(row.track))
  }, [audience, registrations, selectedTracks])

  function toggleTrack(track: string) {
    setSelectedTracks((current) =>
      current.includes(track)
        ? current.filter((value) => value !== track)
        : [...current, track],
    )
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (audience === "track" && selectedTracks.length === 0) {
      toast.error("Select at least one track.")
      return
    }

    setPending(true)

    try {
      const response = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          message,
          tracks: audience === "track" ? selectedTracks : undefined,
        }),
      })
      const payload = (await response.json()) as {
        error?: string
        sent?: number
        failed?: number
      }

      if (!response.ok) {
        toast.error(payload.error || "Broadcast failed.")
        return
      }

      toast.success(
        `Sent to ${payload.sent ?? 0} student(s)${
          payload.failed ? ` · ${payload.failed} failed` : ""
        }.`,
      )
      setSubject("")
      setMessage("")
      setSelectedTracks([])
      setAudience("general")
    } catch {
      toast.error("Network error while sending broadcast.")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex flex-col gap-5 px-4 lg:px-6">
      <Card className="py-6 shadow-xs">
        <CardHeader className="gap-1.5">
          <CardTitle className="text-xl font-semibold tracking-tight">
            Recipients
          </CardTitle>
          <CardDescription className="text-[15px]">
            Send to every student, or limit the email to one or more tracks.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setAudience("general")}
              className={cn(
                "flex items-start gap-3 rounded-2xl border p-4 text-left transition-colors",
                audience === "general"
                  ? "border-navy bg-navy/5 ring-1 ring-navy/20"
                  : "border-border hover:bg-muted/50",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl",
                  audience === "general"
                    ? "bg-navy text-white"
                    : "bg-muted text-navy",
                )}
              >
                <MegaphoneIcon className="size-5" />
              </span>
              <span>
                <span className="block text-[15px] font-semibold">
                  General broadcast
                </span>
                <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                  All {registrations.length} registered student
                  {registrations.length === 1 ? "" : "s"}
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setAudience("track")}
              className={cn(
                "flex items-start gap-3 rounded-2xl border p-4 text-left transition-colors",
                audience === "track"
                  ? "border-navy bg-navy/5 ring-1 ring-navy/20"
                  : "border-border hover:bg-muted/50",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl",
                  audience === "track"
                    ? "bg-navy text-white"
                    : "bg-muted text-navy",
                )}
              >
                <UsersIcon className="size-5" />
              </span>
              <span>
                <span className="block text-[15px] font-semibold">
                  By track
                </span>
                <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                  Choose Frontend, Backend, design, or data
                </span>
              </span>
            </button>
          </div>

          {audience === "track" ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {tracks.map((track) => {
                const selected = selectedTracks.includes(track.track)
                return (
                  <button
                    key={track.track}
                    type="button"
                    onClick={() => toggleTrack(track.track)}
                    className={cn(
                      "flex items-center justify-between rounded-2xl border px-4 py-3.5 text-left transition-colors",
                      selected
                        ? "border-orange bg-orange-soft ring-1 ring-orange/30"
                        : "border-border hover:bg-muted/50",
                    )}
                  >
                    <span>
                      <span className="block text-[15px] font-medium">
                        {track.label}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {track.count} student{track.count === 1 ? "" : "s"}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "flex size-6 items-center justify-center rounded-full border",
                        selected
                          ? "border-orange bg-orange text-white"
                          : "border-input bg-background",
                      )}
                    >
                      {selected ? <CheckIcon className="size-3.5" /> : null}
                    </span>
                  </button>
                )
              })}
            </div>
          ) : null}

          <div className="rounded-2xl bg-muted/60 px-4 py-3 text-[15px]">
            <span className="font-medium text-navy">{recipients.length}</span>
            <span className="text-muted-foreground">
              {" "}
              student{recipients.length === 1 ? "" : "s"} will receive this
              email
              {audience === "track" && selectedTracks.length > 0
                ? ` from ${selectedTracks.length} track${
                    selectedTracks.length === 1 ? "" : "s"
                  }`
                : ""}
              .
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="py-6 shadow-xs">
        <CardHeader className="gap-1.5">
          <CardTitle className="text-xl font-semibold tracking-tight">
            Message
          </CardTitle>
          <CardDescription className="text-[15px]">
            Write the email that will go out to the selected audience.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup className="gap-5">
              <Field>
                <FieldLabel htmlFor="subject" className="text-[15px]">
                  Subject
                </FieldLabel>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  required
                  placeholder="Bootcamp update"
                  className="h-11 px-3.5 text-[15px] md:text-[15px]"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="message" className="text-[15px]">
                  Message
                </FieldLabel>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  required
                  minLength={10}
                  rows={8}
                  placeholder="Share the announcement students should receive."
                  className="min-h-40 px-3.5 py-3 text-[15px] md:text-[15px]"
                />
              </Field>
              <Button
                type="submit"
                className="h-11 w-full text-[15px] sm:w-auto"
                disabled={pending || recipients.length === 0}
              >
                {pending
                  ? "Sending..."
                  : `Send to ${recipients.length} student${
                      recipients.length === 1 ? "" : "s"
                    }`}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
