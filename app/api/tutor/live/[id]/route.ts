import { NextResponse } from "next/server"
import { isNextResponse, requireTutorOrAdmin } from "@/lib/api-auth"
import { db } from "@/lib/db"
import { markLiveJoin } from "@/lib/live-attendance"
import { isInAppLive, liveJoinHref } from "@/lib/live-session"
import {
  closeLiveRoom,
  ensureLiveRoom,
  startLiveRecording,
  stopLiveRecording,
} from "@/lib/livekit"

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireTutorOrAdmin()
  if (isNextResponse(auth)) return auth

  const { id } = await context.params
  const body = (await request.json().catch(() => ({}))) as {
    action?: string
  }
  const action = body.action

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
    if (isInAppLive(updated.platform)) {
      await ensureLiveRoom(updated.id)
      await markLiveJoin({
        sessionId: updated.id,
        userId: auth.userId,
        role: auth.role,
      })
    }
    return NextResponse.json({
      ok: true,
      session: {
        ...updated,
        joinUrl: liveJoinHref(updated),
        inApp: isInAppLive(updated.platform),
      },
    })
  }

  if (action === "record") {
    if (!session.isActive) {
      return NextResponse.json(
        { error: "Start the class before recording." },
        { status: 409 },
      )
    }
    if (session.recordingStatus === "recording") {
      return NextResponse.json({
        ok: true,
        recordingStatus: "recording",
      })
    }
    if (!isInAppLive(session.platform)) {
      return NextResponse.json(
        { error: "Recording is only available in the TechUp classroom." },
        { status: 400 },
      )
    }
    const recording = await startLiveRecording(session.id)
    await db.liveSession.update({
      where: { id: session.id },
      data: recording.ok
        ? {
            recordingStatus: "recording",
            egressId: recording.egressId,
            recordingKey: recording.key,
            recordingUrl: recording.url,
          }
        : { recordingStatus: "failed" },
    })
    if (!recording.ok) {
      return NextResponse.json(
        { error: recording.error || "Could not start recording." },
        { status: 502 },
      )
    }
    return NextResponse.json({
      ok: true,
      recordingStatus: "recording",
    })
  }

  if (action !== "end") {
    return NextResponse.json({ error: "Unknown action." }, { status: 400 })
  }

  if (isInAppLive(session.platform)) {
    const stopped = await stopLiveRecording(session.egressId)
    await db.liveSession.update({
      where: { id },
      data: {
        recordingStatus:
          session.recordingStatus === "recording" && (stopped.ok || session.recordingUrl)
            ? "ready"
            : session.recordingStatus === "recording"
              ? "failed"
              : session.recordingStatus,
      },
    })
  }

  const updated = await db.liveSession.update({
    where: { id },
    data: { isActive: false, endedAt: new Date() },
  })
  if (isInAppLive(updated.platform)) {
    await closeLiveRoom(updated.id)
  }
  return NextResponse.json({
    ok: true,
    session: {
      ...updated,
      joinUrl: liveJoinHref(updated),
      inApp: isInAppLive(updated.platform),
    },
  })
}

export async function DELETE(_request: Request, context: RouteContext) {
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

  if (isInAppLive(session.platform)) {
    if (session.recordingStatus === "recording") {
      await stopLiveRecording(session.egressId)
    }
    if (session.isActive) {
      await closeLiveRoom(session.id)
    }
  }

  await db.liveAttendance.deleteMany({ where: { sessionId: id } })
  await db.module.updateMany({
    where: { liveSessionId: id },
    data: { liveSessionId: null },
  })
  await db.liveSession.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
