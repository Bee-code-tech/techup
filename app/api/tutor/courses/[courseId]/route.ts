import { NextResponse } from "next/server"
import { isNextResponse, requireTutorOrAdmin } from "@/lib/api-auth"
import { bootcampTracks } from "@/lib/bootcamp"
import { db } from "@/lib/db"
import { notifyTrackStudents } from "@/lib/notifications"
import {
  collectObjectKeys,
  moduleStorageKeys,
  removeStorageKeys,
} from "@/lib/storage-cleanup"

type RouteContext = { params: Promise<{ courseId: string }> }

async function canManageCourse(userId: string, role: string, courseId: string) {
  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          questions: { orderBy: { order: "asc" } },
        },
      },
      tutor: { select: { id: true, name: true, email: true } },
    },
  })
  if (!course) return null
  if (role === "admin") return course
  if (course.tutorId !== userId) return null
  return course
}

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireTutorOrAdmin()
  if (isNextResponse(auth)) return auth

  const { courseId } = await context.params
  const course = await canManageCourse(auth.userId, auth.role, courseId)
  if (!course) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 })
  }

  return NextResponse.json({
    course: {
      id: course.id,
      track: course.track,
      trackLabel: bootcampTracks[course.track] || course.track,
      title: course.title,
      description: course.description,
      coverUrl: course.coverUrl,
      coverKey: course.coverKey,
      order: course.order,
      published: course.published,
      tutor: course.tutor,
      modules: course.modules,
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
    },
  })
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireTutorOrAdmin()
  if (isNextResponse(auth)) return auth

  const { courseId } = await context.params
  const course = await canManageCourse(auth.userId, auth.role, courseId)
  if (!course) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 })
  }

  const body = (await request.json()) as {
    title?: string
    description?: string
    track?: string
    coverUrl?: string | null
    coverKey?: string | null
    order?: number
    published?: boolean
    moduleOrder?: string[]
  }

  if (body.track != null) {
    const track = String(body.track).trim()
    if (!(track in bootcampTracks)) {
      return NextResponse.json({ error: "Invalid track." }, { status: 400 })
    }
    if (auth.role !== "admin") {
      const allowed = await db.tutorTrack.findFirst({
        where: { tutorId: auth.userId, track },
      })
      if (!allowed) {
        return NextResponse.json(
          { error: "You are not assigned to this track." },
          { status: 403 },
        )
      }
    }
  }

  if (body.published === true) {
    const hasModules = course.modules.length > 0
    const titleOk = (body.title ?? course.title).trim().length >= 2
    if (!titleOk || !hasModules) {
      return NextResponse.json(
        {
          error:
            "Add a title and at least one module before publishing.",
        },
        { status: 400 },
      )
    }
  }

  if (Array.isArray(body.moduleOrder) && body.moduleOrder.length > 0) {
    const ids = body.moduleOrder.map(String)
    const owned = new Set(course.modules.map((row) => row.id))
    if (ids.some((id) => !owned.has(id))) {
      return NextResponse.json(
        { error: "Invalid module order." },
        { status: 400 },
      )
    }
    await Promise.all(
      ids.map((id, index) =>
        db.module.update({ where: { id }, data: { order: index } }),
      ),
    )
  }

  if (body.coverKey !== undefined || body.coverUrl !== undefined) {
    const nextKey =
      body.coverKey !== undefined
        ? body.coverKey
          ? String(body.coverKey)
          : null
        : course.coverKey
    const previousKeys = collectObjectKeys([course.coverKey, course.coverUrl])
    const nextKeys = new Set(collectObjectKeys([nextKey, body.coverUrl]))
    const removed = previousKeys.filter((key) => !nextKeys.has(key))
    if (removed.length) {
      await removeStorageKeys(removed)
    }
  }

  const updated = await db.course.update({
    where: { id: courseId },
    data: {
      title:
        body.title != null
          ? String(body.title).trim() || course.title
          : undefined,
      description:
        body.description != null ? String(body.description) : undefined,
      track: body.track != null ? String(body.track).trim() : undefined,
      coverUrl:
        body.coverUrl !== undefined
          ? body.coverUrl
            ? String(body.coverUrl)
            : null
          : undefined,
      coverKey:
        body.coverKey !== undefined
          ? body.coverKey
            ? String(body.coverKey)
            : null
          : undefined,
      order: body.order != null ? Number(body.order) : undefined,
      published: body.published != null ? Boolean(body.published) : undefined,
    },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: { questions: { orderBy: { order: "asc" } } },
      },
      tutor: { select: { id: true, name: true, email: true } },
    },
  })

  if (!course.published && updated.published) {
    await notifyTrackStudents(updated.track, {
      type: "course",
      title: "New course available",
      body: updated.title,
      href: "/dashboard/learn",
    })
  }

  return NextResponse.json({
    ok: true,
    course: {
      ...updated,
      trackLabel: bootcampTracks[updated.track] || updated.track,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    },
  })
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireTutorOrAdmin()
  if (isNextResponse(auth)) return auth

  const { courseId } = await context.params
  const course = await canManageCourse(auth.userId, auth.role, courseId)
  if (!course) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 })
  }

  const storageKeys = collectObjectKeys([
    course.coverKey,
    course.coverUrl,
    ...course.modules.flatMap((moduleRow) =>
      moduleStorageKeys({
        videoPublicId: moduleRow.videoPublicId,
        videoUrl: moduleRow.videoUrl,
        materials: moduleRow.materials,
        questions: moduleRow.questions,
      }),
    ),
  ])

  const moduleIds = course.modules.map((row) => row.id)

  if (moduleIds.length) {
    await db.quizQuestion.deleteMany({
      where: { moduleId: { in: moduleIds } },
    })
    await db.moduleProgress.deleteMany({
      where: { moduleId: { in: moduleIds } },
    })
    await db.moduleUnlock.deleteMany({
      where: { moduleId: { in: moduleIds } },
    })
    await db.module.deleteMany({ where: { courseId } })
  }

  const courseAssignments = await db.assignment.findMany({
    where: { courseId },
    select: { id: true },
  })
  const assignmentIds = courseAssignments.map((row) => row.id)
  if (assignmentIds.length) {
    await db.assignmentSubmission.deleteMany({
      where: { assignmentId: { in: assignmentIds } },
    })
    await db.assignment.deleteMany({ where: { id: { in: assignmentIds } } })
  }

  await db.course.delete({ where: { id: courseId } })
  await removeStorageKeys(storageKeys)
  return NextResponse.json({ ok: true })
}
