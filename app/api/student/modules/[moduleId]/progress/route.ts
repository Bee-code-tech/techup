import { NextResponse } from "next/server"
import { isNextResponse, requireStudent } from "@/lib/api-auth"
import { ensureCourseCertificate } from "@/lib/certificates"
import { db } from "@/lib/db"
import { recordLearningActivity } from "@/lib/streak"

type RouteContext = { params: Promise<{ moduleId: string }> }

function isDbConnectivityError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  return /server selection timeout|no available servers|can't reach|econnrefused|enotfound|topology/i.test(
    message,
  )
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const auth = await requireStudent()
    if (isNextResponse(auth)) return auth

    const { moduleId } = await context.params
    const body = (await request.json().catch(() => ({}))) as {
      action?: string
      answers?: number[]
    }

    const moduleRow = await db.module.findUnique({
      where: { id: moduleId },
      include: {
        course: true,
        questions: { orderBy: { order: "asc" } },
      },
    })
    if (!moduleRow) {
      return NextResponse.json({ error: "Module not found." }, { status: 404 })
    }

    const user = await db.user.findUnique({
      where: { id: auth.userId },
      select: { track: true },
    })
    if (!user?.track || user.track !== moduleRow.course.track) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (body.action === "complete-video") {
      const progress = await db.moduleProgress.upsert({
        where: {
          userId_moduleId: { userId: auth.userId, moduleId },
        },
        create: {
          userId: auth.userId,
          moduleId,
          videoCompleted: true,
        },
        update: { videoCompleted: true },
      })
      const streak = await recordLearningActivity(auth.userId)
      return NextResponse.json({ ok: true, progress, streak })
    }

    if (body.action === "submit-quiz") {
      const answers = Array.isArray(body.answers)
        ? body.answers.map((value) => {
            const n = Number(value)
            return Number.isFinite(n) ? n : -1
          })
        : []
      if (answers.length !== moduleRow.questions.length) {
        return NextResponse.json(
          { error: "Answer every quiz question." },
          { status: 400 },
        )
      }

      let correct = 0
      const review = moduleRow.questions.map((question, index) => {
        const selected = answers[index]
        const isCorrect = selected === question.correctIndex
        if (isCorrect) correct += 1
        return {
          questionId: question.id,
          prompt: question.prompt,
          promptImageUrl: question.promptImageUrl,
          options: question.options,
          optionImageUrls: question.optionImageUrls || [],
          selectedIndex: selected,
          correctIndex: question.correctIndex,
          isCorrect,
        }
      })

      const score =
        moduleRow.questions.length === 0
          ? 0
          : Math.round((correct / moduleRow.questions.length) * 100)
      const passed = score >= moduleRow.passMark

      const existing = await db.moduleProgress.findUnique({
        where: {
          userId_moduleId: { userId: auth.userId, moduleId },
        },
      })

      const progress = await db.moduleProgress.upsert({
        where: {
          userId_moduleId: { userId: auth.userId, moduleId },
        },
        create: {
          userId: auth.userId,
          moduleId,
          videoCompleted: true,
          quizPassed: passed,
          quizScore: score,
          quizAttempts: 1,
          completedAt: passed ? new Date() : null,
        },
        update: {
          quizPassed: passed || existing?.quizPassed || false,
          quizScore: score,
          quizAttempts: (existing?.quizAttempts || 0) + 1,
          completedAt:
            passed || existing?.quizPassed
              ? new Date()
              : existing?.completedAt,
          videoCompleted: true,
        },
      })

      let streak = null
      try {
        streak = await recordLearningActivity(auth.userId)
      } catch (error) {
        console.error("[quiz] streak update failed", error)
      }

      // Certificate must never block quiz grading / unlock.
      let certificate = null
      if (passed || existing?.quizPassed) {
        try {
          certificate = await ensureCourseCertificate(
            auth.userId,
            moduleRow.courseId,
          )
        } catch (error) {
          console.error("[quiz] certificate ensure failed", error)
        }
      }

      return NextResponse.json({
        ok: true,
        score,
        passed,
        passMark: moduleRow.passMark,
        review,
        progress,
        streak,
        courseComplete: Boolean(certificate),
        certificate: certificate
          ? {
              courseId: certificate.courseId,
              courseTitle: certificate.courseTitle,
              code: certificate.code,
            }
          : null,
      })
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 })
  } catch (error) {
    console.error("[quiz progress]", error)
    if (isDbConnectivityError(error)) {
      return NextResponse.json(
        {
          error:
            "Database is unreachable right now. Check your connection and try again.",
        },
        { status: 503 },
      )
    }
    return NextResponse.json(
      { error: "Could not save quiz progress. Please try again." },
      { status: 500 },
    )
  }
}
