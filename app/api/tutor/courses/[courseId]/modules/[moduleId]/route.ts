import { NextResponse } from "next/server"
import { isNextResponse, requireTutorOrAdmin } from "@/lib/api-auth"
import { db } from "@/lib/db"
import { validateQuizQuestion, isBlankQuizQuestion, type QuizQuestionInput } from "@/lib/quiz"
import {
  collectObjectKeys,
  keysRemovedFromMaterials,
  moduleStorageKeys,
  questionStorageKeys,
  removeStorageKeys,
} from "@/lib/storage-cleanup"

type RouteContext = {
  params: Promise<{ courseId: string; moduleId: string }>
}

async function canManageModule(
  userId: string,
  role: string,
  courseId: string,
  moduleId: string,
) {
  const moduleRow = await db.module.findFirst({
    where: { id: moduleId, courseId },
    include: {
      course: true,
      questions: { orderBy: { order: "asc" } },
    },
  })
  if (!moduleRow) return null
  if (role === "admin" || moduleRow.course.tutorId === userId) return moduleRow
  return null
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireTutorOrAdmin()
  if (isNextResponse(auth)) return auth

  const { courseId, moduleId } = await context.params
  const existing = await canManageModule(
    auth.userId,
    auth.role,
    courseId,
    moduleId,
  )
  if (!existing) {
    return NextResponse.json({ error: "Module not found." }, { status: 404 })
  }

  const body = (await request.json()) as {
    title?: string
    description?: string
    access?: string
    order?: number
    passMark?: number
    videoUrl?: string | null
    videoPublicId?: string | null
    materials?: unknown
    questions?: QuizQuestionInput[]
  }

  const keysToDelete: string[] = []

  const data: Record<string, unknown> = {}
  if (body.title != null) data.title = String(body.title).trim() || existing.title
  if (body.description != null) data.description = String(body.description)
  if (body.access != null) data.access = body.access === "paid" ? "paid" : "free"
  if (body.order != null) data.order = Number(body.order)
  if (body.passMark != null) {
    data.passMark = Math.min(100, Math.max(1, Number(body.passMark)))
  }

  if (body.videoUrl !== undefined || body.videoPublicId !== undefined) {
    const nextVideoKey =
      body.videoPublicId !== undefined
        ? body.videoPublicId
          ? String(body.videoPublicId)
          : null
        : existing.videoPublicId
    const previous = collectObjectKeys([
      existing.videoPublicId,
      existing.videoUrl,
    ])
    const next = new Set(
      collectObjectKeys([nextVideoKey, body.videoUrl ?? null]),
    )
    keysToDelete.push(...previous.filter((key) => !next.has(key)))
    if (body.videoUrl !== undefined) data.videoUrl = body.videoUrl
    if (body.videoPublicId !== undefined) data.videoPublicId = body.videoPublicId
  }

  if (body.materials !== undefined) {
    keysToDelete.push(
      ...keysRemovedFromMaterials(existing.materials, body.materials),
    )
    data.materials = body.materials
  }

  if (Array.isArray(body.questions)) {
    const normalized = []
    for (const question of body.questions) {
      if (isBlankQuizQuestion(question)) continue
      const validated = validateQuizQuestion(question)
      if (!validated.ok) {
        return NextResponse.json({ error: validated.error }, { status: 400 })
      }
      normalized.push(validated.question)
    }

    const previousQuestionKeys = questionStorageKeys(existing.questions)
    const nextQuestionKeys = new Set(questionStorageKeys(normalized))
    keysToDelete.push(
      ...previousQuestionKeys.filter((key) => !nextQuestionKeys.has(key)),
    )

    await db.quizQuestion.deleteMany({ where: { moduleId } })
    if (normalized.length > 0) {
      await db.quizQuestion.createMany({
        data: normalized.map((question, index) => ({
          moduleId,
          prompt: question.prompt,
          promptImageUrl: question.promptImageUrl,
          promptImageKey: question.promptImageKey,
          options: question.options,
          optionImageUrls: question.optionImageUrls,
          correctIndex: question.correctIndex,
          order: index,
        })),
      })
    }
  }

  const updated = await db.module.update({
    where: { id: moduleId },
    data,
    include: { questions: { orderBy: { order: "asc" } } },
  })

  if (keysToDelete.length) {
    await removeStorageKeys(keysToDelete)
  }

  return NextResponse.json({ ok: true, module: updated })
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireTutorOrAdmin()
  if (isNextResponse(auth)) return auth

  const { courseId, moduleId } = await context.params
  const existing = await canManageModule(
    auth.userId,
    auth.role,
    courseId,
    moduleId,
  )
  if (!existing) {
    return NextResponse.json({ error: "Module not found." }, { status: 404 })
  }

  const storageKeys = moduleStorageKeys({
    videoPublicId: existing.videoPublicId,
    videoUrl: existing.videoUrl,
    materials: existing.materials,
    questions: existing.questions,
  })

  await db.quizQuestion.deleteMany({ where: { moduleId } })
  await db.moduleProgress.deleteMany({ where: { moduleId } })
  await db.moduleUnlock.deleteMany({ where: { moduleId } })
  await db.module.delete({ where: { id: moduleId } })
  await removeStorageKeys(storageKeys)

  return NextResponse.json({ ok: true })
}
