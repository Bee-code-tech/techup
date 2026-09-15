import { bootcampTracks } from "@/lib/bootcamp"
import { db } from "@/lib/db"

export type ChatPeer = {
  id: string
  name: string
  avatarUrl: string | null
  role: string
  track: string | null
  trackLabel: string | null
}

export type ChatMessageDto = {
  id: string
  conversationId: string
  senderId: string
  kind: string
  body: string
  mediaUrl: string | null
  mediaKey: string | null
  mediaName: string | null
  mediaMime: string | null
  mediaSize: number | null
  mediaDuration: number | null
  createdAt: string
  readAt: string | null
  clientId?: string | null
}

export function serializeMessage(
  row: {
    id: string
    conversationId: string
    senderId: string
    kind: string
    body: string
    mediaUrl: string | null
    mediaKey: string | null
    mediaName: string | null
    mediaMime: string | null
    mediaSize: number | null
    mediaDuration: number | null
    createdAt: Date
    readAt: Date | null
  },
  clientId?: string | null,
): ChatMessageDto {
  return {
    id: row.id,
    conversationId: row.conversationId,
    senderId: row.senderId,
    kind: row.kind,
    body: row.body,
    mediaUrl: row.mediaUrl,
    mediaKey: row.mediaKey,
    mediaName: row.mediaName,
    mediaMime: row.mediaMime,
    mediaSize: row.mediaSize,
    mediaDuration: row.mediaDuration,
    createdAt: row.createdAt.toISOString(),
    readAt: row.readAt?.toISOString() ?? null,
    clientId: clientId ?? null,
  }
}

export function messagePreview(kind: string, body: string) {
  if (kind === "image") return "Photo"
  if (kind === "file") return "File"
  if (kind === "audio") return "Voice note"
  if (kind === "video") return "Video"
  const text = body.trim()
  return text.length > 120 ? `${text.slice(0, 117)}…` : text
}

export function peerSelect() {
  return {
    id: true,
    name: true,
    avatarUrl: true,
    role: true,
    track: true,
  } as const
}

export function toPeer(user: {
  id: string
  name: string
  avatarUrl: string | null
  role: string
  track: string | null
}): ChatPeer {
  return {
    id: user.id,
    name: user.name,
    avatarUrl: user.avatarUrl,
    role: user.role,
    track: user.track,
    trackLabel: user.track ? bootcampTracks[user.track] || user.track : null,
  }
}

/** Resolve student↔tutor pairing with shared track. Anyone may message first. */
export async function resolveChatPairing(options: {
  userId: string
  role: string
  peerId: string
}) {
  if (options.userId === options.peerId) {
    return { ok: false as const, error: "Cannot message yourself." }
  }

  const peer = await db.user.findUnique({
    where: { id: options.peerId },
    select: { id: true, role: true, track: true, name: true },
  })
  if (!peer) {
    return { ok: false as const, error: "User not found." }
  }

  if (options.role === "student") {
    if (peer.role !== "tutor") {
      return { ok: false as const, error: "Students can only message tutors." }
    }
    const me = await db.user.findUnique({
      where: { id: options.userId },
      select: { track: true },
    })
    if (!me?.track) {
      return { ok: false as const, error: "Set your learning track first." }
    }
    const assigned = await db.tutorTrack.findFirst({
      where: { tutorId: peer.id, track: me.track },
    })
    if (!assigned) {
      return {
        ok: false as const,
        error: "That tutor is not assigned to your track.",
      }
    }
    return {
      ok: true as const,
      studentId: options.userId,
      tutorId: peer.id,
      track: me.track,
      peer,
    }
  }

  if (options.role === "tutor") {
    if (peer.role !== "student") {
      return { ok: false as const, error: "Tutors can only message students." }
    }
    if (!peer.track) {
      return { ok: false as const, error: "Student has no track assigned." }
    }
    const assigned = await db.tutorTrack.findFirst({
      where: { tutorId: options.userId, track: peer.track },
    })
    if (!assigned) {
      return {
        ok: false as const,
        error: "Student is not on one of your tracks.",
      }
    }
    return {
      ok: true as const,
      studentId: peer.id,
      tutorId: options.userId,
      track: peer.track,
      peer,
    }
  }

  return { ok: false as const, error: "Only students and tutors can chat." }
}

export async function assertConversationAccess(
  conversationId: string,
  userId: string,
  role: string,
) {
  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
  })
  if (!conversation) {
    return { ok: false as const, error: "Conversation not found.", status: 404 }
  }

  const isStudent =
    role === "student" && conversation.studentId === userId
  const isTutor = role === "tutor" && conversation.tutorId === userId
  if (!isStudent && !isTutor) {
    return { ok: false as const, error: "Forbidden.", status: 403 }
  }

  return {
    ok: true as const,
    conversation,
    asStudent: isStudent,
  }
}
