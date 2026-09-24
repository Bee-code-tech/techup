import { NextResponse } from "next/server"

import { isNextResponse, requireTutorOrAdmin } from "@/lib/api-auth"
import { db } from "@/lib/db"
import { expectedStudentsForSession } from "@/lib/live-attendance"
import { isAllTracksLive, liveTrackLabel } from "@/lib/live-session"

export const runtime = "nodejs"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireTutorOrAdmin()
  if (isNextResponse(auth)) return auth

  const { id } = await context.params
  const session = await db.liveSession.findUnique({ where: { id } })
  if (!session) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 })
  }
  if (auth.role !== "admin" && session.tutorId !== auth.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const [attendance, expected, courses] = await Promise.all([
    db.liveAttendance.findMany({
      where: { sessionId: id },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
      orderBy: { joinedAt: "asc" },
    }),
    expectedStudentsForSession({
      track: session.track,
      audience: session.audience,
    }),
    db.course.findMany({
      where:
        auth.role === "admin"
          ? isAllTracksLive(session.track)
            ? {}
            : { track: session.track }
          : isAllTracksLive(session.track)
            ? { tutorId: auth.userId }
            : { track: session.track, tutorId: auth.userId },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
  ])

  const joinedIds = new Set(attendance.map((row) => row.userId))

  return NextResponse.json({
    session: {
      id: session.id,
      title: session.title,
      trackLabel: liveTrackLabel(session.track),
      endedAt: session.endedAt?.toISOString() ?? null,
      recordingStatus: session.recordingStatus,
      recordingUrl: session.recordingUrl,
      publishedModuleId: session.publishedModuleId,
    },
    attendance: {
      joined: attendance.map((row) => ({
        id: row.user.id,
        name: row.user.name,
        email: row.user.email,
        avatarUrl: row.user.avatarUrl,
        role: row.role,
        joinedAt: row.joinedAt.toISOString(),
        leftAt: row.leftAt?.toISOString() ?? null,
      })),
      absent: expected
        .filter((student) => !joinedIds.has(student.id))
        .map((student) => ({
          id: student.id,
          name: student.name,
          email: student.email,
          avatarUrl: student.avatarUrl,
        })),
    },
    courses,
  })
}
