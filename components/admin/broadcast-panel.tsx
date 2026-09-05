"use client"

import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import {
  MegaphoneIcon,
  SendIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "lucide-react"

import type { Registration } from "@/components/admin/use-admin-dashboard"
import { broadcastEmail } from "@/lib/broadcast-email"
import { slugifyCampaignKey } from "@/lib/broadcast-campaign-key"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type Audience = "general" | "track"

type AudienceIntel = {
  eligible: number
  alreadyReceived: number
  willSend: number
}

const fieldClass =
  "h-11 rounded-xl border-black/8 bg-[#f7f8fb] px-3.5 text-[15px] shadow-none focus-visible:bg-white md:text-[15px]"

export function BroadcastPanel({
  registrations,
  onSent,
  draft,
  onDraftConsumed,
}: {
  registrations: Registration[]
  onSent?: () => void
  draft?: {
    campaignKey: string
    subject: string
    heading: string
    message: string
    ctaLabel: string
    ctaUrl: string
    tracks: string[]
  } | null
  onDraftConsumed?: () => void
}) {
  const [audience, setAudience] = useState<Audience>("general")
  const [selectedTracks, setSelectedTracks] = useState<string[]>([])
  const [campaignKey, setCampaignKey] = useState("")
  const [campaignTouched, setCampaignTouched] = useState(false)
  const [subject, setSubject] = useState("")
  const [heading, setHeading] = useState("")
  const [message, setMessage] = useState("")
  const [showCta, setShowCta] = useState(false)
  const [ctaLabel, setCtaLabel] = useState("")
  const [ctaUrl, setCtaUrl] = useState("")
  const [skipAlreadySent, setSkipAlreadySent] = useState(true)
  const [pending, setPending] = useState(false)
  const [intel, setIntel] = useState<AudienceIntel>({
    eligible: registrations.length,
    alreadyReceived: 0,
    willSend: registrations.length,
  })
  const [intelLoading, setIntelLoading] = useState(false)

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

  const previewName = recipients[0]?.fullName || "Tolu"
  const resolvedCampaign =
    campaignKey.trim() || slugifyCampaignKey(subject) || "untitled-campaign"

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

  useEffect(() => {
    if (!draft) return
    setCampaignKey(draft.campaignKey)
    setCampaignTouched(true)
    setSubject(draft.subject)
    setHeading(draft.heading)
    setMessage(draft.message)
    setCtaLabel(draft.ctaLabel)
    setCtaUrl(draft.ctaUrl)
    setShowCta(Boolean(draft.ctaLabel || draft.ctaUrl))
    if (draft.tracks.length > 0) {
      setAudience("track")
      setSelectedTracks(draft.tracks)
    } else {
      setAudience("general")
      setSelectedTracks([])
    }
    setSkipAlreadySent(true)
    onDraftConsumed?.()
  }, [draft, onDraftConsumed])

  useEffect(() => {
    if (!campaignTouched) {
      const next = slugifyCampaignKey(subject)
      setCampaignKey(next)
    }
  }, [campaignTouched, subject])

  useEffect(() => {
    const controller = new AbortController()
    const tracksParam =
      audience === "track" ? selectedTracks.join(",") : ""
    const key = campaignKey.trim() || slugifyCampaignKey(subject)
    const timer = window.setTimeout(() => {
      setIntelLoading(true)
      const params = new URLSearchParams()
      if (key) params.set("campaignKey", key)
      if (tracksParam) params.set("tracks", tracksParam)
      void fetch(`/api/admin/broadcast?${params.toString()}`, {
        signal: controller.signal,
      })
        .then((response) => response.json())
        .then((payload: AudienceIntel & { error?: string }) => {
          if (payload.error) return
          const eligible = payload.eligible ?? recipients.length
          const alreadyReceived = payload.alreadyReceived ?? 0
          setIntel({
            eligible,
            alreadyReceived,
            willSend: skipAlreadySent
              ? Math.max(0, eligible - alreadyReceived)
              : eligible,
          })
        })
        .catch(() => {
          /* ignore abort/network for live preview */
        })
        .finally(() => setIntelLoading(false))
    }, 250)

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [
    audience,
    campaignKey,
    recipients.length,
    selectedTracks,
    skipAlreadySent,
    subject,
  ])

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
          campaignKey: resolvedCampaign,
          skipAlreadySent,
          ctaLabel: showCta ? ctaLabel : undefined,
          ctaUrl: showCta ? ctaUrl : undefined,
          tracks: audience === "track" ? selectedTracks : undefined,
        }),
      })
      const payload = (await response.json()) as {
        error?: string
        sent?: number
        failed?: number
        skipped?: number
      }

      if (!response.ok) {
        toast.error(payload.error || "Broadcast failed.")
        return
      }

      const skippedNote =
        payload.skipped && payload.skipped > 0
          ? ` · ${payload.skipped} skipped`
          : ""
      toast.success(
        `Sent to ${payload.sent ?? 0} student(s)${
          payload.failed ? ` · ${payload.failed} failed` : ""
        }${skippedNote}.`,
      )
      setSubject("")
      setHeading("")
      setMessage("")
      setCtaLabel("")
      setCtaUrl("")
      setShowCta(false)
      setSelectedTracks([])
      setAudience("general")
      setCampaignKey("")
      setCampaignTouched(false)
      setSkipAlreadySent(true)
      onSent?.()
    } catch {
      toast.error("Network error while sending broadcast.")
    } finally {
      setPending(false)
    }
  }

  const sendCount = skipAlreadySent ? intel.willSend : intel.eligible

  return (
    <div className="grid items-start gap-6 px-4 xl:grid-cols-[minmax(0,1fr)_28rem] xl:gap-8 lg:px-6">
      <form
        onSubmit={handleSubmit}
        className="flex min-w-0 flex-col overflow-hidden rounded-[28px] border border-black/5 bg-card shadow-[0_18px_50px_-36px_rgba(0,32,111,0.35)]"
      >
        <div className="relative overflow-hidden border-b border-black/5 bg-[#00206F] px-5 py-6 text-white sm:px-6">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-8 -top-12 size-40 rounded-full bg-[#FB7801]/25 blur-3xl"
          />
          <div className="relative flex items-start gap-3.5">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
              <MegaphoneIcon className="size-5 text-[#FFB067]" />
            </span>
            <div>
              <p className="text-[11px] font-semibold tracking-[0.18em] text-white/55 uppercase">
                Campaign studio
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">
                Compose broadcast
              </h2>
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-white/70">
                Name the campaign once. New students can get it later without
                duplicate sends.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 px-5 py-5 sm:px-6">
          <div className="grid gap-3 sm:grid-cols-3">
            {(
              [
                {
                  label: "Eligible",
                  value: intel.eligible,
                  icon: UsersIcon,
                  tone: "navy",
                },
                {
                  label: "Already got it",
                  value: intel.alreadyReceived,
                  icon: ShieldCheckIcon,
                  tone: "muted",
                },
                {
                  label: "Will send",
                  value: sendCount,
                  icon: SendIcon,
                  tone: "orange",
                },
              ] as const
            ).map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  className={cn(
                    "rounded-2xl border px-3.5 py-3",
                    item.tone === "orange"
                      ? "border-[#FB7801]/25 bg-[#fff6ef]"
                      : item.tone === "navy"
                        ? "border-[#00206F]/10 bg-[#00206F]/[0.04]"
                        : "border-black/5 bg-[#f7f8fb]",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon
                      className={cn(
                        "size-3.5",
                        item.tone === "orange"
                          ? "text-[#b85700]"
                          : item.tone === "navy"
                            ? "text-[#00206F]"
                            : "text-muted-foreground",
                      )}
                    />
                    <p className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                      {item.label}
                    </p>
                  </div>
                  <p
                    className={cn(
                      "mt-1.5 text-2xl font-semibold tabular-nums",
                      item.tone === "orange"
                        ? "text-[#b85700]"
                        : "text-[#001752]",
                      intelLoading && "opacity-60",
                    )}
                  >
                    {item.value}
                  </p>
                </div>
              )
            })}
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-[#001752]">Recipients</p>
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
                    "rounded-2xl border px-3.5 py-3 text-left transition-colors",
                    audience === value
                      ? "border-[#00206F] bg-[#00206F] text-white"
                      : "border-black/5 bg-[#f7f8fb] text-foreground hover:bg-muted/50",
                  )}
                >
                  <span className="block text-sm font-medium">{label}</span>
                  <span
                    className={cn(
                      "mt-0.5 block text-xs",
                      audience === value
                        ? "text-white/70"
                        : "text-muted-foreground",
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
              <div className="overflow-hidden rounded-2xl border border-black/5">
                {tracks.map((track, index) => {
                  const selected = selectedTracks.includes(track.track)
                  return (
                    <label
                      key={track.track}
                      className={cn(
                        "flex cursor-pointer items-center justify-between gap-3 px-3.5 py-3 hover:bg-muted/40",
                        index > 0 && "border-t border-black/5",
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
            <span className="text-sm font-medium text-[#001752]">
              Campaign name
            </span>
            <Input
              value={campaignKey}
              onChange={(event) => {
                setCampaignTouched(true)
                setCampaignKey(
                  event.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9-]+/g, "-")
                    .replace(/-{2,}/g, "-"),
                )
              }}
              onBlur={() =>
                setCampaignKey((current) => slugifyCampaignKey(current))
              }
              placeholder="bootcamp-orientation-oct-2026"
              className={fieldClass}
            />
            <p className="text-xs text-muted-foreground">
              Used to skip people who already received this exact campaign.
            </p>
          </label>

          <button
            type="button"
            onClick={() => setSkipAlreadySent((value) => !value)}
            className={cn(
              "flex w-full items-start gap-3 rounded-2xl border px-4 py-3.5 text-left transition-colors",
              skipAlreadySent
                ? "border-[#25D366]/35 bg-[#e8faf0]"
                : "border-black/5 bg-[#f7f8fb]",
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border",
                skipAlreadySent
                  ? "border-[#25D366] bg-[#25D366] text-white"
                  : "border-black/15 bg-white",
              )}
            >
              {skipAlreadySent ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12.5L10 17.5L19 7.5"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : null}
            </span>
            <span>
              <span className="block text-sm font-semibold text-[#001752]">
                Skip people who already got this
              </span>
              <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                {skipAlreadySent
                  ? `${intel.alreadyReceived} will be skipped · ${intel.willSend} new recipients`
                  : "Off · everyone in the audience will be emailed again"}
              </span>
            </span>
          </button>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#001752]">Subject</span>
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
            <span className="text-sm font-medium text-[#001752]">Heading</span>
            <Input
              id="heading"
              value={heading}
              onChange={(event) => setHeading(event.target.value)}
              placeholder="Title inside the email"
              className={fieldClass}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#001752]">Body</span>
            <Textarea
              id="message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              required
              minLength={10}
              rows={8}
              placeholder="The announcement students will read"
              className="min-h-40 resize-y rounded-xl border-black/8 bg-[#f7f8fb] px-3.5 py-3 text-[15px] leading-6 shadow-none focus-visible:bg-white md:text-[15px]"
            />
          </label>

          <div className="space-y-3">
            <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-[#001752]">
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

        <div className="mt-auto flex flex-col gap-3 border-t border-black/5 bg-[#f7f8fb]/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-sm text-muted-foreground">
            Campaign{" "}
            <span className="font-medium text-[#001752]">
              {resolvedCampaign}
            </span>
          </p>
          <Button
            type="submit"
            className="h-11 min-w-36 rounded-xl bg-[#00206F] px-5 text-sm text-white hover:bg-[#001752] active:scale-[0.98]"
            disabled={pending || sendCount === 0 || recipients.length === 0}
          >
            {pending
              ? "Sending..."
              : `Send to ${sendCount} student${sendCount === 1 ? "" : "s"}`}
          </Button>
        </div>
      </form>

      <aside className="xl:sticky xl:top-6">
        <div className="overflow-hidden rounded-[28px] border border-black/5 bg-[#F4F7FC] shadow-[0_18px_50px_-36px_rgba(0,32,111,0.35)]">
          <div className="border-b border-black/5 bg-white px-4 py-3.5">
            <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
              Live preview
            </p>
            <p className="mt-1 truncate text-sm font-medium text-[#001752]">
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
