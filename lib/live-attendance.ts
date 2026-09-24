import { db } from "@/lib/db"
import { audienceAllowsStudent, isAllTracksLive } from "@/lib/live-session"

export async function markLiveJoin(options: {
  sessionId: string
  userId: string
  role: string
}) {
  await db.liveAttendance.upsert({
    where: {
      sessionId_userId: {
        sessionId: options.sessionId,
        userId: options.userId,
      },
    },
    create: {
      sessionId: options.sessionId,
      userId: options.userId,
      role: options.role,
      joinedAt: new Date(),
      leftAt: null,
    },
    update: {
      leftAt: null,
      joinedAt: new Date(),
    },
  })
}

export async function markLiveLeave(sessionId: string, userId: string) {
  await db.liveAttendance.updateMany({
    where: { sessionId, userId, leftAt: null },
    data: { leftAt: new Date() },
  })
}

export async function expectedStudentsForSession(options: {
  track: string
  audience: string
}) {
  const students = await db.user.findMany({
    where: {
      role: "student",
      ...(isAllTracksLive(options.track) ? {} : { track: options.track }),
    },
    select: { id: true, name: true, email: true, accessTier: true, avatarUrl: true },
    orderBy: { name: "asc" },
  })
  return students.filter((student) =>
    audienceAllowsStudent(student.accessTier, options.audience),
  )
}
