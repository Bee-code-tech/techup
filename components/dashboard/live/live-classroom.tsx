"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

import { LiveRoom } from "@/components/dashboard/live/live-room"
import { SolarIcon } from "@/components/icons/solar-icon"
import { useSessionUser } from "@/components/dashboard/use-session"

type SessionPayload = {
  id: string
  title: string
  platform: string
  joinUrl: string
  inApp: boolean
  isActive: boolean
  status: "live" | "upcoming" | "ended"
  trackLabel: string
  tutorName: string
  platformLabel: string
  scheduledAt: string
  recordingStatus?: string
}

export function LiveClassroom({ sessionId }: { sessionId: string }) {
  const router = useRouter()
  const { user } = useSessionUser()
  const [session, setSession] = useState<SessionPayload | null>(null)
  const [isHost, setIsHost] = useState(false)
  const [livekitReady, setLivekitReady] = useState(true)
  const [token, setToken] = useState("")
  const [serverUrl, setServerUrl] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [ending, setEnding] = useState(false)
  const [recordingBusy, setRecordingBusy] = useState(false)
  const endingRef = useRef(false)

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/live/${sessionId}`)
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string
        session?: SessionPayload
        isHost?: boolean
        livekitConfigured?: boolean
      }
      if (!response.ok || !payload.session) {
        setError(payload.error || "Could not open this class.")
        return
      }
      setSession(payload.session)
      setIsHost(Boolean(payload.isHost))
      setLivekitReady(payload.livekitConfigured !== false)
      setError("")

      if (!payload.session.inApp && payload.session.joinUrl) {
        window.location.href = payload.session.joinUrl
        return
      }
    } catch {
      setError("Network error.")
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    void load()
    const timer = window.setInterval(() => void load(), 15000)
    return () => window.clearInterval(timer)
  }, [load])

  useEffect(() => {
    if (!session?.inApp || session.status !== "live" || !livekitReady) return
    if (token) return
    let cancelled = false
    void (async () => {
      try {
        const response = await fetch(`/api/live/${sessionId}/token`, {
          method: "POST",
        })
        const payload = (await response.json().catch(() => ({}))) as {
          error?: string
          token?: string
          url?: string
        }
        if (cancelled) return
        if (!response.ok || !payload.token || !payload.url) {
          if (response.status !== 409) {
            setError(payload.error || "Could not join the classroom.")
          }
          return
        }
        setToken(payload.token)
        setServerUrl(payload.url)
        setError("")
      } catch {
        if (!cancelled) setError("Could not join the classroom.")
      }
    })()
    return () => {
      cancelled = true
    }
  }, [livekitReady, session?.inApp, session?.status, sessionId, token])

  async function startClass() {
    setStarting(true)
    try {
      const response = await fetch(`/api/tutor/live/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      })
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as {
          error?: string
        }
        toast.error(payload.error || "Could not start class.")
        return
      }
      toast.success("You're live.")
      setToken("")
      await load()
    } catch {
      toast.error("Network error.")
    } finally {
      setStarting(false)
    }
  }

  async function startRecording() {
    if (recordingBusy || session?.recordingStatus === "recording") return
    setRecordingBusy(true)
    try {
      const response = await fetch(`/api/tutor/live/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "record" }),
      })
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string
      }
      if (!response.ok) {
        toast.error(payload.error || "Could not start recording.")
        return
      }
      setSession((current) =>
        current ? { ...current, recordingStatus: "recording" } : current,
      )
      toast.success("Recording started.")
    } catch {
      toast.error("Network error.")
    } finally {
      setRecordingBusy(false)
    }
  }

  async function endClass() {
    if (endingRef.current) return
    endingRef.current = true
    setEnding(true)
    try {
      const response = await fetch(`/api/tutor/live/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "end" }),
      })
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as {
          error?: string
        }
        toast.error(payload.error || "Could not end class.")
        endingRef.current = false
        setEnding(false)
        return
      }
      toast.success("Live session ended.")
      router.push(`/dashboard/live/${sessionId}/recap`)
    } catch {
      toast.error("Network error.")
      endingRef.current = false
      setEnding(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-dvh items-center justify-center bg-[#f5f7fb] text-muted-foreground">
        Opening classroom…
      </div>
    )
  }

  if (error && !token) {
    return (
      <Gate
        title="Can’t join right now"
        copy={error}
        action="Back to dashboard"
        onAction={() => router.push("/dashboard")}
      />
    )
  }

  if (!session) return null

  if (!session.inApp) {
    return (
      <Gate
        title="Opening meeting"
        copy="Taking you to the Zoom or Meet link."
        action="Back to dashboard"
        onAction={() => router.push("/dashboard")}
      />
    )
  }

  if (!livekitReady) {
    return (
      <Gate
        title="Classroom not configured"
        copy="Add LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET, then start the class again."
        action="Back to dashboard"
        onAction={() => router.push("/dashboard")}
      />
    )
  }

  if (session.status === "ended") {
    return (
      <Gate
        title="Class ended"
        copy={`${session.title} is no longer live.`}
        action="Back to dashboard"
        onAction={() => router.push("/dashboard")}
      />
    )
  }

  if (session.status === "upcoming") {
    return (
      <Gate
        title={session.title}
        copy={`${session.trackLabel} with ${session.tutorName}. The tutor has not gone live yet.`}
        action="Back to dashboard"
        onAction={() => router.push("/dashboard")}
        secondaryAction={
          isHost
            ? starting
              ? "Starting…"
              : "Start class"
            : undefined
        }
        onSecondaryAction={
          isHost && !starting ? () => void startClass() : undefined
        }
      />
    )
  }

  if (!token || !serverUrl || !user) {
    return (
      <div className="flex h-dvh items-center justify-center bg-[#f5f7fb] text-muted-foreground">
        Joining classroom…
      </div>
    )
  }

  return (
    <LiveRoom
      token={token}
      serverUrl={serverUrl}
      sessionId={session.id}
      title={session.title}
      tutorName={session.tutorName}
      isHost={isHost}
      userId={user.id}
      userName={user.name}
      userAvatar={user.avatarUrl}
      ending={ending}
      onLeave={() => {
        if (endingRef.current) return
        router.push("/dashboard")
      }}
      onEnd={isHost ? () => void endClass() : undefined}
      recordingStatus={session.recordingStatus}
      recordingBusy={recordingBusy}
      onStartRecording={isHost ? () => void startRecording() : undefined}
    />
  )
}

function Gate({
  title,
  copy,
  action,
  onAction,
  secondaryAction,
  onSecondaryAction,
}: {
  title: string
  copy: string
  action: string
  onAction: () => void
  secondaryAction?: string
  onSecondaryAction?: () => void
}) {
  return (
    <div className="flex h-dvh items-center justify-center bg-[#f5f7fb] px-6">
      <div className="w-full max-w-md rounded-2xl border border-black/8 bg-white p-6 text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-[#fff1e6] text-[#FB7801]">
          <SolarIcon name="videocamera" className="size-5" />
        </div>
        <h1 className="text-lg font-semibold text-[#001752]">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy}</p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
          {secondaryAction && onSecondaryAction ? (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-[#FB7801] px-4 text-sm font-semibold text-white"
            >
              {secondaryAction}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onAction}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-[#00206F] px-4 text-sm font-semibold text-white"
          >
            {action}
          </button>
        </div>
      </div>
    </div>
  )
}
