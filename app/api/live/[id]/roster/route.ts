import { NextResponse } from "next/server"

import { isNextResponse, requireAnyAuth } from "@/lib/api-auth"
import { db } from "@/lib/db"
import { expectedStudentsForSession } from "@/lib/live-attendance"

export const runtime = "nodejs"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireAnyAuth()
  if (isNextResponse(auth)) return auth

  const { id } = await context.params
  const session = await db.liveSession.findUnique({ where: { id } })
  if (!session) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 })
  }

  const isHost =
    auth.role === "admin" ||
    (auth.role === "tutor" && session.tutorId === auth.userId)

  const attendance = await db.liveAttendance.findMany({
    where: { sessionId: id },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
    orderBy: { joinedAt: "asc" },
  })

  const joinedIds = new Set(attendance.map((row) => row.userId))
  const expected = isHost
    ? await expectedStudentsForSession({
        track: session.track,
        audience: session.audience,
      })
    : []

  return NextResponse.json({
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
      })),
    expectedCount: expected.length,
    joinedCount: attendance.filter((row) => row.role === "student").length,
  })
}
