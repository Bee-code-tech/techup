import { NextResponse } from "next/server"
import { isNextResponse, requireStudent } from "@/lib/api-auth"
import { bootcampTracks } from "@/lib/bootcamp"
import { db } from "@/lib/db"
import { notifyUser } from "@/lib/notifications"
import { recordLearningActivity } from "@/lib/streak"

export async function GET() {
  const auth = await requireStudent()
  if (isNextResponse(auth)) return auth

  const user = await db.user.findUnique({
    where: { id: auth.userId },
    select: { track: true },
  })
  if (!user?.track) {
    return NextResponse.json({ assignments: [] })
  }

  const assignments = await db.assignment.findMany({
    where: { track: user.track, published: true },
    orderBy: { createdAt: "desc" },
    include: {
      course: { select: { id: true, title: true } },
      submissions: {
        where: { userId: auth.userId },
        take: 1,
      },
    },
  })

  return NextResponse.json({
    assignments: assignments.map((row) => {
      const submission = row.submissions[0] || null
      return {
        id: row.id,
        title: row.title,
        description: row.description,
        scope: row.scope,
        track: row.track,
        trackLabel: bootcampTracks[row.track] || row.track,
        courseId: row.courseId,
        courseTitle: row.course?.title ?? null,
        opensAt: row.opensAt?.toISOString() ?? null,
        dueAt: row.dueAt?.toISOString() ?? null,
        maxScore: row.maxScore,
        createdAt: row.createdAt.toISOString(),
        submission: submission
          ? {
              id: submission.id,
              status: submission.status,
              explanation: submission.explanation,
              attachmentUrl: submission.attachmentUrl,
              score: submission.score,
              tutorNote: submission.tutorNote,
              reviewedAt: submission.reviewedAt?.toISOString() ?? null,
              createdAt: submission.createdAt.toISOString(),
            }
          : null,
      }
    }),
  })
}

type SubmitBody = {
  assignmentId?: string
  explanation?: string
  attachmentUrl?: string | null
  attachmentKey?: string | null
}

export async function POST(request: Request) {
  const auth = await requireStudent()
  if (isNextResponse(auth)) return auth

  const body = (await request.json()) as SubmitBody
  const assignmentId = String(body.assignmentId ?? "")
  const explanation = String(body.explanation ?? "").trim()
  const attachmentUrl = body.attachmentUrl
    ? String(body.attachmentUrl).trim()
    : null
  const attachmentKey = body.attachmentKey
    ? String(body.attachmentKey).trim()
    : null

  if (!assignmentId) {
    return NextResponse.json(
      { error: "Assignment is required." },
      { status: 400 },
    )
  }
  if (!explanation && !attachmentUrl) {
    return NextResponse.json(
      { error: "Add an explanation or attachment." },
      { status: 400 },
    )
  }

  const user = await db.user.findUnique({
    where: { id: auth.userId },
    select: { track: true, name: true },
  })
  const assignment = await db.assignment.findUnique({
    where: { id: assignmentId },
  })
  if (
    !assignment ||
    !assignment.published ||
    !user?.track ||
    assignment.track !== user.track
  ) {
    return NextResponse.json({ error: "Assignment not found." }, { status: 404 })
  }

  const existing = await db.assignmentSubmission.findUnique({
    where: {
      assignmentId_userId: {
        assignmentId,
        userId: auth.userId,
      },
    },
  })
  if (existing?.status === "graded") {
    return NextResponse.json(
      { error: "This submission is already graded." },
      { status: 400 },
    )
  }

  const submission = existing
    ? await db.assignmentSubmission.update({
        where: { id: existing.id },
        data: {
          explanation,
          attachmentUrl,
          attachmentKey,
          status: "pending",
          score: null,
          tutorNote: null,
          reviewedAt: null,
        },
      })
    : await db.assignmentSubmission.create({
        data: {
          assignmentId,
          userId: auth.userId,
          explanation,
          attachmentUrl,
          attachmentKey,
          status: "pending",
        },
      })

  await recordLearningActivity(auth.userId)
  await notifyUser({
    userId: assignment.tutorId,
    type: "assignment",
    title: "New submission",
    body: `${user?.name || "A student"} submitted “${assignment.title}”`,
    href: `/dashboard/assignments/review?id=${assignment.id}`,
  })

  return NextResponse.json({ ok: true, submission })
}
