"use client"

import { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { CheckIcon, Link2Icon, XIcon } from "lucide-react"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { bootcampTracks } from "@/lib/bootcamp"
import { cn } from "@/lib/utils"

type TrackOption = { id: string; label: string }

const TRACK_SHORT: Record<string, string> = {
  frontend: "FE",
  backend: "BE",
  uiux: "UX",
  graphic: "GD",
  data: "DA",
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-1.99.522.532-1.934-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}

function emptyUrls(): Record<string, string> {
  return Object.fromEntries(
    Object.keys(bootcampTracks).map((track) => [track, ""]),
  )
}

function isFilled(value: string) {
  return value.trim().length > 0
}

export function WhatsappGroupNav() {
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(false)
  const [urls, setUrls] = useState<Record<string, string>>(emptyUrls)
  const [savedUrls, setSavedUrls] = useState<Record<string, string>>(emptyUrls)
  const [tracks, setTracks] = useState<TrackOption[]>(
    Object.entries(bootcampTracks).map(([id, label]) => ({ id, label })),
  )
  const [loading, setLoading] = useState(false)
  const [pending, setPending] = useState(false)

  const isDirty = useMemo(
    () =>
      tracks.some(
        (track) => (urls[track.id] || "") !== (savedUrls[track.id] || ""),
      ),
    [savedUrls, tracks, urls],
  )

  const configuredCount = useMemo(
    () => tracks.filter((track) => isFilled(urls[track.id] || "")).length,
    [tracks, urls],
  )

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

    setLoading(true)
    void fetch("/api/admin/settings")
      .then((response) => response.json())
      .then(
        (payload: {
          whatsappGroupUrls?: Record<string, string>
          tracks?: TrackOption[]
        }) => {
          if (payload.tracks?.length) setTracks(payload.tracks)

          const next = emptyUrls()
          for (const [track, url] of Object.entries(
            payload.whatsappGroupUrls || {},
          )) {
            if (track in next) next[track] = url
          }
          setUrls(next)
          setSavedUrls(next)
        },
      )
      .finally(() => setLoading(false))
  }, [open])

  useEffect(() => {
    if (!open) return

    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)

    return () => {
      document.body.style.overflow = previous
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsappGroupUrls: urls }),
      })
      const payload = (await response.json()) as {
        error?: string
        whatsappGroupUrls?: Record<string, string>
      }

      if (!response.ok) {
        toast.error(payload.error || "Could not save the WhatsApp links.")
        return
      }

      const next = emptyUrls()
      for (const [track, url] of Object.entries(
        payload.whatsappGroupUrls || urls,
      )) {
        if (track in next) next[track] = url
      }
      setUrls(next)
      setSavedUrls(next)
      toast.success("WhatsApp group links updated.")
      setOpen(false)
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            tooltip="WhatsApp groups"
            className="bg-[#25D366] text-white hover:bg-[#1ebe57] hover:text-white active:bg-[#1aa34c] active:text-white data-active:bg-[#25D366] data-active:text-white"
            onClick={() => setOpen(true)}
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-white/15">
              <WhatsAppIcon className="size-4" />
            </span>
            <span className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">WhatsApp groups</span>
              <span className="truncate text-xs text-white/80">
                Links by track
              </span>
            </span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[200] flex items-end justify-center p-3 sm:items-center sm:p-6">
              <button
                type="button"
                aria-label="Close dialog"
                className={cn(
                  "absolute inset-0 z-0 bg-[#001028]/55 backdrop-blur-[6px] transition-opacity duration-200 ease-out",
                  visible ? "opacity-100" : "opacity-0",
                )}
                onClick={() => setOpen(false)}
              />
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="whatsapp-group-title"
                className={cn(
                  "relative z-10 flex max-h-[min(92vh,760px)] w-full max-w-xl origin-center flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#f7f8fb] shadow-[0_28px_80px_-28px_rgba(0,32,111,0.55)] transition-[opacity,transform] duration-200 ease-out",
                  visible
                    ? "translate-y-0 scale-100 opacity-100"
                    : "translate-y-3 scale-[0.97] opacity-0",
                )}
              >
                <div className="relative shrink-0 overflow-hidden bg-[#00206F] px-5 pb-5 pt-5 text-white sm:px-6 sm:pb-6 sm:pt-6">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-10 -top-16 size-48 rounded-full bg-[#25D366]/20 blur-3xl"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -bottom-20 left-8 size-40 rounded-full bg-[#FB7801]/25 blur-3xl"
                  />

                  <div className="relative flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <span className="mt-0.5 flex size-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur-sm">
                        <WhatsAppIcon className="size-6 text-[#5dff9a]" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold tracking-[0.18em] text-white/55 uppercase">
                          Student invites
                        </p>
                        <h2
                          id="whatsapp-group-title"
                          className="mt-1 text-xl font-semibold tracking-tight"
                        >
                          WhatsApp by track
                        </h2>
                        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-white/70">
                          Each registrant gets the invite for their chosen
                          track — in the success modal and confirmation email.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      aria-label="Close"
                      onClick={() => setOpen(false)}
                      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/15 hover:text-white active:scale-[0.97]"
                    >
                      <XIcon className="size-4" />
                    </button>
                  </div>

                  <div className="relative mt-5 flex items-center gap-3">
                    <div className="rounded-xl bg-white/10 px-3 py-2 ring-1 ring-white/10">
                      <p className="text-[11px] font-medium tracking-wide text-white/55 uppercase">
                        Configured
                      </p>
                      <p className="mt-0.5 text-sm font-semibold tabular-nums">
                        {configuredCount}
                        <span className="font-medium text-white/50">
                          {" "}
                          / {tracks.length}
                        </span>
                      </p>
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
                  </div>
                </div>

                <form
                  onSubmit={handleSave}
                  className="flex min-h-0 flex-1 flex-col"
                >
                  <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
                    {tracks.map((track, index) => {
                      const filled = isFilled(urls[track.id] || "")
                      return (
                        <div
                          key={track.id}
                          className={cn(
                            "rounded-2xl border bg-white p-3.5 shadow-[0_1px_0_rgba(0,32,111,0.04)] transition-[border-color,box-shadow] sm:p-4",
                            filled
                              ? "border-[#25D366]/35 shadow-[0_8px_24px_-18px_rgba(37,211,102,0.55)]"
                              : "border-black/5",
                          )}
                        >
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#00206F] text-[11px] font-bold tracking-wide text-white">
                                {TRACK_SHORT[track.id] || track.id.slice(0, 2).toUpperCase()}
                              </span>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-[#001752]">
                                  {track.label}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Invite for this track only
                                </p>
                              </div>
                            </div>
                            <span
                              className={cn(
                                "inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold",
                                filled
                                  ? "bg-[#e8faf0] text-[#128c4a]"
                                  : "bg-black/[0.04] text-muted-foreground",
                              )}
                            >
                              {filled ? (
                                <>
                                  <CheckIcon className="size-3" />
                                  Ready
                                </>
                              ) : (
                                "Needed"
                              )}
                            </span>
                          </div>

                          <label className="block">
                            <span className="sr-only">{track.label} invite link</span>
                            <div className="relative">
                              <Link2Icon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground/70" />
                              <Input
                                value={urls[track.id] || ""}
                                onChange={(event) =>
                                  setUrls((current) => ({
                                    ...current,
                                    [track.id]: event.target.value,
                                  }))
                                }
                                placeholder="https://chat.whatsapp.com/..."
                                disabled={loading}
                                autoFocus={index === 0}
                                className="h-11 rounded-xl border-black/8 bg-[#f7f8fb] pr-3.5 pl-10 text-[14px] shadow-none focus-visible:bg-white md:text-[14px]"
                              />
                            </div>
                          </label>
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex shrink-0 items-center justify-between gap-3 border-t border-black/5 bg-white/80 px-4 py-4 backdrop-blur-sm sm:px-5">
                    <p className="hidden text-xs text-muted-foreground sm:block">
                      Leave a track blank to keep the fallback link.
                    </p>
                    <div className="ml-auto flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-10 rounded-xl px-4"
                        onClick={() => setOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="h-10 rounded-xl bg-[#00206F] px-5 text-white hover:bg-[#001752] active:scale-[0.98]"
                        disabled={loading || pending || !isDirty}
                      >
                        {pending ? "Saving..." : "Save changes"}
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}
