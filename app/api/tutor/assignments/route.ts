import { NextResponse } from "next/server"
import { isNextResponse, requireTutorOrAdmin } from "@/lib/api-auth"
import { bootcampTracks } from "@/lib/bootcamp"
import { db } from "@/lib/db"
import { notifyTrackStudents } from "@/lib/notifications"

async function tutorTracks(userId: string, role: string) {
  if (role === "admin") return Object.keys(bootcampTracks)
  const rows = await db.tutorTrack.findMany({
    where: { tutorId: userId },
    select: { track: true },
  })
  return rows.map((row) => row.track)
}

export async function GET() {
  const auth = await requireTutorOrAdmin()
  if (isNextResponse(auth)) return auth

  const tracks = await tutorTracks(auth.userId, auth.role)
  const courses = await db.course.findMany({
    where:
      auth.role === "admin"
        ? { track: { in: tracks } }
        : { tutorId: auth.userId },
    select: { id: true, title: true, track: true },
    orderBy: { title: "asc" },
  })

  const assignments = await db.assignment.findMany({
    where:
      auth.role === "admin"
        ? { track: { in: tracks } }
        : { tutorId: auth.userId },
    orderBy: { createdAt: "desc" },
    include: {
      course: { select: { id: true, title: true } },
      _count: { select: { submissions: true } },
      submissions: {
        where: { status: "pending" },
        select: { id: true },
      },
    },
  })

  return NextResponse.json({
    tracks: tracks.map((id) => ({ id, label: bootcampTracks[id] || id })),
    courses: courses.map((course) => ({
      id: course.id,
      title: course.title,
      track: course.track,
      trackLabel: bootcampTracks[course.track] || course.track,
    })),
    assignments: assignments.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      scope: row.scope,
      track: row.track,
      trackLabel: bootcampTracks[row.track] || row.track,
      courseId: row.courseId,
      courseTitle: row.course?.title ?? null,
      moduleId: row.moduleId,
      opensAt: row.opensAt?.toISOString() ?? null,
      dueAt: row.dueAt?.toISOString() ?? null,
      maxScore: row.maxScore,
      published: row.published,
      createdAt: row.createdAt.toISOString(),
      submissionCount: row._count.submissions,
      pendingCount: row.submissions.length,
    })),
  })
}

type CreateBody = {
  scope?: string
  title?: string
  description?: string
  track?: string
  courseId?: string | null
  moduleId?: string | null
  opensAt?: string | null
  dueAt?: string | null
  maxScore?: number
  published?: boolean
}

export async function POST(request: Request) {
  const auth = await requireTutorOrAdmin()
  if (isNextResponse(auth)) return auth

  const body = (await request.json()) as CreateBody
  const scope =
    body.scope === "track" || body.scope === "module" ? body.scope : "course"
  const title = String(body.title ?? "").trim()
  const description = String(body.description ?? "").trim()
  const maxScore = Math.min(
    100,
    Math.max(1, Number(body.maxScore) || 100),
  )
  const published = body.published !== false
  const opensAt = body.opensAt ? new Date(body.opensAt) : null
  const dueAt = body.dueAt ? new Date(body.dueAt) : null
  if (opensAt && Number.isNaN(opensAt.getTime())) {
    return NextResponse.json({ error: "Invalid start date." }, { status: 400 })
  }
  if (dueAt && Number.isNaN(dueAt.getTime())) {
    return NextResponse.json({ error: "Invalid due date." }, { status: 400 })
  }
  if (opensAt && dueAt && opensAt.getTime() > dueAt.getTime()) {
    return NextResponse.json(
      { error: "Start date must be before the due date." },
      { status: 400 },
    )
  }
  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 })
  }

  const allowed = await tutorTracks(auth.userId, auth.role)
  let track = String(body.track ?? "").trim()
  let courseId: string | null = body.courseId ? String(body.courseId) : null
  let moduleId: string | null = body.moduleId ? String(body.moduleId) : null

  if (scope === "course" || scope === "module") {
    if (!courseId) {
      return NextResponse.json(
        { error: "Pick a course for this assignment." },
        { status: 400 },
      )
    }
    const course = await db.course.findUnique({ where: { id: courseId } })
    if (!course) {
      return NextResponse.json({ error: "Course not found." }, { status: 404 })
    }
    if (auth.role !== "admin" && course.tutorId !== auth.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    if (!allowed.includes(course.track)) {
      return NextResponse.json({ error: "Track not assigned." }, { status: 403 })
    }
    track = course.track
    if (scope === "module") {
      if (!moduleId) {
        return NextResponse.json(
          { error: "Pick a module for this assignment." },
          { status: 400 },
        )
      }
      const moduleRow = await db.module.findFirst({
        where: { id: moduleId, courseId },
      })
      if (!moduleRow) {
        return NextResponse.json({ error: "Module not found." }, { status: 404 })
      }
    } else {
      moduleId = null
    }
  } else {
    if (!track || !allowed.includes(track)) {
      return NextResponse.json(
        { error: "Pick a track you teach." },
        { status: 400 },
      )
    }
    courseId = null
    moduleId = null
  }

  const assignment = await db.assignment.create({
    data: {
      scope,
      title,
      description,
      track,
      courseId,
      moduleId,
      tutorId: auth.userId,
      opensAt,
      dueAt,
      maxScore,
      published,
    },
  })

  if (published) {
    await notifyTrackStudents(track, {
      type: "assignment",
      title: "New assignment",
      body: title,
      href: "/dashboard/assignments",
    })
  }

  return NextResponse.json({
    ok: true,
    assignment: {
      ...assignment,
      opensAt: assignment.opensAt?.toISOString() ?? null,
      dueAt: assignment.dueAt?.toISOString() ?? null,
      createdAt: assignment.createdAt.toISOString(),
    },
  })
}
