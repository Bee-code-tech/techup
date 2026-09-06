import { NextResponse } from "next/server";
import { isNextResponse, requireTutorOrAdmin } from "@/lib/api-auth";
import { db } from "@/lib/db";

type RouteContext = { params: Promise<{ courseId: string }> };

async function canManageCourse(userId: string, role: string, courseId: string) {
  const course = await db.course.findUnique({ where: { id: courseId } });
  if (!course) return null;
  if (role === "admin") return course;
  if (course.tutorId !== userId) return null;
  return course;
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireTutorOrAdmin();
  if (isNextResponse(auth)) return auth;

  const { courseId } = await context.params;
  const course = await canManageCourse(auth.userId, auth.role, courseId);
  if (!course) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 });
  }

  const body = (await request.json()) as {
    title?: string;
    description?: string;
    order?: number;
    published?: boolean;
  };

  const updated = await db.course.update({
    where: { id: courseId },
    data: {
      title:
        body.title != null
          ? String(body.title).trim() || course.title
          : undefined,
      description:
        body.description != null ? String(body.description) : undefined,
      order: body.order != null ? Number(body.order) : undefined,
      published: body.published != null ? Boolean(body.published) : undefined,
    },
  });

  return NextResponse.json({ ok: true, course: updated });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireTutorOrAdmin();
  if (isNextResponse(auth)) return auth;

  const { courseId } = await context.params;
  const course = await canManageCourse(auth.userId, auth.role, courseId);
  if (!course) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 });
  }

  const modules = await db.module.findMany({
    where: { courseId },
    select: { id: true },
  });
  const moduleIds = modules.map((row) => row.id);

  if (moduleIds.length) {
    await db.quizQuestion.deleteMany({
      where: { moduleId: { in: moduleIds } },
    });
    await db.moduleProgress.deleteMany({
      where: { moduleId: { in: moduleIds } },
    });
    await db.assignmentSubmission.deleteMany({
      where: { moduleId: { in: moduleIds } },
    });
    await db.moduleUnlock.deleteMany({
      where: { moduleId: { in: moduleIds } },
    });
    await db.module.deleteMany({ where: { courseId } });
  }

  await db.course.delete({ where: { id: courseId } });
  return NextResponse.json({ ok: true });
}
