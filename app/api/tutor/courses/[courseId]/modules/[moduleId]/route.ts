import { NextResponse } from "next/server";
import { isNextResponse, requireTutorOrAdmin } from "@/lib/api-auth";
import { db } from "@/lib/db";

type RouteContext = {
  params: Promise<{ courseId: string; moduleId: string }>;
};

async function canManageModule(
  userId: string,
  role: string,
  courseId: string,
  moduleId: string,
) {
  const moduleRow = await db.module.findFirst({
    where: { id: moduleId, courseId },
    include: { course: true },
  });
  if (!moduleRow) return null;
  if (role === "admin" || moduleRow.course.tutorId === userId) return moduleRow;
  return null;
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireTutorOrAdmin();
  if (isNextResponse(auth)) return auth;

  const { courseId, moduleId } = await context.params;
  const existing = await canManageModule(
    auth.userId,
    auth.role,
    courseId,
    moduleId,
  );
  if (!existing) {
    return NextResponse.json({ error: "Module not found." }, { status: 404 });
  }

  const body = (await request.json()) as {
    title?: string;
    description?: string;
    access?: string;
    order?: number;
    passMark?: number;
    videoUrl?: string | null;
    videoPublicId?: string | null;
    materials?: unknown;
    questions?: Array<{
      prompt: string;
      options: string[];
      correctIndex: number;
    }>;
  };

  const data: Record<string, unknown> = {};
  if (body.title != null) data.title = String(body.title).trim() || existing.title;
  if (body.description != null) data.description = String(body.description);
  if (body.access != null) data.access = body.access === "paid" ? "paid" : "free";
  if (body.order != null) data.order = Number(body.order);
  if (body.passMark != null) {
    data.passMark = Math.min(100, Math.max(1, Number(body.passMark)));
  }
  if (body.videoUrl !== undefined) data.videoUrl = body.videoUrl;
  if (body.videoPublicId !== undefined) data.videoPublicId = body.videoPublicId;
  if (body.materials !== undefined) data.materials = body.materials;

  if (Array.isArray(body.questions)) {
    await db.quizQuestion.deleteMany({ where: { moduleId } });
    await db.quizQuestion.createMany({
      data: body.questions.map((question, index) => ({
        moduleId,
        prompt: question.prompt.trim(),
        options: question.options.map(String),
        correctIndex: question.correctIndex,
        order: index,
      })),
    });
  }

  const updated = await db.module.update({
    where: { id: moduleId },
    data,
    include: { questions: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json({ ok: true, module: updated });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireTutorOrAdmin();
  if (isNextResponse(auth)) return auth;

  const { courseId, moduleId } = await context.params;
  const existing = await canManageModule(
    auth.userId,
    auth.role,
    courseId,
    moduleId,
  );
  if (!existing) {
    return NextResponse.json({ error: "Module not found." }, { status: 404 });
  }

  await db.quizQuestion.deleteMany({ where: { moduleId } });
  await db.moduleProgress.deleteMany({ where: { moduleId } });
  await db.assignmentSubmission.deleteMany({ where: { moduleId } });
  await db.moduleUnlock.deleteMany({ where: { moduleId } });
  await db.module.delete({ where: { id: moduleId } });

  return NextResponse.json({ ok: true });
}
