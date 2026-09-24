import { NextResponse } from "next/server"
import { isNextResponse, requireStudent } from "@/lib/api-auth"
import { bootcampTracks } from "@/lib/bootcamp"
import { db } from "@/lib/db"
import {
  isInAppLive,
  liveJoinHref,
  livePlatformLabel,
} from "@/lib/live-session"

export async function GET() {
  const auth = await requireStudent()
  if (isNextResponse(auth)) return auth

  const user = await db.user.findUnique({
    where: { id: auth.userId },
    select: { track: true, accessTier: true },
  })
  if (!user?.track) {
    return NextResponse.json({ session: null })
  }

  const audienceFilter =
    user.accessTier === "paid"
      ? [{ audience: "both" }, { audience: "paid" }, { audience: "free" }]
      : [{ audience: "both" }, { audience: "free" }]

  const live = await db.liveSession.findFirst({
    where: {
      track: user.track,
      isActive: true,
      OR: audienceFilter,
    },
    orderBy: { scheduledAt: "desc" },
    include: {
      tutor: { select: { name: true } },
    },
  })

  if (live) {
    return NextResponse.json({
      session: {
        id: live.id,
        title: live.title,
        platform: live.platform,
        joinUrl: liveJoinHref(live),
        inApp: isInAppLive(live.platform),
        platformLabel: livePlatformLabel(live.platform),
        audience: live.audience,
        status: "live" as const,
        trackLabel: bootcampTracks[live.track] || live.track,
        tutorName: live.tutor.name,
        scheduledAt: live.scheduledAt?.toISOString() ?? live.createdAt.toISOString(),
        createdAt: live.createdAt.toISOString(),
      },
    })
  }

  const upcoming = await db.liveSession.findFirst({
    where: {
      track: user.track,
      isActive: false,
      endedAt: null,
      scheduledAt: { gte: new Date() },
      OR: audienceFilter,
    },
    orderBy: { scheduledAt: "asc" },
    include: {
      tutor: { select: { name: true } },
    },
  })

  if (!upcoming) {
    return NextResponse.json({ session: null })
  }

  return NextResponse.json({
    session: {
      id: upcoming.id,
      title: upcoming.title,
      platform: upcoming.platform,
      joinUrl: liveJoinHref(upcoming),
      inApp: isInAppLive(upcoming.platform),
      platformLabel: livePlatformLabel(upcoming.platform),
      audience: upcoming.audience,
      status: "upcoming" as const,
      trackLabel: bootcampTracks[upcoming.track] || upcoming.track,
      tutorName: upcoming.tutor.name,
      scheduledAt: upcoming.scheduledAt?.toISOString() ?? upcoming.createdAt.toISOString(),
      createdAt: upcoming.createdAt.toISOString(),
    },
  })
}
