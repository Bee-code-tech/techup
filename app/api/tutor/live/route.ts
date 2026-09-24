import { NextResponse } from "next/server"
import { isNextResponse, requireTutorOrAdmin } from "@/lib/api-auth"
import { db } from "@/lib/db"
import { markLiveJoin } from "@/lib/live-attendance"
import {
  isAllowedLiveTrack,
  isInAppLive,
  liveJoinHref,
  liveSessionDurationMs,
  liveTrackLabel,
  liveTrackOptions,
  LIVEKIT_PLATFORM,
} from "@/lib/live-session"
import {
  defaultLivePlatform,
  ensureLiveRoom,
  livekitConfigured,
} from "@/lib/livekit"

function mapSession(
  session: {
    id: string
    track: string
    title: string
    platform: string
    joinUrl: string
    audience: string
    isActive: boolean
    scheduledAt?: Date | null
    endedAt: Date | null
    createdAt: Date
    recordingStatus?: string
    attendance?: Array<{ role: string }>
  },
) {
  const scheduledAt = session.scheduledAt ?? session.createdAt
  const joinedCount = (session.attendance || []).filter(
    (row) => row.role === "student",
  ).length
  return {
    id: session.id,
    track: session.track,
    title: session.title,
    platform: session.platform,
    joinUrl: liveJoinHref(session),
    inApp: isInAppLive(session.platform),
    audience: session.audience,
    isActive: session.isActive,
    trackLabel: liveTrackLabel(session.track),
    scheduledAt: scheduledAt.toISOString(),
    createdAt: session.createdAt.toISOString(),
    endedAt: session.endedAt?.toISOString() ?? null,
    joinedCount,
    durationMs: liveSessionDurationMs({
      scheduledAt,
      createdAt: session.createdAt,
      endedAt: session.endedAt,
      isActive: session.isActive,
    }),
    recordingStatus: session.recordingStatus || "idle",
  }
}

export async function GET() {
  const auth = await requireTutorOrAdmin()
  if (isNextResponse(auth)) return auth

  const sessions = await db.liveSession.findMany({
    where: auth.role === "admin" ? undefined : { tutorId: auth.userId },
    orderBy: [{ isActive: "desc" }, { scheduledAt: "asc" }, { createdAt: "desc" }],
    take: 50,
    include: {
      attendance: { select: { role: true } },
    },
  })

  return NextResponse.json({
    tracks: liveTrackOptions(),
    sessions: sessions.map(mapSession),
    livekitConfigured: livekitConfigured(),
  })
}

type CreateBody = {
  track?: string
  title?: string
  platform?: string
  joinUrl?: string
  audience?: string
  scheduledAt?: string
}

export async function POST(request: Request) {
  const auth = await requireTutorOrAdmin()
  if (isNextResponse(auth)) return auth

  const body = (await request.json()) as CreateBody
  const track = String(body.track ?? "").trim()
  const title = String(body.title ?? "Live class").trim() || "Live class"
  const requestedPlatform = String(body.platform ?? defaultLivePlatform())
  const platform =
    requestedPlatform === "zoom"
      ? "zoom"
      : requestedPlatform === LIVEKIT_PLATFORM
        ? LIVEKIT_PLATFORM
        : "meet"
  const joinUrl = String(body.joinUrl ?? "").trim()
  const audience =
    body.audience === "free" || body.audience === "paid"
      ? body.audience
      : "both"

  if (!isAllowedLiveTrack(track)) {
    return NextResponse.json(
      { error: "Pick a track, or All tracks." },
      { status: 400 },
    )
  }
  if (platform === LIVEKIT_PLATFORM && !livekitConfigured()) {
    return NextResponse.json(
      { error: "In-app classroom is not configured yet." },
      { status: 503 },
    )
  }
  if (platform !== LIVEKIT_PLATFORM && !/^https?:\/\//i.test(joinUrl)) {
    return NextResponse.json(
      { error: "Enter a valid Zoom or Google Meet URL." },
      { status: 400 },
    )
  }

  const scheduledAt = body.scheduledAt
    ? new Date(body.scheduledAt)
    : new Date()
  if (Number.isNaN(scheduledAt.getTime())) {
    return NextResponse.json(
      { error: "Pick a valid date and time." },
      { status: 400 },
    )
  }

  // Treat "now or within 2 minutes" as going live immediately.
  const goLiveNow = scheduledAt.getTime() <= Date.now() + 2 * 60 * 1000

  if (goLiveNow) {
    await db.liveSession.updateMany({
      where: { tutorId: auth.userId, isActive: true },
      data: { isActive: false, endedAt: new Date() },
    })
  }

  const created = await db.liveSession.create({
    data: {
      track,
      tutorId: auth.userId,
      title,
      platform,
      joinUrl:
        platform === LIVEKIT_PLATFORM ? "in-app" : joinUrl,
      audience,
      scheduledAt,
      isActive: goLiveNow,
      endedAt: null,
    },
  })

  const session =
    platform === LIVEKIT_PLATFORM
      ? await db.liveSession.update({
          where: { id: created.id },
          data: { joinUrl: `/dashboard/live/${created.id}` },
        })
      : created

  if (goLiveNow && platform === LIVEKIT_PLATFORM) {
    await ensureLiveRoom(session.id)
    await markLiveJoin({
      sessionId: session.id,
      userId: auth.userId,
      role: auth.role,
    })
  }

  return NextResponse.json({
    ok: true,
    session: mapSession(session),
  })
}
