/** Chat media upload limits (best-practice caps). */

export const CHAT_LIMITS = {
  image: {
    maxBytes: 5 * 1024 * 1024,
    mime: ["image/jpeg", "image/png", "image/webp", "image/gif"] as const,
  },
  file: {
    maxBytes: 10 * 1024 * 1024,
    mime: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ] as const,
  },
  audio: {
    maxBytes: 5 * 1024 * 1024,
    maxSeconds: 120,
    mime: ["audio/webm", "audio/mpeg", "audio/mp4", "audio/ogg", "audio/wav"] as const,
  },
  video: {
    maxBytes: 25 * 1024 * 1024,
    maxSeconds: 30,
    mime: ["video/mp4", "video/webm", "video/quicktime"] as const,
  },
} as const

export type ChatMediaKind = "image" | "file" | "audio" | "video"

export function detectChatMediaKind(
  mime: string,
): ChatMediaKind | null {
  const type = mime.toLowerCase()
  if (CHAT_LIMITS.image.mime.includes(type as (typeof CHAT_LIMITS.image.mime)[number])) {
    return "image"
  }
  if (CHAT_LIMITS.file.mime.includes(type as (typeof CHAT_LIMITS.file.mime)[number])) {
    return "file"
  }
  if (CHAT_LIMITS.audio.mime.includes(type as (typeof CHAT_LIMITS.audio.mime)[number])) {
    return "audio"
  }
  if (CHAT_LIMITS.video.mime.includes(type as (typeof CHAT_LIMITS.video.mime)[number])) {
    return "video"
  }
  if (type.startsWith("image/")) return "image"
  if (type.startsWith("audio/")) return "audio"
  if (type.startsWith("video/")) return "video"
  return null
}

export function validateChatMedia(options: {
  mime: string
  size: number
  durationSeconds?: number | null
}) {
  const kind = detectChatMediaKind(options.mime)
  if (!kind) {
    return { ok: false as const, error: "Unsupported file type." }
  }
  const limit = CHAT_LIMITS[kind]
  if (options.size > limit.maxBytes) {
    const mb = Math.round(limit.maxBytes / (1024 * 1024))
    return { ok: false as const, error: `${kind} must be under ${mb}MB.` }
  }
  if (
    (kind === "audio" || kind === "video") &&
    "maxSeconds" in limit &&
    options.durationSeconds != null &&
    options.durationSeconds > limit.maxSeconds
  ) {
    return {
      ok: false as const,
      error:
        kind === "audio"
          ? "Voice notes must be 2 minutes or less."
          : "Videos must be 30 seconds or less.",
    }
  }
  return { ok: true as const, kind }
}

export function conversationChannel(conversationId: string) {
  return `chat:conversation:${conversationId}`
}

export function userInboxChannel(userId: string) {
  return `chat:inbox:${userId}`
}
