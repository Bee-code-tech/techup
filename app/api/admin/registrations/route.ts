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

type Scope = "overview" | "students" | "broadcast";

function parseScope(url: string): Scope {
  const scope = new URL(url).searchParams.get("scope");
  if (scope === "students" || scope === "broadcast" || scope === "overview") {
    return scope;
  }
  // Legacy callers without scope get students (list) — not the mega payload
  return "students";
}

async function buildStats(registrations: Array<{ createdAt: Date; track: string }>) {
  const todayKey = dateKeyInLagos(new Date());
  const yesterdayKey = addDaysKey(todayKey, -1);
  const monthPrefix = todayKey.slice(0, 7);

  const countsByDay = new Map<string, number>();
  const trackCounts = new Map<string, number>();

  for (const row of registrations) {
    const key = dateKeyInLagos(row.createdAt);
    countsByDay.set(key, (countsByDay.get(key) ?? 0) + 1);
    trackCounts.set(row.track, (trackCounts.get(row.track) ?? 0) + 1);
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

  const trackBreakdown = Array.from(trackCounts.entries())
    .map(([track, count]) => ({
      track,
      label: bootcampTracks[track] ?? track,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const dayCounts = Array.from(countsByDay.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    stats: {
      total: registrations.length,
      today: countsByDay.get(todayKey) ?? 0,
      yesterday: countsByDay.get(yesterdayKey) ?? 0,
      week,
      month,
      tracks: trackBreakdown.length,
      topTrack: trackBreakdown[0] ?? null,
    },
    daily: Array.from(dailyMap.entries()).map(([date, count]) => ({
      date,
      count,
    })),
    trackBreakdown,
    dayCounts,
  };
}

export async function GET(request: Request) {
  try {
    const scope = parseScope(request.url);

    if (scope === "overview") {
      const rows = await db.bootcampRegistration.findMany({
        select: { createdAt: true, track: true },
        orderBy: { createdAt: "asc" },
      });
      const built = await buildStats(rows);
      return NextResponse.json({
        stats: built.stats,
        daily: built.daily,
        trackBreakdown: built.trackBreakdown,
        dayCounts: built.dayCounts,
      });
    }

    if (scope === "broadcast") {
      const [registrations, broadcasts] = await Promise.all([
        db.bootcampRegistration.findMany({
          select: {
            id: true,
            fullName: true,
            email: true,
            track: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        }),
        db.broadcast.findMany({
          orderBy: { createdAt: "desc" },
          take: 100,
        }),
      ]);

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

      const lightRegistrations = registrations.map((row) => ({
        id: row.id,
        fullName: row.fullName,
        email: row.email,
        age: 0,
        gender: "",
        whatsapp: "",
        education: "",
        laptop: "",
        track: row.track,
        trackLabel: bootcampTracks[row.track] ?? row.track,
        createdAt: row.createdAt.toISOString(),
      }));

      return NextResponse.json({
        registrations: lightRegistrations,
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
        stats: {
          total: registrations.length,
          today: 0,
          yesterday: 0,
          week: 0,
          month: 0,
          tracks: 0,
          topTrack: null,
        },
        daily: [],
        trackBreakdown: [],
      });
    }

    // students scope — full roster only
    const registrations = await db.bootcampRegistration.findMany({
      orderBy: { createdAt: "desc" },
    });
    const built = await buildStats(registrations);

    return NextResponse.json({
      stats: built.stats,
      daily: built.daily,
      trackBreakdown: built.trackBreakdown,
      dayCounts: built.dayCounts,
      broadcasts: [],
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
