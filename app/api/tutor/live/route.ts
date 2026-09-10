import { NextResponse } from "next/server"
import { isNextResponse, requireTutorOrAdmin } from "@/lib/api-auth"
import { bootcampTracks } from "@/lib/bootcamp"
import { db } from "@/lib/db"

async function tutorTracks(userId: string, role: string) {
  if (role === "admin") return Object.keys(bootcampTracks)
  const rows = await db.tutorTrack.findMany({
    where: { tutorId: userId },
    select: { track: true },
  })
  return rows.map((row) => row.track)
}

function mapSession(session: {
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
}) {
  const scheduledAt = session.scheduledAt ?? session.createdAt
  return {
    id: session.id,
    track: session.track,
    title: session.title,
    platform: session.platform,
    joinUrl: session.joinUrl,
    audience: session.audience,
    isActive: session.isActive,
    trackLabel: bootcampTracks[session.track] || session.track,
    scheduledAt: scheduledAt.toISOString(),
    createdAt: session.createdAt.toISOString(),
    endedAt: session.endedAt?.toISOString() ?? null,
  }
}

export async function GET() {
  const auth = await requireTutorOrAdmin()
  if (isNextResponse(auth)) return auth

  const tracks = await tutorTracks(auth.userId, auth.role)
  const sessions = await db.liveSession.findMany({
    where:
      auth.role === "admin"
        ? undefined
        : { tutorId: auth.userId, track: { in: tracks } },
    orderBy: [{ isActive: "desc" }, { scheduledAt: "asc" }, { createdAt: "desc" }],
    take: 50,
  })

  return NextResponse.json({
    tracks: tracks.map((id) => ({ id, label: bootcampTracks[id] || id })),
    sessions: sessions.map(mapSession),
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
  const platform = body.platform === "zoom" ? "zoom" : "meet"
  const joinUrl = String(body.joinUrl ?? "").trim()
  const audience =
    body.audience === "free" || body.audience === "paid"
      ? body.audience
      : "both"

  const allowed = await tutorTracks(auth.userId, auth.role)
  if (!track || !allowed.includes(track)) {
    return NextResponse.json(
      { error: "Pick a track you are assigned to." },
      { status: 403 },
    )
  }
  if (!/^https?:\/\//i.test(joinUrl)) {
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
      where: { tutorId: auth.userId, track, isActive: true },
      data: { isActive: false, endedAt: new Date() },
    })
  }

  const session = await db.liveSession.create({
    data: {
      track,
      tutorId: auth.userId,
      title,
      platform,
      joinUrl,
      audience,
      scheduledAt,
      isActive: goLiveNow,
      endedAt: null,
    },
  })

  return NextResponse.json({
    ok: true,
    session: mapSession(session),
  })
}
