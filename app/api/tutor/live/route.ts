import { NextResponse } from "next/server";
import { isNextResponse, requireTutorOrAdmin } from "@/lib/api-auth";
import { bootcampTracks } from "@/lib/bootcamp";
import { db } from "@/lib/db";

async function tutorTracks(userId: string, role: string) {
  if (role === "admin") return Object.keys(bootcampTracks);
  const rows = await db.tutorTrack.findMany({
    where: { tutorId: userId },
    select: { track: true },
  });
  return rows.map((row) => row.track);
}

export async function GET() {
  const auth = await requireTutorOrAdmin();
  if (isNextResponse(auth)) return auth;

  const tracks = await tutorTracks(auth.userId, auth.role);
  const sessions = await db.liveSession.findMany({
    where:
      auth.role === "admin"
        ? undefined
        : { tutorId: auth.userId, track: { in: tracks } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({
    tracks: tracks.map((id) => ({ id, label: bootcampTracks[id] || id })),
    sessions: sessions.map((session) => ({
      ...session,
      trackLabel: bootcampTracks[session.track] || session.track,
      createdAt: session.createdAt.toISOString(),
      endedAt: session.endedAt?.toISOString() ?? null,
    })),
  });
}

type CreateBody = {
  track?: string;
  title?: string;
  platform?: string;
  joinUrl?: string;
  audience?: string;
};

export async function POST(request: Request) {
  const auth = await requireTutorOrAdmin();
  if (isNextResponse(auth)) return auth;

  const body = (await request.json()) as CreateBody;
  const track = String(body.track ?? "").trim();
  const title = String(body.title ?? "Live class").trim() || "Live class";
  const platform = body.platform === "zoom" ? "zoom" : "meet";
  const joinUrl = String(body.joinUrl ?? "").trim();
  const audience =
    body.audience === "free" || body.audience === "paid"
      ? body.audience
      : "both";

  const allowed = await tutorTracks(auth.userId, auth.role);
  if (!allowed.includes(track)) {
    return NextResponse.json(
      { error: "You are not assigned to this track." },
      { status: 403 },
    );
  }
  if (!/^https?:\/\//i.test(joinUrl)) {
    return NextResponse.json(
      { error: "Enter a valid Zoom or Google Meet URL." },
      { status: 400 },
    );
  }

  // End any other active session on this track for this tutor
  await db.liveSession.updateMany({
    where: { tutorId: auth.userId, track, isActive: true },
    data: { isActive: false, endedAt: new Date() },
  });

  const session = await db.liveSession.create({
    data: {
      track,
      tutorId: auth.userId,
      title,
      platform,
      joinUrl,
      audience,
      isActive: true,
    },
  });

  return NextResponse.json({
    ok: true,
    session: {
      ...session,
      trackLabel: bootcampTracks[session.track] || session.track,
      createdAt: session.createdAt.toISOString(),
    },
  });
}
