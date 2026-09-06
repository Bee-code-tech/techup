import { NextResponse } from "next/server";
import { isNextResponse, requireTutorOrAdmin } from "@/lib/api-auth";
import { bootcampTracks } from "@/lib/bootcamp";
import { db } from "@/lib/db";

async function tutorTrackIds(userId: string, role: string) {
  if (role === "admin") {
    return Object.keys(bootcampTracks);
  }
  const rows = await db.tutorTrack.findMany({
    where: { tutorId: userId },
    select: { track: true },
  });
  return rows.map((row) => row.track);
}

export async function GET() {
  const auth = await requireTutorOrAdmin();
  if (isNextResponse(auth)) return auth;

  const allowedTracks = await tutorTrackIds(auth.userId, auth.role);

  const courses = await db.course.findMany({
    where:
      auth.role === "admin"
        ? undefined
        : { tutorId: auth.userId, track: { in: allowedTracks } },
    orderBy: [{ track: "asc" }, { order: "asc" }, { createdAt: "desc" }],
    include: {
      modules: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          access: true,
          order: true,
          videoUrl: true,
          passMark: true,
        },
      },
      tutor: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json({
    tracks: allowedTracks.map((id) => ({
      id,
      label: bootcampTracks[id] || id,
    })),
    courses: courses.map((course) => ({
      id: course.id,
      track: course.track,
      trackLabel: bootcampTracks[course.track] || course.track,
      title: course.title,
      description: course.description,
      order: course.order,
      published: course.published,
      tutor: course.tutor,
      moduleCount: course.modules.length,
      modules: course.modules,
      createdAt: course.createdAt.toISOString(),
    })),
  });
}

type CreateBody = {
  track?: string;
  title?: string;
  description?: string;
  order?: number;
};

export async function POST(request: Request) {
  const auth = await requireTutorOrAdmin();
  if (isNextResponse(auth)) return auth;

  const body = (await request.json()) as CreateBody;
  const track = String(body.track ?? "").trim();
  const title = String(body.title ?? "").trim();
  const description = String(body.description ?? "").trim();
  const order = Number(body.order ?? 0);

  if (!track || !(track in bootcampTracks)) {
    return NextResponse.json({ error: "Select a valid track." }, { status: 400 });
  }
  if (title.length < 2) {
    return NextResponse.json(
      { error: "Enter a course title." },
      { status: 400 },
    );
  }

  const allowed = await tutorTrackIds(auth.userId, auth.role);
  if (!allowed.includes(track)) {
    return NextResponse.json(
      { error: "You are not assigned to this track." },
      { status: 403 },
    );
  }

  const tutorId =
    auth.role === "admin"
      ? (
          await db.tutorTrack.findUnique({
            where: { track },
            select: { tutorId: true },
          })
        )?.tutorId || auth.userId
      : auth.userId;

  const course = await db.course.create({
    data: {
      track,
      title,
      description,
      order: Number.isFinite(order) ? order : 0,
      tutorId,
      published: true,
    },
  });

  return NextResponse.json({
    ok: true,
    course: {
      id: course.id,
      track: course.track,
      title: course.title,
      description: course.description,
      order: course.order,
    },
  });
}
