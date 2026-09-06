import { NextResponse } from "next/server";
import { isNextResponse, requireStudent } from "@/lib/api-auth";
import { bootcampTracks } from "@/lib/bootcamp";
import { db } from "@/lib/db";

export async function GET() {
  const auth = await requireStudent();
  if (isNextResponse(auth)) return auth;

  const user = await db.user.findUnique({
    where: { id: auth.userId },
    select: { track: true, accessTier: true },
  });
  if (!user?.track) {
    return NextResponse.json({ session: null });
  }

  const session = await db.liveSession.findFirst({
    where: {
      track: user.track,
      isActive: true,
      OR:
        user.accessTier === "paid"
          ? [{ audience: "both" }, { audience: "paid" }, { audience: "free" }]
          : [{ audience: "both" }, { audience: "free" }],
    },
    orderBy: { createdAt: "desc" },
    include: {
      tutor: { select: { name: true } },
    },
  });

  if (!session) {
    return NextResponse.json({ session: null });
  }

  return NextResponse.json({
    session: {
      id: session.id,
      title: session.title,
      platform: session.platform,
      joinUrl: session.joinUrl,
      audience: session.audience,
      trackLabel: bootcampTracks[session.track] || session.track,
      tutorName: session.tutor.name,
      createdAt: session.createdAt.toISOString(),
    },
  });
}
