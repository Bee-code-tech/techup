import { NextResponse } from "next/server"
import { isNextResponse, requireAnyAuth } from "@/lib/api-auth"
import { publishChatEvent } from "@/lib/ably"
import {
  conversationChannel,
  userInboxChannel,
  validateChatMedia,
} from "@/lib/chat"
import {
  assertConversationAccess,
  messagePreview,
  serializeMessage,
} from "@/lib/chat-server"
import { db } from "@/lib/db"
import { notifyUser } from "@/lib/notifications"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(request: Request, context: RouteContext) {
  const auth = await requireAnyAuth()
  if (isNextResponse(auth)) return auth

  if (auth.role !== "student" && auth.role !== "tutor") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 })
  }

  const { id } = await context.params
  const access = await assertConversationAccess(id, auth.userId, auth.role)
  if (!access.ok) {
    return NextResponse.json(
      { error: access.error },
      { status: access.status },
    )
  }

  const { searchParams } = new URL(request.url)
  const limitRaw = Number(searchParams.get("limit") || 40)
  const limit = Math.min(Math.max(Number.isFinite(limitRaw) ? limitRaw : 40, 1), 80)
  const cursor = searchParams.get("cursor")?.trim() || null

  let cursorCreatedAt: Date | null = null
  if (cursor) {
    const cursorMessage = await db.message.findFirst({
      where: { id: cursor, conversationId: id },
      select: { createdAt: true },
    })
    if (!cursorMessage) {
      return NextResponse.json({ error: "Invalid cursor." }, { status: 400 })
    }
    cursorCreatedAt = cursorMessage.createdAt
  }

  const rows = await db.message.findMany({
    where: {
      conversationId: id,
      ...(cursorCreatedAt
        ? { createdAt: { lt: cursorCreatedAt } }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
  })

  const hasMore = rows.length > limit
  const page = hasMore ? rows.slice(0, limit) : rows
  const messages = page.reverse().map((row) => serializeMessage(row))
  const nextCursor = hasMore ? page[0]?.id ?? null : null

  const now = new Date()
  await db.message.updateMany({
    where: {
      conversationId: id,
      senderId: { not: auth.userId },
      readAt: null,
    },
    data: { readAt: now },
  })

  if (access.asStudent && access.conversation.studentUnread > 0) {
    await db.conversation.update({
      where: { id },
      data: { studentUnread: 0 },
    })
  } else if (!access.asStudent && access.conversation.tutorUnread > 0) {
    await db.conversation.update({
      where: { id },
      data: { tutorUnread: 0 },
    })
  }

  return NextResponse.json({
    messages,
    nextCursor,
    hasMore,
  })
}

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireAnyAuth()
  if (isNextResponse(auth)) return auth

  if (auth.role !== "student" && auth.role !== "tutor") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 })
  }

  const { id } = await context.params
  const access = await assertConversationAccess(id, auth.userId, auth.role)
  if (!access.ok) {
    return NextResponse.json(
      { error: access.error },
      { status: access.status },
    )
  }

  const body = (await request.json().catch(() => ({}))) as {
    body?: string
    kind?: string
    mediaUrl?: string | null
    mediaKey?: string | null
    mediaName?: string | null
    mediaMime?: string | null
    mediaSize?: number | null
    mediaDuration?: number | null
    clientId?: string | null
  }

  const text = String(body.body ?? "").trim()
  const clientId = body.clientId ? String(body.clientId).slice(0, 80) : null
  const mediaUrl = body.mediaUrl ? String(body.mediaUrl).trim() : null
  const mediaKey = body.mediaKey ? String(body.mediaKey).trim() : null
  const mediaName = body.mediaName ? String(body.mediaName).trim() : null
  const mediaMime = body.mediaMime ? String(body.mediaMime).trim() : null
  const mediaSize =
    body.mediaSize != null && Number.isFinite(Number(body.mediaSize))
      ? Math.round(Number(body.mediaSize))
      : null
  const mediaDuration =
    body.mediaDuration != null && Number.isFinite(Number(body.mediaDuration))
      ? Math.round(Number(body.mediaDuration))
      : null

  let kind = String(body.kind ?? (mediaUrl ? "file" : "text")).trim() || "text"

  if (mediaUrl || mediaMime || mediaSize != null) {
    if (!mediaUrl || !mediaMime || mediaSize == null) {
      return NextResponse.json(
        { error: "Media messages require mediaUrl, mediaMime, and mediaSize." },
        { status: 400 },
      )
    }
    const validated = validateChatMedia({
      mime: mediaMime,
      size: mediaSize,
      durationSeconds: mediaDuration,
    })
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 })
    }
    kind = validated.kind
  } else {
    kind = "text"
    if (!text) {
      return NextResponse.json(
        { error: "Message body is required." },
        { status: 400 },
      )
    }
    if (text.length > 4000) {
      return NextResponse.json(
        { error: "Message is too long." },
        { status: 400 },
      )
    }
  }

  const preview = messagePreview(kind, text)
  const peerId = access.asStudent
    ? access.conversation.tutorId
    : access.conversation.studentId

  const message = await db.$transaction(async (tx) => {
    const created = await tx.message.create({
      data: {
        conversationId: id,
        senderId: auth.userId,
        kind,
        body: text,
        mediaUrl,
        mediaKey,
        mediaName,
        mediaMime,
        mediaSize,
        mediaDuration,
      },
    })

    await tx.conversation.update({
      where: { id },
      data: {
        lastMessageAt: created.createdAt,
        lastMessageText: preview,
        ...(access.asStudent
          ? { tutorUnread: { increment: 1 } }
          : { studentUnread: { increment: 1 } }),
      },
    })

    return created
  })

  const sender = await db.user.findUnique({
    where: { id: auth.userId },
    select: { name: true },
  })

  const dto = serializeMessage(message, clientId)

  await Promise.all([
    notifyUser({
      userId: peerId,
      type: "message",
      title: sender?.name ? `Message from ${sender.name}` : "New message",
      body: preview || "New message",
      href: `/dashboard/messages?c=${id}`,
    }).catch((error) => {
      console.error("[chat] notify failed", error)
    }),
    publishChatEvent(
      [conversationChannel(id), userInboxChannel(peerId)],
      "message",
      {
        conversationId: id,
        message: dto,
        preview,
        senderId: auth.userId,
      },
    ),
  ])

  return NextResponse.json({ message: dto, clientId })
}
