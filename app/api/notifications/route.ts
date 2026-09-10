import { NextResponse } from "next/server"
import { isNextResponse, requireAnyAuth } from "@/lib/api-auth"
import { db } from "@/lib/db"

export async function GET() {
  const auth = await requireAnyAuth()
  if (isNextResponse(auth)) return auth

  const notifications = await db.notification.findMany({
    where: { userId: auth.userId },
    orderBy: { createdAt: "desc" },
    take: 40,
  })
  const unreadCount = await db.notification.count({
    where: { userId: auth.userId, readAt: null },
  })

  return NextResponse.json({
    unreadCount,
    notifications: notifications.map((row) => ({
      id: row.id,
      type: row.type,
      title: row.title,
      body: row.body,
      href: row.href,
      readAt: row.readAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
    })),
  })
}

export async function PATCH(request: Request) {
  const auth = await requireAnyAuth()
  if (isNextResponse(auth)) return auth

  const body = (await request.json().catch(() => ({}))) as {
    action?: string
    id?: string
  }

  if (body.action === "read-all") {
    await db.notification.updateMany({
      where: { userId: auth.userId, readAt: null },
      data: { readAt: new Date() },
    })
    return NextResponse.json({ ok: true })
  }

  if (body.action === "read" && body.id) {
    await db.notification.updateMany({
      where: { id: body.id, userId: auth.userId },
      data: { readAt: new Date() },
    })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 })
}
