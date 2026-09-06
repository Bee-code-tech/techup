import { NextResponse } from "next/server";
import { isNextResponse, requireStudent } from "@/lib/api-auth";
import { db } from "@/lib/db";

type RouteContext = { params: Promise<{ moduleId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireStudent();
  if (isNextResponse(auth)) return auth;

  const { moduleId } = await context.params;
  const body = (await request.json()) as { action?: string; answers?: number[] };

  const moduleRow = await db.module.findUnique({
    where: { id: moduleId },
    include: {
      course: true,
      questions: { orderBy: { order: "asc" } },
    },
  });
  if (!moduleRow) {
    return NextResponse.json({ error: "Module not found." }, { status: 404 });
  }

  const user = await db.user.findUnique({
    where: { id: auth.userId },
    select: { track: true },
  });
  if (!user?.track || user.track !== moduleRow.course.track) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
    });
    return NextResponse.json({ ok: true, progress });
  }

  if (body.action === "submit-quiz") {
    const answers = Array.isArray(body.answers) ? body.answers.map(Number) : [];
    if (answers.length !== moduleRow.questions.length) {
      return NextResponse.json(
        { error: "Answer every quiz question." },
        { status: 400 },
      );
    }

    let correct = 0;
    const review = moduleRow.questions.map((question, index) => {
      const selected = answers[index];
      const isCorrect = selected === question.correctIndex;
      if (isCorrect) correct += 1;
      return {
        questionId: question.id,
        prompt: question.prompt,
        options: question.options,
        selectedIndex: selected,
        correctIndex: question.correctIndex,
        isCorrect,
      };
    });

    const score = Math.round((correct / moduleRow.questions.length) * 100);
    const passed = score >= moduleRow.passMark;

    const existing = await db.moduleProgress.findUnique({
      where: {
        userId_moduleId: { userId: auth.userId, moduleId },
      },
    });

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
          passed || existing?.quizPassed ? new Date() : existing?.completedAt,
        videoCompleted: true,
      },
    });

    return NextResponse.json({
      ok: true,
      score,
      passed,
      passMark: moduleRow.passMark,
      review,
      progress,
    });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
