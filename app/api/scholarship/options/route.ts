import { NextResponse } from "next/server"
import { bootcampTracks } from "@/lib/bootcamp"
import { db } from "@/lib/db"
import {
  AGE_RANGES,
  COUNTRIES,
  DAILY_HOURS,
  EDUCATION_LEVELS,
  GENDERS,
  REFERRAL_SOURCES,
  YES_NO,
} from "@/lib/scholarship-options"

export async function GET() {
  const cohorts = await db.cohort.findMany({
    where: {
      status: "active",
      scholarshipEnabled: true,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      priceKobo: true,
      tracks: true,
      scholarshipPercentOff: true,
      scholarshipConsentText: true,
      scholarshipDeadlineDays: true,
    },
  })

  return NextResponse.json({
    options: {
      ageRanges: AGE_RANGES,
      genders: GENDERS,
      countries: COUNTRIES,
      educationLevels: EDUCATION_LEVELS,
      referralSources: REFERRAL_SOURCES,
      dailyHours: DAILY_HOURS,
      yesNo: YES_NO,
    },
    tracks: Object.entries(bootcampTracks).map(([id, label]) => ({
      id,
      label,
    })),
    cohorts: cohorts.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      priceKobo: row.priceKobo,
      tracks: row.tracks,
      trackOptions: row.tracks.map((id) => ({
        id,
        label: bootcampTracks[id] || id,
      })),
      scholarshipPercentOff: row.scholarshipPercentOff,
      scholarshipConsentText: row.scholarshipConsentText,
      scholarshipDeadlineDays: row.scholarshipDeadlineDays,
    })),
  })
}
