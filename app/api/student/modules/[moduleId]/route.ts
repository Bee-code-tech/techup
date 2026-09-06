import { NextResponse } from "next/server";
import { isNextResponse, requireStudent } from "@/lib/api-auth";
import { db } from "@/lib/db";

type RouteContext = { params: Promise<{ moduleId: string }> };

async function getAccessibleModule(userId: string, moduleId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { track: true, accessTier: true },
  });
  if (!user?.track) return { error: "No track enrolled.", status: 400 as const };

  const moduleRow = await db.module.findUnique({
    where: { id: moduleId },
    include: {
      course: true,
      questions: { orderBy: { order: "asc" } },
    },
  });
  if (!moduleRow || moduleRow.course.track !== user.track || !moduleRow.course.published) {
    return { error: "Module not found.", status: 404 as const };
  }

  const unlock = await db.moduleUnlock.findUnique({
    where: {
      userId_moduleId: { userId, moduleId },
    },
  });
  const paidLocked =
    moduleRow.access === "paid" &&
    user.accessTier !== "paid" &&
    !unlock;

  const siblings = await db.module.findMany({
    where: { courseId: moduleRow.courseId },
    orderBy: { order: "asc" },
    select: { id: true, order: true, title: true, access: true },
  });
  const index = siblings.findIndex((row) => row.id === moduleId);
  if (index > 0) {
    const priorIds = siblings.slice(0, index).map((row) => row.id);
    const priorProgress = await db.moduleProgress.findMany({
      where: { userId, moduleId: { in: priorIds }, quizPassed: true },
    });
    if (priorProgress.length < priorIds.length) {
      return {
        error: "Finish the previous module quiz before opening this one.",
        status: 403 as const,
      };
    }
  }

  if (paidLocked) {
    return { error: "This module requires payment.", status: 402 as const };
  }

  return { moduleRow, user, siblings };
}

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireStudent();
  if (isNextResponse(auth)) return auth;

  const { moduleId } = await context.params;
  const result = await getAccessibleModule(auth.userId, moduleId);
  if ("error" in result) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  const { moduleRow, siblings, user } = result;
  const progress = await db.moduleProgress.findUnique({
    where: {
      userId_moduleId: { userId: auth.userId, moduleId },
    },
  });

  const index = siblings.findIndex((row) => row.id === moduleId);
  const nextSibling = siblings[index + 1] ?? null;

  let nextModule: {
    id: string;
    title: string;
    access: string;
    requiresPayment: boolean;
  } | null = null;

  if (nextSibling) {
    const nextUnlock =
      nextSibling.access === "paid"
        ? await db.moduleUnlock.findUnique({
            where: {
              userId_moduleId: {
                userId: auth.userId,
                moduleId: nextSibling.id,
              },
            },
          })
        : null;

    const requiresPayment =
      nextSibling.access === "paid" &&
      user.accessTier !== "paid" &&
      !nextUnlock;

    nextModule = {
      id: nextSibling.id,
      title: nextSibling.title,
      access: nextSibling.access,
      requiresPayment,
    };
  }

  return NextResponse.json({
    module: {
      id: moduleRow.id,
      title: moduleRow.title,
      description: moduleRow.description,
      videoUrl: moduleRow.videoUrl,
      materials: moduleRow.materials,
      access: moduleRow.access,
      passMark: moduleRow.passMark,
      courseId: moduleRow.courseId,
      courseTitle: moduleRow.course.title,
      questions: moduleRow.questions.map((question) => ({
        id: question.id,
        prompt: question.prompt,
        options: question.options,
        order: question.order,
        // correctIndex omitted until after pass / submit response
      })),
    },
    progress,
    nextModuleId: nextModule && !nextModule.requiresPayment ? nextModule.id : null,
    nextModule,
    sidebar: siblings,
  });
}
