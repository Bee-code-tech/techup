import { bootcampTracks } from "@/lib/bootcamp"

/** In-app classroom vs leftover Zoom/Meet links. */

export const LIVE_CLASS_CAP = 100
export const LIVEKIT_PLATFORM = "livekit"
export const LIVE_ALL_TRACKS = "all"

export function isAllTracksLive(track?: string | null) {
  return track === LIVE_ALL_TRACKS
}

export function liveTrackLabel(track?: string | null) {
  if (isAllTracksLive(track)) return "All tracks"
  return bootcampTracks[track || ""] || track || "Track"
}

export function liveSessionAllowsTrack(
  sessionTrack: string,
  studentTrack?: string | null,
) {
  if (!studentTrack) return false
  return isAllTracksLive(sessionTrack) || sessionTrack === studentTrack
}

export function isAllowedLiveTrack(track: string) {
  return isAllTracksLive(track) || Boolean(bootcampTracks[track])
}

export function liveTrackOptions() {
  return [
    { id: LIVE_ALL_TRACKS, label: liveTrackLabel(LIVE_ALL_TRACKS) },
    ...Object.entries(bootcampTracks).map(([id, label]) => ({ id, label })),
  ]
}

export function pickPreferredLiveSession<T extends { track: string }>(
  sessions: T[],
  studentTrack: string,
) {
  return (
    sessions.find((session) => session.track === studentTrack) ??
    sessions.find((session) => isAllTracksLive(session.track)) ??
    sessions[0] ??
    null
  )
}

export function isInAppLive(platform?: string | null) {
  return platform === LIVEKIT_PLATFORM
}

export function liveJoinHref(session: {
  id: string
  platform?: string | null
  joinUrl?: string | null
}) {
  if (isInAppLive(session.platform)) {
    return `/dashboard/live/${session.id}`
  }
  return String(session.joinUrl || "").trim()
}

export function livePlatformLabel(platform?: string | null) {
  if (platform === "zoom") return "Zoom"
  if (platform === LIVEKIT_PLATFORM) return "TechUp classroom"
  return "Google Meet"
}

/** Matches existing student live query: paid can join any; free cannot join paid-only. */
export function audienceAllowsStudent(
  accessTier: string | null | undefined,
  audience: string,
) {
  if (audience === "paid") return accessTier === "paid"
  return true
}

export function liveSessionChannel(sessionId: string) {
  return `live:session:${sessionId}`
}

export function isLiveRoomPath(pathname: string) {
  return /^\/dashboard\/live\/[a-f0-9]{24}$/i.test(pathname)
}

export function liveSessionDurationMs(options: {
  scheduledAt?: Date | string | null
  createdAt?: Date | string | null
  endedAt?: Date | string | null
  isActive?: boolean
  now?: Date
}) {
  const startRaw = options.scheduledAt ?? options.createdAt
  if (!startRaw) return null
  const start = new Date(startRaw)
  if (Number.isNaN(start.getTime())) return null
  const end = options.endedAt
    ? new Date(options.endedAt)
    : options.isActive
      ? (options.now ?? new Date())
      : null
  if (!end || Number.isNaN(end.getTime())) return null
  return Math.max(0, end.getTime() - start.getTime())
}

export function formatLiveDuration(ms: number | null | undefined) {
  if (ms == null) return "—"
  const minutes = Math.round(ms / 60_000)
  if (minutes < 1) return "< 1 min"
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (rest === 0) return hours === 1 ? "1 hr" : `${hours} hr`
  return `${hours}h ${rest}m`
}
