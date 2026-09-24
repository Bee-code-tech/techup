import {
  AccessToken,
  EgressClient,
  EgressStatus,
  EncodedFileOutput,
  EncodedFileType,
  RoomServiceClient,
  S3Upload,
  TrackSource,
} from "livekit-server-sdk"

import { LIVE_CLASS_CAP, LIVEKIT_PLATFORM } from "@/lib/live-session"
import { getTigrisConfig } from "@/lib/tigris"

export function livekitUrl() {
  return process.env.LIVEKIT_URL?.trim() || ""
}

export function livekitApiKey() {
  return process.env.LIVEKIT_API_KEY?.trim() || ""
}

export function livekitApiSecret() {
  return process.env.LIVEKIT_API_SECRET?.trim() || ""
}

export function livekitConfigured() {
  return Boolean(livekitUrl() && livekitApiKey() && livekitApiSecret())
}

export function livekitHttpUrl() {
  return livekitUrl().replace(/^wss:/i, "https:").replace(/^ws:/i, "http:")
}

export function livekitRoomName(sessionId: string) {
  return `techup-live-${sessionId}`
}

export function defaultLivePlatform() {
  return livekitConfigured() ? LIVEKIT_PLATFORM : "meet"
}

function roomService() {
  if (!livekitConfigured()) return null
  return new RoomServiceClient(
    livekitHttpUrl(),
    livekitApiKey(),
    livekitApiSecret(),
  )
}

function egressClient() {
  if (!livekitConfigured()) return null
  return new EgressClient(
    livekitHttpUrl(),
    livekitApiKey(),
    livekitApiSecret(),
  )
}

export function liveRecordingKey(sessionId: string) {
  return `techup/live/${sessionId}/classroom.mp4`
}

export function liveRecordingUrl(sessionId: string) {
  const tigris = getTigrisConfig()
  if (!tigris.ok) return ""
  return `${tigris.publicBase!.replace(/\/$/, "")}/${liveRecordingKey(sessionId)}`
}

export async function startLiveRecording(sessionId: string) {
  const egress = egressClient()
  const tigris = getTigrisConfig()
  if (!egress || !tigris.ok) {
    return { ok: false as const, error: "Recording storage is not ready." }
  }

  try {
    const output = new EncodedFileOutput({
      fileType: EncodedFileType.MP4,
      filepath: liveRecordingKey(sessionId),
      output: {
        case: "s3",
        value: new S3Upload({
          accessKey: tigris.accessKeyId,
          secret: tigris.secretAccessKey,
          bucket: tigris.bucket,
          region: "auto",
          endpoint: tigris.endpoint,
          forcePathStyle: false,
        }),
      },
    })
    const info = await egress.startRoomCompositeEgress(
      livekitRoomName(sessionId),
      output,
      { layout: "speaker" },
    )
    if (
      info.error ||
      info.status === EgressStatus.EGRESS_FAILED ||
      info.status === EgressStatus.EGRESS_ABORTED
    ) {
      return {
        ok: false as const,
        error: info.error || "Recording did not start.",
      }
    }
    return {
      ok: true as const,
      egressId: info.egressId,
      key: liveRecordingKey(sessionId),
      url: liveRecordingUrl(sessionId),
    }
  } catch (error) {
    console.error("[livekit] start egress failed", error)
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Could not start recording.",
    }
  }
}

export async function stopLiveRecording(egressId?: string | null) {
  const egress = egressClient()
  if (!egress || !egressId) {
    return { ok: false as const, error: "No recording to stop." }
  }
  try {
    const info = await egress.stopEgress(egressId)
    const file = info.fileResults?.[0]
    const failed =
      Boolean(info.error) ||
      info.status === EgressStatus.EGRESS_FAILED ||
      info.status === EgressStatus.EGRESS_ABORTED
    if (failed) {
      return {
        ok: false as const,
        location: file?.location || "",
        error: info.error || "Recording did not finish.",
      }
    }
    return {
      ok: true as const,
      location: file?.location || "",
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : ""
    if (/not found|already|complete/i.test(message)) {
      return { ok: true as const, location: "" }
    }
    console.error("[livekit] stop egress failed", error)
    return { ok: false as const, error: message || "Could not stop recording." }
  }
}

export async function ensureLiveRoom(sessionId: string) {
  const rooms = roomService()
  if (!rooms) return
  try {
    await rooms.createRoom({
      name: livekitRoomName(sessionId),
      maxParticipants: LIVE_CLASS_CAP + 2,
      emptyTimeout: 60 * 60,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : ""
    if (!/already exists|conflict/i.test(message)) {
      console.error("[livekit] createRoom failed", error)
    }
  }
}

export async function closeLiveRoom(sessionId: string) {
  const rooms = roomService()
  if (!rooms) return
  try {
    await rooms.deleteRoom(livekitRoomName(sessionId))
  } catch (error) {
    const message = error instanceof Error ? error.message : ""
    if (!/not found|unknown room/i.test(message)) {
      console.error("[livekit] deleteRoom failed", error)
    }
  }
}

export async function countLiveStudents(sessionId: string) {
  const rooms = roomService()
  if (!rooms) return 0
  try {
    const participants = await rooms.listParticipants(
      livekitRoomName(sessionId),
    )
    return participants.filter((participant) => {
      try {
        const meta = JSON.parse(participant.metadata || "{}") as {
          role?: string
        }
        return meta.role === "student"
      } catch {
        return true
      }
    }).length
  } catch {
    return 0
  }
}

export async function createLiveToken(options: {
  sessionId: string
  userId: string
  name: string
  role: string
  avatarUrl?: string | null
}) {
  const isHost = options.role === "tutor" || options.role === "admin"
  const token = new AccessToken(livekitApiKey(), livekitApiSecret(), {
    identity: options.userId,
    name: options.name,
    ttl: "6h",
    metadata: JSON.stringify({
      role: options.role,
      avatarUrl: options.avatarUrl || "",
    }),
  })

  token.addGrant({
    roomJoin: true,
    room: livekitRoomName(options.sessionId),
    canSubscribe: true,
    canPublish: true,
    canPublishData: true,
    canPublishSources: isHost
      ? [TrackSource.CAMERA, TrackSource.MICROPHONE, TrackSource.SCREEN_SHARE]
      : [TrackSource.MICROPHONE],
  })

  return token.toJwt()
}
