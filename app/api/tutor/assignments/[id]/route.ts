import { NextResponse } from "next/server"
import { isNextResponse, requireTutorOrAdmin } from "@/lib/api-auth"
import { bootcampTracks } from "@/lib/bootcamp"
import { db } from "@/lib/db"
import { notifyUser } from "@/lib/notifications"

type RouteContext = { params: Promise<{ id: string }> }

async function loadOwnedAssignment(
  id: string,
  userId: string,
  role: string,
) {
  const assignment = await db.assignment.findUnique({
    where: { id },
    include: {
      course: { select: { id: true, title: true } },
      submissions: {
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      },
    },
  })
  if (!assignment) return null
  if (role !== "admin" && assignment.tutorId !== userId) return null
  return assignment
}

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireTutorOrAdmin()
  if (isNextResponse(auth)) return auth
  const { id } = await context.params
  const assignment = await loadOwnedAssignment(id, auth.userId, auth.role)
  if (!assignment) {
    return NextResponse.json({ error: "Not found." }, { status: 404 })
  }

  return NextResponse.json({
    assignment: {
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      scope: assignment.scope,
      track: assignment.track,
      trackLabel: bootcampTracks[assignment.track] || assignment.track,
      courseId: assignment.courseId,
      courseTitle: assignment.course?.title ?? null,
      moduleId: assignment.moduleId,
      opensAt: assignment.opensAt?.toISOString() ?? null,
      dueAt: assignment.dueAt?.toISOString() ?? null,
      maxScore: assignment.maxScore,
      published: assignment.published,
      submissions: assignment.submissions.map((row) => ({
        id: row.id,
        status: row.status,
        explanation: row.explanation,
        attachmentUrl: row.attachmentUrl,
        score: row.score,
        tutorNote: row.tutorNote,
        reviewedAt: row.reviewedAt?.toISOString() ?? null,
        createdAt: row.createdAt.toISOString(),
        student: row.user,
      })),
    },
  })
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireTutorOrAdmin()
  if (isNextResponse(auth)) return auth
  const { id } = await context.params
  const assignment = await loadOwnedAssignment(id, auth.userId, auth.role)
  if (!assignment) {
    return NextResponse.json({ error: "Not found." }, { status: 404 })
  }

  const body = (await request.json()) as {
    action?: string
    submissionId?: string
    score?: number
    tutorNote?: string
    published?: boolean
  }

  if (body.action === "grade") {
    const submissionId = String(body.submissionId ?? "")
    const submission = assignment.submissions.find(
      (row) => row.id === submissionId,
    )
    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found." },
        { status: 404 },
      )
    }
    const score = Math.min(
      assignment.maxScore,
      Math.max(0, Number(body.score) || 0),
    )
    const tutorNote = String(body.tutorNote ?? "").trim()
    const updated = await db.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        status: "graded",
        score,
        tutorNote: tutorNote || null,
        reviewedAt: new Date(),
      },
    })
    await notifyUser({
      userId: submission.userId,
      type: "grade",
      title: "Assignment graded",
      body: `${assignment.title} · ${score}/${assignment.maxScore}`,
      href: "/dashboard/assignments",
    })
    return NextResponse.json({ ok: true, submission: updated })
  }

  if (typeof body.published === "boolean") {
    const updated = await db.assignment.update({
      where: { id },
      data: { published: body.published },
    })
    return NextResponse.json({ ok: true, assignment: updated })
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 })
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireTutorOrAdmin()
  if (isNextResponse(auth)) return auth
  const { id } = await context.params
  const assignment = await loadOwnedAssignment(id, auth.userId, auth.role)
  if (!assignment) {
    return NextResponse.json({ error: "Not found." }, { status: 404 })
  }
  await db.assignmentSubmission.deleteMany({ where: { assignmentId: id } })
  await db.assignment.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
