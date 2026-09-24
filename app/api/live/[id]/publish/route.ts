import { NextResponse } from "next/server"

import { isNextResponse, requireTutorOrAdmin } from "@/lib/api-auth"
import { db } from "@/lib/db"

export const runtime = "nodejs"

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireTutorOrAdmin()
  if (isNextResponse(auth)) return auth

  const { id } = await context.params
  const body = (await request.json().catch(() => ({}))) as { courseId?: string }
  const courseId = String(body.courseId || "").trim()

  const session = await db.liveSession.findUnique({ where: { id } })
  if (!session) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 })
  }
  if (auth.role !== "admin" && session.tutorId !== auth.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  if (!session.recordingUrl) {
    return NextResponse.json(
      { error: "No recording is ready to publish yet." },
      { status: 409 },
    )
  }
  if (!courseId) {
    return NextResponse.json({ error: "Pick a course." }, { status: 400 })
  }

  const course = await db.course.findUnique({ where: { id: courseId } })
  if (!course) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 })
  }
  if (auth.role !== "admin" && course.tutorId !== auth.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  if (session.publishedModuleId) {
    return NextResponse.json({
      ok: true,
      moduleId: session.publishedModuleId,
    })
  }

  const last = await db.module.findFirst({
    where: { courseId },
    orderBy: { order: "desc" },
    select: { order: true },
  })

  const moduleRow = await db.module.create({
    data: {
      courseId,
      title: session.title,
      description: "Live class recording",
      videoUrl: session.recordingUrl,
      videoPublicId: session.recordingKey,
      access: session.audience === "paid" ? "paid" : "free",
      order: (last?.order ?? 0) + 1,
      liveSessionId: session.id,
      isLiveRecording: true,
    },
  })

  await db.liveSession.update({
    where: { id },
    data: { publishedModuleId: moduleRow.id },
  })

  return NextResponse.json({ ok: true, moduleId: moduleRow.id })
}
