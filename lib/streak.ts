import { db } from "@/lib/db"

/** UTC calendar day as YYYY-MM-DD */
export function activityDayKey(date = new Date()) {
  return date.toISOString().slice(0, 10)
}

function previousDayKey(day: string) {
  const date = new Date(`${day}T12:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() - 1)
  return date.toISOString().slice(0, 10)
}

/**
 * Bumps a student's learning streak when they do meaningful work today.
 * Idempotent for the same calendar day.
 */
export async function recordLearningActivity(userId: string) {
  const today = activityDayKey()
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      currentStreak: true,
      longestStreak: true,
      lastActivityDate: true,
    },
  })
  if (!user) return null

  if (user.lastActivityDate === today) {
    return {
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      lastActivityDate: user.lastActivityDate,
      bumped: false,
    }
  }

  const continued =
    user.lastActivityDate != null &&
    user.lastActivityDate === previousDayKey(today)
  const currentStreak = continued ? user.currentStreak + 1 : 1
  const longestStreak = Math.max(user.longestStreak, currentStreak)

  const updated = await db.user.update({
    where: { id: userId },
    data: {
      currentStreak,
      longestStreak,
      lastActivityDate: today,
    },
    select: {
      currentStreak: true,
      longestStreak: true,
      lastActivityDate: true,
    },
  })

  return { ...updated, bumped: true }
}
