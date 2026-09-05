"use client"

import { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { bootcampTracks } from "@/lib/bootcamp"

type TrackOption = { id: string; label: string }

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

export function WhatsappGroupNav() {
  const [open, setOpen] = useState(false)
  const [urls, setUrls] = useState<Record<string, string>>(emptyUrls)
  const [savedUrls, setSavedUrls] = useState<Record<string, string>>(emptyUrls)
  const [tracks, setTracks] = useState<TrackOption[]>(
    Object.entries(bootcampTracks).map(([id, label]) => ({ id, label })),
  )
  const [loading, setLoading] = useState(false)
  const [pending, setPending] = useState(false)

  const isDirty = useMemo(
    () =>
      tracks.some((track) => (urls[track.id] || "") !== (savedUrls[track.id] || "")),
    [savedUrls, tracks, urls],
  )

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
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <button
                type="button"
                aria-label="Close dialog"
                className="absolute inset-0 z-0 bg-black/30 backdrop-blur-sm"
                onClick={() => setOpen(false)}
              />
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="whatsapp-group-title"
                className="relative z-10 flex max-h-[min(90vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border bg-background shadow-lg"
              >
                <div className="shrink-0 border-b px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-[#25D366] text-white">
                      <WhatsAppIcon className="size-5" />
                    </span>
                    <div>
                      <h2
                        id="whatsapp-group-title"
                        className="text-base font-semibold tracking-tight"
                      >
                        WhatsApp groups by track
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Students see the link for the track they registered for.
                      </p>
                    </div>
                  </div>
                </div>

                <form
                  onSubmit={handleSave}
                  className="flex min-h-0 flex-1 flex-col"
                >
                  <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
                    {tracks.map((track, index) => (
                      <label key={track.id} className="block space-y-2">
                        <span className="text-sm font-medium">{track.label}</span>
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
                          className="h-11 px-3.5 text-[15px] md:text-[15px]"
                        />
                      </label>
                    ))}
                  </div>

                  <div className="flex shrink-0 items-center justify-end gap-2 border-t px-5 py-4">
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-10"
                      onClick={() => setOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="h-10 bg-[#25D366] px-4 text-white hover:bg-[#1ebe57]"
                      disabled={loading || pending || !isDirty}
                    >
                      {pending ? "Saving..." : "Save links"}
                    </Button>
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
