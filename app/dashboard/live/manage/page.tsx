"use client"

import { useCallback, useEffect, useState } from "react"
import toast from "react-hot-toast"

import { DashboardContentSkeleton } from "@/components/dashboard/page-skeletons"
import { Select } from "@/components/marketing/Select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type TrackOption = { id: string; label: string }
type LiveSession = {
  id: string
  title: string
  track: string
  trackLabel: string
  platform: string
  joinUrl: string
  audience: string
  isActive: boolean
  createdAt: string
}

const fieldClass =
  "h-11 rounded-xl border-black/8 bg-[#f7f8fb] px-3.5 text-[15px] shadow-none md:text-[15px]"

export default function TutorLiveManagePage() {
  return <LiveManager />
}

function LiveManager() {
  const [tracks, setTracks] = useState<TrackOption[]>([])
  const [sessions, setSessions] = useState<LiveSession[]>([])
  const [track, setTrack] = useState("")
  const [title, setTitle] = useState("Live class")
  const [platform, setPlatform] = useState("meet")
  const [joinUrl, setJoinUrl] = useState("")
  const [audience, setAudience] = useState("both")
  const [pending, setPending] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const response = await fetch("/api/tutor/live")
      const payload = (await response.json()) as {
        tracks?: TrackOption[]
        sessions?: LiveSession[]
        error?: string
      }
      if (!response.ok) {
        if (!silent) toast.error(payload.error || "Could not load live sessions.")
        return
      }
      setTracks(payload.tracks || [])
      setSessions(payload.sessions || [])
      setTrack((current) => current || payload.tracks?.[0]?.id || "")
    } catch {
      if (!silent) toast.error("Network error.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load(false)
  }, [load])

  async function startSession(event: React.FormEvent) {
    event.preventDefault()
    setPending(true)
    try {
      const response = await fetch("/api/tutor/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ track, title, platform, joinUrl, audience }),
      })
      const payload = (await response.json()) as { error?: string }
      if (!response.ok) {
        toast.error(payload.error || "Could not start session.")
        return
      }
      toast.success("Live session started.")
      setJoinUrl("")
      await load(true)
    } catch {
      toast.error("Network error.")
    } finally {
      setPending(false)
    }
  }

  async function endSession(id: string) {
    const response = await fetch(`/api/tutor/live/${id}`, { method: "PATCH" })
    const payload = (await response.json()) as { error?: string }
    if (!response.ok) {
      toast.error(payload.error || "Could not end session.")
      return
    }
    toast.success("Live session ended.")
    await load(true)
  }

  if (loading && sessions.length === 0 && tracks.length === 0) {
    return <DashboardContentSkeleton />
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6 md:py-8">
      <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-xs sm:p-6">
        <h2 className="text-lg font-semibold text-[#001752]">Start live class</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste a Zoom or Google Meet link. Only students on this track (and
          matching free/paid audience) will see it.
        </p>
        <form onSubmit={startSession} className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <span className="text-sm font-medium">Track</span>
            <Select
              value={track || undefined}
              onValueChange={setTrack}
              options={tracks.map((item) => ({
                value: item.id,
                label: item.label,
              }))}
              required
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-medium">Platform</span>
            <Select
              value={platform}
              onValueChange={setPlatform}
              options={[
                { value: "meet", label: "Google Meet" },
                { value: "zoom", label: "Zoom" },
              ]}
            />
          </div>
          <label className="block space-y-2 sm:col-span-2">
            <span className="text-sm font-medium">Title</span>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="block space-y-2 sm:col-span-2">
            <span className="text-sm font-medium">Join URL</span>
            <Input
              value={joinUrl}
              onChange={(event) => setJoinUrl(event.target.value)}
              placeholder="https://meet.google.com/..."
              required
              className={fieldClass}
            />
          </label>
          <div className="space-y-2">
            <span className="text-sm font-medium">Audience</span>
            <Select
              value={audience}
              onValueChange={setAudience}
              options={[
                { value: "both", label: "Free + paid students" },
                { value: "free", label: "Free only" },
                { value: "paid", label: "Paid only" },
              ]}
            />
          </div>
          <div className="flex items-end">
            <Button
              type="submit"
              disabled={pending || !tracks.length}
              className="h-11 rounded-xl bg-[#00206F] px-5 text-white hover:bg-[#001752]"
            >
              {pending ? "Starting..." : "Go live"}
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-black/5 bg-white shadow-xs">
        <div className="border-b border-black/5 px-5 py-4">
          <h3 className="font-semibold text-[#001752]">Sessions</h3>
        </div>
        <div className="divide-y divide-black/5">
          {sessions.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">
              No sessions yet.
            </p>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-[#001752]">
                    {session.title}{" "}
                    <span
                      className={
                        session.isActive
                          ? "text-xs font-semibold text-[#128c4a]"
                          : "text-xs text-muted-foreground"
                      }
                    >
                      {session.isActive ? "LIVE" : "Ended"}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {session.trackLabel} · {session.platform} · {session.audience}
                  </p>
                  <a
                    href={session.joinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 block truncate text-sm text-[#00206F] underline-offset-2 hover:underline"
                  >
                    {session.joinUrl}
                  </a>
                </div>
                {session.isActive ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void endSession(session.id)}
                  >
                    End session
                  </Button>
                ) : null}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
