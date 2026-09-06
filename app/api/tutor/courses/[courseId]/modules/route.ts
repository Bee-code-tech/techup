import { NextResponse } from "next/server";
import { isNextResponse, requireTutorOrAdmin } from "@/lib/api-auth";
import { db } from "@/lib/db";

type RouteContext = { params: Promise<{ courseId: string }> };

async function canManageCourse(userId: string, role: string, courseId: string) {
  const course = await db.course.findUnique({ where: { id: courseId } });
  if (!course) return null;
  if (role === "admin" || course.tutorId === userId) return course;
  return null;
}

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireTutorOrAdmin();
  if (isNextResponse(auth)) return auth;

  const { courseId } = await context.params;
  const course = await canManageCourse(auth.userId, auth.role, courseId);
  if (!course) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 });
  }

  const modules = await db.module.findMany({
    where: { courseId },
    orderBy: { order: "asc" },
    include: {
      questions: { orderBy: { order: "asc" } },
    },
  });

  return NextResponse.json({
    course: {
      id: course.id,
      title: course.title,
      track: course.track,
      description: course.description,
    },
    modules,
  });
}

type CreateBody = {
  title?: string;
  description?: string;
  access?: string;
  order?: number;
  passMark?: number;
  videoUrl?: string;
  videoPublicId?: string;
  materials?: unknown;
  questions?: Array<{
    prompt: string;
    options: string[];
    correctIndex: number;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireTutorOrAdmin();
  if (isNextResponse(auth)) return auth;

  const { courseId } = await context.params;
  const course = await canManageCourse(auth.userId, auth.role, courseId);
  if (!course) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 });
  }

  const body = (await request.json()) as CreateBody;
  const title = String(body.title ?? "").trim();
  const description = String(body.description ?? "").trim();
  const access = body.access === "paid" ? "paid" : "free";
  const order = Number(body.order ?? 0);
  const passMark = Math.min(100, Math.max(1, Number(body.passMark ?? 70)));

  if (title.length < 2) {
    return NextResponse.json(
      { error: "Enter a module title." },
      { status: 400 },
    );
  }

  const questions = Array.isArray(body.questions) ? body.questions : [];
  for (const question of questions) {
    if (!question.prompt?.trim() || !Array.isArray(question.options) || question.options.length < 2) {
      return NextResponse.json(
        { error: "Each quiz question needs a prompt and at least 2 options." },
        { status: 400 },
      );
    }
    if (
      question.correctIndex < 0 ||
      question.correctIndex >= question.options.length
    ) {
      return NextResponse.json(
        { error: "Quiz correct answer index is invalid." },
        { status: 400 },
      );
    }
  }

  const moduleRow = await db.module.create({
    data: {
      courseId,
      title,
      description,
      access,
      order: Number.isFinite(order) ? order : 0,
      passMark,
      videoUrl: body.videoUrl ? String(body.videoUrl) : null,
      videoPublicId: body.videoPublicId ? String(body.videoPublicId) : null,
      materials: body.materials ?? undefined,
      questions: {
        create: questions.map((question, index) => ({
          prompt: question.prompt.trim(),
          options: question.options.map(String),
          correctIndex: question.correctIndex,
          order: index,
        })),
      },
    },
    include: { questions: true },
  });

  return NextResponse.json({ ok: true, module: moduleRow });
}
