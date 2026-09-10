import { NextResponse } from "next/server"
import { isNextResponse, requireTutorOrAdmin } from "@/lib/api-auth"
import { db } from "@/lib/db"

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireTutorOrAdmin()
  if (isNextResponse(auth)) return auth

  const { id } = await context.params
  const body = (await request.json().catch(() => ({}))) as {
    action?: string
  }
  const action = body.action === "start" ? "start" : "end"

  const session = await db.liveSession.findUnique({ where: { id } })
  if (!session) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 })
  }
  if (auth.role !== "admin" && session.tutorId !== auth.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  if (action === "start") {
    await db.liveSession.updateMany({
      where: {
        tutorId: session.tutorId,
        track: session.track,
        isActive: true,
        NOT: { id: session.id },
      },
      data: { isActive: false, endedAt: new Date() },
    })

    const updated = await db.liveSession.update({
      where: { id },
      data: {
        isActive: true,
        endedAt: null,
        scheduledAt: new Date(),
      },
    })
    return NextResponse.json({ ok: true, session: updated })
  }

  const updated = await db.liveSession.update({
    where: { id },
    data: { isActive: false, endedAt: new Date() },
  })

  return NextResponse.json({ ok: true, session: updated })
}
