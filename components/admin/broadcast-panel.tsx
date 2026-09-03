"use client"

import { useMemo, useState } from "react"
import toast from "react-hot-toast"

import type { Registration } from "@/components/admin/use-admin-dashboard"
import { broadcastEmail } from "@/lib/broadcast-email"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type Audience = "general" | "track"

const fieldClass =
  "h-11 px-3.5 text-[15px] md:text-[15px] bg-background"

export function BroadcastPanel({
  registrations,
  onSent,
}: {
  registrations: Registration[]
  onSent?: () => void
}) {
  const [audience, setAudience] = useState<Audience>("general")
  const [selectedTracks, setSelectedTracks] = useState<string[]>([])
  const [subject, setSubject] = useState("")
  const [heading, setHeading] = useState("")
  const [message, setMessage] = useState("")
  const [showCta, setShowCta] = useState(false)
  const [ctaLabel, setCtaLabel] = useState("")
  const [ctaUrl, setCtaUrl] = useState("")
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

  const recipientLabel =
    audience === "general"
      ? `All ${registrations.length} students`
      : recipients.length === 0
        ? "No tracks selected"
        : `${recipients.length} student${recipients.length === 1 ? "" : "s"}`

  const previewName = recipients[0]?.fullName || "Tolu"

  const preview = useMemo(
    () =>
      broadcastEmail({
        subject: subject.trim() || "Bootcamp update",
        heading: heading.trim() || "Your heading goes here",
        message:
          message.trim() ||
          "Write the announcement here. This is how the body will look inside the TechUp email.",
        ctaLabel: showCta ? ctaLabel : "",
        ctaUrl: showCta ? ctaUrl : "",
        recipientName: previewName,
      }),
    [ctaLabel, ctaUrl, heading, message, previewName, showCta, subject],
  )

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

    if (
      showCta &&
      ctaLabel.trim() &&
      ctaUrl.trim() &&
      !/^https?:\/\//i.test(ctaUrl.trim())
    ) {
      toast.error("Button link must start with http:// or https://")
      return
    }

    setPending(true)

    try {
      const response = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          heading,
          message,
          ctaLabel: showCta ? ctaLabel : undefined,
          ctaUrl: showCta ? ctaUrl : undefined,
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
      setHeading("")
      setMessage("")
      setCtaLabel("")
      setCtaUrl("")
      setShowCta(false)
      setSelectedTracks([])
      setAudience("general")
      onSent?.()
    } catch {
      toast.error("Network error while sending broadcast.")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="grid items-start gap-6 px-4 xl:grid-cols-[minmax(0,1fr)_28rem] xl:gap-8 lg:px-6">
      <form
        onSubmit={handleSubmit}
        className="flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-card shadow-xs"
      >
        <div className="border-b px-5 py-5 sm:px-6">
          <h2 className="text-lg font-semibold tracking-tight">Compose</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Only the content changes. Header and footer stay TechUp.
          </p>
        </div>

        <div className="space-y-6 px-5 py-5 sm:px-6">
          <div className="space-y-3">
            <p className="text-sm font-medium">Recipients</p>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ["general", "All students", `${registrations.length}`],
                  ["track", "By track", `${tracks.length}`],
                ] as const
              ).map(([value, label, count]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAudience(value)}
                  className={cn(
                    "rounded-xl border px-3.5 py-3 text-left transition-colors",
                    audience === value
                      ? "border-navy bg-navy text-white"
                      : "border-border bg-background text-foreground hover:bg-muted/50",
                  )}
                >
                  <span className="block text-sm font-medium">{label}</span>
                  <span
                    className={cn(
                      "mt-0.5 block text-xs",
                      audience === value ? "text-white/70" : "text-muted-foreground",
                    )}
                  >
                    {value === "general"
                      ? `${count} registered`
                      : `${count} tracks`}
                  </span>
                </button>
              ))}
            </div>

            {audience === "track" ? (
              <div className="overflow-hidden rounded-xl border">
                {tracks.map((track, index) => {
                  const selected = selectedTracks.includes(track.track)
                  return (
                    <label
                      key={track.track}
                      className={cn(
                        "flex cursor-pointer items-center justify-between gap-3 px-3.5 py-3 hover:bg-muted/40",
                        index > 0 && "border-t",
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <Checkbox
                          checked={selected}
                          onCheckedChange={() => toggleTrack(track.track)}
                        />
                        <span className="truncate text-sm">{track.label}</span>
                      </span>
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                        {track.count}
                      </span>
                    </label>
                  )
                })}
              </div>
            ) : null}
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium">Subject</span>
            <Input
              id="subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              required
              placeholder="What students see in their inbox"
              className={fieldClass}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium">Heading</span>
            <Input
              id="heading"
              value={heading}
              onChange={(event) => setHeading(event.target.value)}
              placeholder="Title inside the email"
              className={fieldClass}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium">Body</span>
            <Textarea
              id="message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              required
              minLength={10}
              rows={8}
              placeholder="The announcement students will read"
              className="min-h-40 resize-y px-3.5 py-3 text-[15px] leading-6 md:text-[15px]"
            />
          </label>

          <div className="space-y-3">
            <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium">
              <Checkbox
                checked={showCta}
                onCheckedChange={(checked) => setShowCta(checked === true)}
              />
              Add a button
            </label>
            {showCta ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  value={ctaLabel}
                  onChange={(event) => setCtaLabel(event.target.value)}
                  placeholder="Button label"
                  className={fieldClass}
                />
                <Input
                  value={ctaUrl}
                  onChange={(event) => setCtaUrl(event.target.value)}
                  placeholder="https://"
                  className={fieldClass}
                />
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-4 border-t bg-muted/30 px-5 py-4 sm:px-6">
          <p className="text-sm text-muted-foreground">{recipientLabel}</p>
          <Button
            type="submit"
            className="h-10 min-w-28 px-4 text-sm"
            disabled={pending || recipients.length === 0}
          >
            {pending ? "Sending..." : "Send email"}
          </Button>
        </div>
      </form>

      <aside className="xl:sticky xl:top-6">
        <div className="overflow-hidden rounded-2xl border bg-[#F4F7FC] shadow-xs">
          <div className="border-b bg-white px-4 py-3.5">
            <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
              Preview
            </p>
            <p className="mt-1 truncate text-sm font-medium">
              {subject.trim() || "Bootcamp update"}
            </p>
          </div>
          <iframe
            title="Email preview"
            srcDoc={preview.html}
            className="h-[720px] w-full bg-[#F4F7FC]"
          />
        </div>
      </aside>
    </div>
  )
}
