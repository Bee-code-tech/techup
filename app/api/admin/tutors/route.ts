import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/password";
import { isNextResponse, requireAdmin } from "@/lib/api-auth";
import { bootcampTracks } from "@/lib/bootcamp";
import { db } from "@/lib/db";
import {
  generateTempPassword,
  sendTutorInviteEmail,
} from "@/lib/tutor-invite-email";

export async function GET() {
  const auth = await requireAdmin();
  if (isNextResponse(auth)) return auth;

  const tutors = await db.user.findMany({
    where: { role: "tutor" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      avatarUrl: true,
      mustChangePassword: true,
      createdAt: true,
      tutorTracks: {
        select: { id: true, track: true },
      },
    },
  });

  return NextResponse.json({
    tutors: tutors.map((tutor) => ({
      ...tutor,
      tracks: tutor.tutorTracks.map((row) => row.track),
      trackLabels: tutor.tutorTracks.map(
        (row) => bootcampTracks[row.track] || row.track,
      ),
      createdAt: tutor.createdAt.toISOString(),
    })),
    tracks: Object.entries(bootcampTracks).map(([id, label]) => ({
      id,
      label,
    })),
  });
}

type InviteBody = {
  name?: string;
  email?: string;
  tracks?: string[];
  bio?: string;
};

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (isNextResponse(auth)) return auth;

  const body = (await request.json()) as InviteBody;
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const bio = String(body.bio ?? "").trim();
  const tracks = Array.isArray(body.tracks)
    ? body.tracks.map(String).filter((track) => track in bootcampTracks)
    : [];

  if (name.length < 2) {
    return NextResponse.json(
      { error: "Please enter the tutor's full name." },
      { status: 400 },
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }
  if (tracks.length === 0) {
    return NextResponse.json(
      { error: "Assign at least one track." },
      { status: 400 },
    );
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "A user with this email already exists." },
      { status: 409 },
    );
  }

  for (const track of tracks) {
    const taken = await db.tutorTrack.findUnique({ where: { track } });
    if (taken) {
      return NextResponse.json(
        {
          error: `${bootcampTracks[track]} already has a tutor assigned.`,
        },
        { status: 409 },
      );
    }
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);

  const tutor = await db.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "tutor",
      bio: bio || null,
      mustChangePassword: true,
      tutorTracks: {
        create: tracks.map((track) => ({ track })),
      },
    },
    include: { tutorTracks: true },
  });

  const emailed = await sendTutorInviteEmail({
    name,
    email,
    tempPassword,
    tracks,
  });

  return NextResponse.json({
    ok: true,
    emailSent: emailed.ok,
    emailError: emailed.ok ? undefined : emailed.error,
    tempPassword: emailed.ok ? undefined : tempPassword,
    tutor: {
      id: tutor.id,
      name: tutor.name,
      email: tutor.email,
      tracks: tutor.tutorTracks.map((row) => row.track),
    },
  });
}
