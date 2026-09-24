import { NextResponse } from "next/server"

import { isNextResponse, requireAnyAuth } from "@/lib/api-auth"
import { bootcampTracks } from "@/lib/bootcamp"
import { db } from "@/lib/db"
import {
  audienceAllowsStudent,
  isInAppLive,
  liveJoinHref,
  livePlatformLabel,
} from "@/lib/live-session"
import { livekitConfigured } from "@/lib/livekit"

export const runtime = "nodejs"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireAnyAuth()
  if (isNextResponse(auth)) return auth

  const { id } = await context.params
  const session = await db.liveSession.findUnique({
    where: { id },
    include: { tutor: { select: { name: true } } },
  })
  if (!session) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 })
  }

  const isHost =
    auth.role === "admin" ||
    (auth.role === "tutor" && session.tutorId === auth.userId)

  if (!isHost) {
    if (auth.role !== "student") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    const user = await db.user.findUnique({
      where: { id: auth.userId },
      select: { track: true, accessTier: true },
    })
    if (!user?.track || user.track !== session.track) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    if (!audienceAllowsStudent(user.accessTier, session.audience)) {
      return NextResponse.json(
        { error: "This class is not available on your plan." },
        { status: 403 },
      )
    }
  }

  const status = session.isActive
    ? "live"
    : session.endedAt
      ? "ended"
      : "upcoming"

  return NextResponse.json({
    session: {
      id: session.id,
      title: session.title,
      platform: session.platform,
      joinUrl: liveJoinHref(session),
      inApp: isInAppLive(session.platform),
      audience: session.audience,
      isActive: session.isActive,
      status,
      trackLabel: bootcampTracks[session.track] || session.track,
      tutorName: session.tutor.name,
      platformLabel: livePlatformLabel(session.platform),
      scheduledAt:
        session.scheduledAt?.toISOString() ?? session.createdAt.toISOString(),
      endedAt: session.endedAt?.toISOString() ?? null,
      recordingStatus: session.recordingStatus,
    },
    role: auth.role,
    isHost,
    livekitConfigured: livekitConfigured(),
  })
}
