import { NextResponse } from "next/server";
import { bootcampTracks } from "@/lib/bootcamp";
import { db } from "@/lib/db";

function dateKeyInLagos(date: Date) {
  return date.toLocaleDateString("en-CA", { timeZone: "Africa/Lagos" });
}

function addDaysKey(key: string, days: number) {
  const date = new Date(`${key}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export async function GET() {
  try {
    const [registrations, trackGroups, total, broadcasts] = await Promise.all([
      db.bootcampRegistration.findMany({
        orderBy: { createdAt: "desc" },
      }),
      db.bootcampRegistration.groupBy({
        by: ["track"],
        _count: { track: true },
      }),
      db.bootcampRegistration.count(),
      db.broadcast.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
    ]);

    const todayKey = dateKeyInLagos(new Date());
    const yesterdayKey = addDaysKey(todayKey, -1);
    const monthPrefix = todayKey.slice(0, 7);

    const countsByDay = new Map<string, number>();
    for (const row of registrations) {
      const key = dateKeyInLagos(row.createdAt);
      countsByDay.set(key, (countsByDay.get(key) ?? 0) + 1);
    }

    const dailyMap = new Map<string, number>();
    for (let i = 6; i >= 0; i -= 1) {
      const key = addDaysKey(todayKey, -i);
      dailyMap.set(key, countsByDay.get(key) ?? 0);
    }

    let week = 0;
    for (const count of dailyMap.values()) week += count;

    let month = 0;
    for (const [key, count] of countsByDay) {
      if (key.startsWith(monthPrefix)) month += count;
    }

    const trackBreakdown = trackGroups
      .map((group) => ({
        track: group.track,
        label: bootcampTracks[group.track] ?? group.track,
        count: group._count.track,
      }))
      .sort((a, b) => b.count - a.count);

    const topTrack = trackBreakdown[0] ?? null;
    const today = countsByDay.get(todayKey) ?? 0;
    const yesterday = countsByDay.get(yesterdayKey) ?? 0;

    const campaignKeys = Array.from(
      new Set(
        broadcasts
          .map((row) => row.campaignKey)
          .filter((key): key is string => Boolean(key)),
      ),
    );

    const deliveryRows =
      campaignKeys.length > 0
        ? await db.broadcastDelivery.findMany({
            where: {
              campaignKey: { in: campaignKeys },
              status: "sent",
            },
            select: { campaignKey: true, email: true },
          })
        : [];

    const sentByCampaign = new Map<string, Set<string>>();
    for (const row of deliveryRows) {
      const set = sentByCampaign.get(row.campaignKey) ?? new Set<string>();
      set.add(row.email.toLowerCase());
      sentByCampaign.set(row.campaignKey, set);
    }

    const registrationEmailsByTrack = new Map<string, string[]>();
    const allEmails = registrations.map((row) => row.email.toLowerCase());
    for (const row of registrations) {
      const list = registrationEmailsByTrack.get(row.track) ?? [];
      list.push(row.email.toLowerCase());
      registrationEmailsByTrack.set(row.track, list);
    }

    return NextResponse.json({
      stats: {
        total,
        today,
        yesterday,
        week,
        month,
        tracks: trackBreakdown.length,
        topTrack,
      },
      daily: Array.from(dailyMap.entries()).map(([date, count]) => ({
        date,
        count,
      })),
      trackBreakdown,
      broadcasts: broadcasts.map((row) => {
        const tracks = Array.isArray(row.tracks) ? row.tracks : [];
        const audienceEmails =
          tracks.length > 0
            ? tracks.flatMap(
                (track) => registrationEmailsByTrack.get(track) ?? [],
              )
            : allEmails;
        const uniqueAudience = Array.from(new Set(audienceEmails));
        const sentSet = row.campaignKey
          ? (sentByCampaign.get(row.campaignKey) ?? new Set<string>())
          : new Set<string>();
        const alreadyReceived = uniqueAudience.filter((email) =>
          sentSet.has(email),
        ).length;
        const remaining = Math.max(0, uniqueAudience.length - alreadyReceived);

        return {
          id: row.id,
          campaignKey: row.campaignKey || "",
          subject: row.subject,
          heading: row.heading || "",
          body: row.body,
          ctaLabel: row.ctaLabel || "",
          ctaUrl: row.ctaUrl || "",
          tracks,
          recipientCount: row.recipientCount,
          skippedCount: row.skippedCount ?? 0,
          alreadyReceived,
          remaining,
          audienceSize: uniqueAudience.length,
          createdAt: row.createdAt.toISOString(),
        };
      }),
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
