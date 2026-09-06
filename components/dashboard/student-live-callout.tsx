"use client"

import { useCallback, useEffect, useState } from "react"
import { RadioIcon } from "lucide-react"

type LiveSession = {
  id: string
  title: string
  platform: string
  joinUrl: string
  audience: string
  trackLabel: string
  tutorName: string
}

/** Shows only when a tutor has an active live session for this student. */
export function StudentLiveCallout() {
  const [session, setSession] = useState<LiveSession | null>(null)

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/student/live")
      const payload = (await response.json()) as {
        session?: LiveSession | null
      }
      if (!response.ok) return
      setSession(payload.session || null)
    } catch {
      // Silent — overview stays usable without live status
    }
  }, [])

  useEffect(() => {
    void load()
    const timer = window.setInterval(() => void load(), 30000)
    return () => window.clearInterval(timer)
  }, [load])

  if (!session) return null

  const platformLabel = session.platform === "zoom" ? "Zoom" : "Google Meet"

  return (
    <section className="rounded-xl border border-[#25D366]/25 bg-[#f3fff8] px-5 py-5 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#e8faf0] text-[#128c4a]">
            <RadioIcon className="size-4" aria-hidden />
          </span>
          <div>
            <p className="text-[11px] font-semibold tracking-[0.14em] text-[#128c4a] uppercase">
              Live now
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-[#001752]">
              {session.title}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {session.trackLabel} · {platformLabel} with {session.tutorName}
            </p>
          </div>
        </div>
        <a
          href={session.joinUrl}
          target="_blank"
          rel="noreferrer"
          className="admin-press inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-[#00206F] px-4 text-sm font-semibold text-white hover:bg-[#001752]"
        >
          Join {platformLabel}
        </a>
      </div>
    </section>
  )
}
