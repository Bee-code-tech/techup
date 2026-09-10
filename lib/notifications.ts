import { db } from "@/lib/db"

export type NotifyInput = {
  userId: string
  type: string
  title: string
  body?: string
  href?: string | null
}

export async function notifyUser(input: NotifyInput) {
  return db.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body ?? "",
      href: input.href ?? null,
    },
  })
}

export async function notifyUsers(
  userIds: string[],
  payload: Omit<NotifyInput, "userId">,
) {
  const unique = [...new Set(userIds.filter(Boolean))]
  if (unique.length === 0) return { count: 0 }
  const result = await db.notification.createMany({
    data: unique.map((userId) => ({
      userId,
      type: payload.type,
      title: payload.title,
      body: payload.body ?? "",
      href: payload.href ?? null,
    })),
  })
  return result
}

export async function notifyTrackStudents(
  track: string,
  payload: Omit<NotifyInput, "userId">,
) {
  const students = await db.user.findMany({
    where: { role: "student", track },
    select: { id: true },
  })
  return notifyUsers(
    students.map((row) => row.id),
    payload,
  )
}
