import { NextResponse } from "next/server";
import { bootcampTracks } from "@/lib/bootcamp";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [registrations, trackGroups, total] = await Promise.all([
      db.bootcampRegistration.findMany({
        orderBy: { createdAt: "desc" },
      }),
      db.bootcampRegistration.groupBy({
        by: ["track"],
        _count: { track: true },
      }),
      db.bootcampRegistration.count(),
    ]);

    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentDaily = await db.bootcampRegistration.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
    });

    const dailyMap = new Map<string, number>();
    for (let i = 0; i < 7; i += 1) {
      const day = new Date(sevenDaysAgo);
      day.setDate(sevenDaysAgo.getDate() + i);
      dailyMap.set(day.toISOString().slice(0, 10), 0);
    }

    for (const row of recentDaily) {
      const key = row.createdAt.toISOString().slice(0, 10);
      dailyMap.set(key, (dailyMap.get(key) ?? 0) + 1);
    }

    const trackBreakdown = trackGroups.map((group) => ({
      track: group.track,
      label: bootcampTracks[group.track] ?? group.track,
      count: group._count.track,
    }));

    const todayKey = now.toISOString().slice(0, 10);
    const todayCount = dailyMap.get(todayKey) ?? 0;

    return NextResponse.json({
      stats: {
        total,
        today: todayCount,
        tracks: trackBreakdown.length,
      },
      daily: Array.from(dailyMap.entries()).map(([date, count]) => ({
        date,
        count,
      })),
      trackBreakdown,
      registrations: registrations.map((row) => ({
        id: row.id,
        fullName: row.fullName,
        email: row.email,
        age: row.age,
        gender: row.gender,
        whatsapp: row.whatsapp,
        education: row.education,
        laptop: row.laptop,
        track: row.track,
        trackLabel: bootcampTracks[row.track] ?? row.track,
        createdAt: row.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Failed to load registrations", error);
    return NextResponse.json(
      { error: "Could not load registrations. Check database connection." },
      { status: 500 },
    );
  }
}
