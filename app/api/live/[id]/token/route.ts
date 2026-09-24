import { NextResponse } from "next/server"

import { isNextResponse, requireAnyAuth } from "@/lib/api-auth"
import { db } from "@/lib/db"
import {
  audienceAllowsStudent,
  isInAppLive,
  LIVE_CLASS_CAP,
} from "@/lib/live-session"
import { markLiveJoin } from "@/lib/live-attendance"
import {
  countLiveStudents,
  createLiveToken,
  livekitConfigured,
  livekitUrl,
} from "@/lib/livekit"

export const runtime = "nodejs"

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(_request: Request, context: RouteContext) {
  const auth = await requireAnyAuth()
  if (isNextResponse(auth)) return auth

  if (!livekitConfigured()) {
    return NextResponse.json(
      { error: "Live classroom is not configured yet." },
      { status: 503 },
    )
  }

  const { id } = await context.params
  const session = await db.liveSession.findUnique({ where: { id } })
  if (!session) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 })
  }
  if (!isInAppLive(session.platform)) {
    return NextResponse.json(
      { error: "This session uses an external meeting link." },
      { status: 400 },
    )
  }

  const isHost =
    auth.role === "admin" ||
    (auth.role === "tutor" && session.tutorId === auth.userId)

  if (!isHost) {
    if (auth.role !== "student") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    if (!session.isActive) {
      return NextResponse.json(
        { error: "This class is not live yet." },
        { status: 409 },
      )
    }
    const user = await db.user.findUnique({
      where: { id: auth.userId },
      select: { track: true, accessTier: true, name: true },
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

    const studentsInRoom = await countLiveStudents(session.id)
    if (studentsInRoom >= LIVE_CLASS_CAP) {
      return NextResponse.json(
        {
          error: `This class is full (${LIVE_CLASS_CAP} students).`,
        },
        { status: 409 },
      )
    }
  } else if (!session.isActive) {
    return NextResponse.json(
      { error: "Start the class before joining the room." },
      { status: 409 },
    )
  }

  const profile = await db.user.findUnique({
    where: { id: auth.userId },
    select: { name: true, avatarUrl: true },
  })

  await markLiveJoin({
    sessionId: session.id,
    userId: auth.userId,
    role: auth.role,
  })

  const token = await createLiveToken({
    sessionId: session.id,
    userId: auth.userId,
    name: profile?.name || "Guest",
    role: auth.role,
    avatarUrl: profile?.avatarUrl,
  })

  return NextResponse.json({
    token,
    url: livekitUrl(),
    cap: LIVE_CLASS_CAP,
  })
}
