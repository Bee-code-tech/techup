import { NextResponse } from "next/server";
import { isNextResponse, requireAdmin } from "@/lib/api-auth";
import { bootcampTracks } from "@/lib/bootcamp";
import { db } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

type PatchBody = {
  name?: string;
  bio?: string;
  tracks?: string[];
};

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAdmin();
  if (isNextResponse(auth)) return auth;

  const { id } = await context.params;
  const tutor = await db.user.findFirst({
    where: { id, role: "tutor" },
    include: { tutorTracks: true },
  });
  if (!tutor) {
    return NextResponse.json({ error: "Tutor not found." }, { status: 404 });
  }

  const body = (await request.json()) as PatchBody;
  const name = body.name != null ? String(body.name).trim() : tutor.name;
  const bio =
    body.bio != null ? String(body.bio).trim() || null : tutor.bio;
  const tracks = Array.isArray(body.tracks)
    ? body.tracks.map(String).filter((track) => track in bootcampTracks)
    : tutor.tutorTracks.map((row) => row.track);

  if (name.length < 2) {
    return NextResponse.json(
      { error: "Please enter a valid name." },
      { status: 400 },
    );
  }
  if (tracks.length === 0) {
    return NextResponse.json(
      { error: "Assign at least one track." },
      { status: 400 },
    );
  }

  for (const track of tracks) {
    const taken = await db.tutorTrack.findUnique({ where: { track } });
    if (taken && taken.tutorId !== id) {
      return NextResponse.json(
        {
          error: `${bootcampTracks[track]} already has another tutor.`,
        },
        { status: 409 },
      );
    }
  }

  await db.tutorTrack.deleteMany({ where: { tutorId: id } });
  await db.user.update({
    where: { id },
    data: {
      name,
      bio,
      tutorTracks: {
        create: tracks.map((track) => ({ track })),
      },
    },
  });

  const updated = await db.user.findUnique({
    where: { id },
    include: { tutorTracks: true },
  });

  return NextResponse.json({
    ok: true,
    tutor: {
      id: updated!.id,
      name: updated!.name,
      email: updated!.email,
      bio: updated!.bio,
      tracks: updated!.tutorTracks.map((row) => row.track),
      trackLabels: updated!.tutorTracks.map(
        (row) => bootcampTracks[row.track] || row.track,
      ),
    },
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireAdmin();
  if (isNextResponse(auth)) return auth;

  const { id } = await context.params;
  const tutor = await db.user.findFirst({
    where: { id, role: "tutor" },
  });
  if (!tutor) {
    return NextResponse.json({ error: "Tutor not found." }, { status: 404 });
  }

  await db.tutorTrack.deleteMany({ where: { tutorId: id } });
  // Keep user row but demote? Spec says manage tutors — soft approach: delete tracks and set inactive role? 
  // Safer: keep account as tutor without tracks, or delete if no courses.
  const courseCount = await db.course.count({ where: { tutorId: id } });
  if (courseCount > 0) {
    return NextResponse.json(
      {
        error:
          "This tutor still has courses. Reassign or delete courses before removing the tutor.",
      },
      { status: 409 },
    );
  }

  await db.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
