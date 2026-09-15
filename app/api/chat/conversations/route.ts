import { NextResponse } from "next/server"
import { isNextResponse, requireAnyAuth } from "@/lib/api-auth"
import { bootcampTracks } from "@/lib/bootcamp"
import {
  messagePreview,
  peerSelect,
  resolveChatPairing,
  toPeer,
} from "@/lib/chat-server"
import { db } from "@/lib/db"

export async function GET() {
  const auth = await requireAnyAuth()
  if (isNextResponse(auth)) return auth

  if (auth.role !== "student" && auth.role !== "tutor") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 })
  }

  const conversations = await db.conversation.findMany({
    where:
      auth.role === "student"
        ? { studentId: auth.userId }
        : { tutorId: auth.userId },
    orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
    include: {
      student: { select: peerSelect() },
      tutor: { select: peerSelect() },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          kind: true,
          body: true,
          senderId: true,
          createdAt: true,
        },
      },
    },
  })

  const items = conversations.map((row) => {
    const peer = auth.role === "student" ? row.tutor : row.student
    const last = row.messages[0] ?? null
    return {
      id: row.id,
      track: row.track,
      trackLabel: bootcampTracks[row.track] || row.track,
      peer: toPeer(peer),
      unread: auth.role === "student" ? row.studentUnread : row.tutorUnread,
      lastMessageAt: row.lastMessageAt?.toISOString() ?? null,
      lastMessageText:
        row.lastMessageText ??
        (last ? messagePreview(last.kind, last.body) : null),
      lastMessage: last
        ? {
            id: last.id,
            kind: last.kind,
            body: last.body,
            senderId: last.senderId,
            createdAt: last.createdAt.toISOString(),
          }
        : null,
      updatedAt: row.updatedAt.toISOString(),
    }
  })

  if (auth.role === "tutor") {
    const tracks = await db.tutorTrack.findMany({
      where: { tutorId: auth.userId },
      select: { track: true },
    })
    const trackIds = tracks.map((row) => row.track)
    const students = trackIds.length
      ? await db.user.findMany({
          where: { role: "student", track: { in: trackIds } },
          select: peerSelect(),
          orderBy: { name: "asc" },
        })
      : []

    return NextResponse.json({
      conversations: items,
      students: students.map(toPeer),
      tutors: [] as ReturnType<typeof toPeer>[],
      role: auth.role,
      userId: auth.userId,
    })
  }

  const me = await db.user.findUnique({
    where: { id: auth.userId },
    select: { track: true },
  })

  const tutors = me?.track
    ? await db.user.findMany({
        where: {
          role: "tutor",
          tutorTracks: { some: { track: me.track } },
        },
        select: peerSelect(),
        orderBy: { name: "asc" },
      })
    : []

  return NextResponse.json({
    conversations: items,
    students: [] as ReturnType<typeof toPeer>[],
    tutors: tutors.map(toPeer),
    role: auth.role,
    userId: auth.userId,
  })
}

export async function POST(request: Request) {
  const auth = await requireAnyAuth()
  if (isNextResponse(auth)) return auth

  if (auth.role !== "student" && auth.role !== "tutor") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 })
  }

  const body = (await request.json().catch(() => ({}))) as { peerId?: string }
  const peerId = String(body.peerId ?? "").trim()
  if (!peerId) {
    return NextResponse.json({ error: "peerId is required." }, { status: 400 })
  }

  const pairing = await resolveChatPairing({
    userId: auth.userId,
    role: auth.role,
    peerId,
  })
  if (!pairing.ok) {
    return NextResponse.json({ error: pairing.error }, { status: 400 })
  }

  const existing = await db.conversation.findUnique({
    where: {
      studentId_tutorId: {
        studentId: pairing.studentId,
        tutorId: pairing.tutorId,
      },
    },
    include: {
      student: { select: peerSelect() },
      tutor: { select: peerSelect() },
    },
  })

  const conversation =
    existing ??
    (await db.conversation.create({
      data: {
        studentId: pairing.studentId,
        tutorId: pairing.tutorId,
        track: pairing.track,
      },
      include: {
        student: { select: peerSelect() },
        tutor: { select: peerSelect() },
      },
    }))

  const peer =
    auth.role === "student" ? conversation.tutor : conversation.student

  return NextResponse.json({
    conversation: {
      id: conversation.id,
      track: conversation.track,
      trackLabel: bootcampTracks[conversation.track] || conversation.track,
      peer: toPeer(peer),
      unread:
        auth.role === "student"
          ? conversation.studentUnread
          : conversation.tutorUnread,
      lastMessageAt: conversation.lastMessageAt?.toISOString() ?? null,
      lastMessageText: conversation.lastMessageText,
      lastMessage: null,
      updatedAt: conversation.updatedAt.toISOString(),
    },
  })
}
