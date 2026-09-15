"use client"

import { format, isToday, isYesterday } from "date-fns"
import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type FormEvent,
} from "react"
import toast from "react-hot-toast"

import { SolarIcon } from "@/components/icons/solar-icon"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ChatMessage, ChatPeer } from "@/components/dashboard/chat/types"

type Props = {
  conversationId: string | null
  peer: ChatPeer | null
  currentUserId: string
  onBack?: () => void
  onMessageSent?: (message: ChatMessage) => void
  onMessagesRead?: () => void
  realtimeMessage?: ChatMessage | null
  /** When Ably is off, poll messages every 4s. */
  pollFallback?: boolean
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function formatDayLabel(iso: string) {
  const date = new Date(iso)
  if (isToday(date)) return "Today"
  if (isYesterday(date)) return "Yesterday"
  return format(date, "MMM d, yyyy")
}

function formatTime(iso: string) {
  return format(new Date(iso), "h:mm a")
}

function formatBytes(size: number | null) {
  if (size == null) return ""
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

async function mediaDurationSeconds(file: File): Promise<number | null> {
  if (!file.type.startsWith("audio/") && !file.type.startsWith("video/")) {
    return null
  }
  const url = URL.createObjectURL(file)
  try {
    const duration = await new Promise<number | null>((resolve) => {
      const el = document.createElement(
        file.type.startsWith("video/") ? "video" : "audio",
      )
      el.preload = "metadata"
      el.onloadedmetadata = () => {
        resolve(Number.isFinite(el.duration) ? el.duration : null)
      }
      el.onerror = () => resolve(null)
      el.src = url
    })
    return duration != null ? Math.round(duration) : null
  } finally {
    URL.revokeObjectURL(url)
  }
}

async function uploadChatFile(file: File, durationSeconds?: number | null) {
  const contentType = file.type || "application/octet-stream"
  const signRes = await fetch("/api/chat/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      contentType,
      size: file.size,
      durationSeconds: durationSeconds ?? null,
    }),
  })
  const signed = (await signRes.json()) as {
    error?: string
    uploadUrl?: string
    key?: string
    publicUrl?: string
    kind?: string
  }
  if (!signRes.ok || !signed.uploadUrl || !signed.key || !signed.publicUrl) {
    throw new Error(signed.error || "Could not prepare upload.")
  }

  const put = await fetch(signed.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
  })
  if (!put.ok) {
    throw new Error("Upload failed.")
  }

  return {
    url: signed.publicUrl,
    key: signed.key,
    kind: signed.kind || "file",
    mime: contentType,
  }
}

export function ChatThread({
  conversationId,
  peer,
  currentUserId,
  onBack,
  onMessageSent,
  onMessagesRead,
  realtimeMessage,
  pollFallback = false,
}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [draft, setDraft] = useState("")
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [recording, setRecording] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const stickToBottomRef = useRef(true)

  const loadMessages = useEffectEvent(async (id: string) => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/chat/conversations/${id}/messages?limit=40`,
      )
      const json = (await res.json()) as {
        error?: string
        messages?: ChatMessage[]
        nextCursor?: string | null
      }
      if (!res.ok) throw new Error(json.error || "Failed to load messages.")
      setMessages(json.messages || [])
      setNextCursor(json.nextCursor || null)
      onMessagesRead?.()
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: "auto" })
      })
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load messages.",
      )
      setMessages([])
      setNextCursor(null)
    } finally {
      setLoading(false)
    }
  })

  useEffect(() => {
    if (!conversationId) {
      setMessages([])
      setNextCursor(null)
      return
    }
    void loadMessages(conversationId)
  }, [conversationId])

  useEffect(() => {
    if (!realtimeMessage || !conversationId) return
    if (realtimeMessage.conversationId !== conversationId) return
    setMessages((current) => {
      if (
        current.some(
          (row) =>
            row.id === realtimeMessage.id ||
            (realtimeMessage.clientId &&
              row.clientId === realtimeMessage.clientId),
        )
      ) {
        return current.map((row) =>
          realtimeMessage.clientId &&
          row.clientId === realtimeMessage.clientId
            ? { ...realtimeMessage, pending: false, failed: false }
            : row.id === realtimeMessage.id
              ? { ...realtimeMessage, pending: false }
              : row,
        )
      }
      return [...current, realtimeMessage]
    })
    if (realtimeMessage.senderId !== currentUserId) {
      onMessagesRead?.()
    }
    if (stickToBottomRef.current) {
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
      })
    }
  }, [realtimeMessage, conversationId, currentUserId, onMessagesRead])

  useEffect(() => {
    if (!pollFallback || !conversationId) return
    const timer = window.setInterval(() => {
      void (async () => {
        try {
          const res = await fetch(
            `/api/chat/conversations/${conversationId}/messages?limit=40`,
          )
          if (!res.ok) return
          const json = (await res.json()) as {
            messages?: ChatMessage[]
            nextCursor?: string | null
          }
          const incoming = json.messages || []
          setMessages((current) => {
            const pending = current.filter((row) => row.pending || row.failed)
            const byId = new Set(incoming.map((row) => row.id))
            const leftovers = pending.filter((row) => {
              if (
                row.clientId &&
                incoming.some((msg) => msg.clientId === row.clientId)
              ) {
                return false
              }
              return !byId.has(row.id)
            })
            return [...incoming, ...leftovers]
          })
          setNextCursor(json.nextCursor || null)
          onMessagesRead?.()
        } catch {
          /* ignore poll errors */
        }
      })()
    }, 4000)
    return () => window.clearInterval(timer)
  }, [pollFallback, conversationId, onMessagesRead])

  async function loadOlder() {
    if (!conversationId || !nextCursor || loadingMore) return
    const el = listRef.current
    const prevHeight = el?.scrollHeight ?? 0
    setLoadingMore(true)
    try {
      const res = await fetch(
        `/api/chat/conversations/${conversationId}/messages?limit=40&cursor=${encodeURIComponent(nextCursor)}`,
      )
      const json = (await res.json()) as {
        error?: string
        messages?: ChatMessage[]
        nextCursor?: string | null
      }
      if (!res.ok) throw new Error(json.error || "Failed to load older messages.")
      setMessages((current) => {
        const existing = new Set(current.map((row) => row.id))
        const incoming = (json.messages || []).filter(
          (row) => !existing.has(row.id),
        )
        return [...incoming, ...current]
      })
      setNextCursor(json.nextCursor || null)
      requestAnimationFrame(() => {
        if (!el) return
        el.scrollTop = el.scrollHeight - prevHeight
      })
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load older messages.",
      )
    } finally {
      setLoadingMore(false)
    }
  }

  function onScroll() {
    const el = listRef.current
    if (!el) return
    stickToBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < 80
    if (el.scrollTop < 48 && nextCursor) {
      void loadOlder()
    }
  }

  async function sendPayload(payload: Record<string, unknown>) {
    if (!conversationId) return
    const clientId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `tmp-${Date.now()}`

    const optimistic: ChatMessage = {
      id: `optimistic-${clientId}`,
      conversationId,
      senderId: currentUserId,
      kind: String(payload.kind || "text"),
      body: String(payload.body || ""),
      mediaUrl: (payload.mediaUrl as string) || null,
      mediaKey: (payload.mediaKey as string) || null,
      mediaName: (payload.mediaName as string) || null,
      mediaMime: (payload.mediaMime as string) || null,
      mediaSize: (payload.mediaSize as number) || null,
      mediaDuration: (payload.mediaDuration as number) || null,
      createdAt: new Date().toISOString(),
      readAt: null,
      clientId,
      pending: true,
    }

    setMessages((current) => [...current, optimistic])
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    })

    try {
      const res = await fetch(
        `/api/chat/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, clientId }),
        },
      )
      const json = (await res.json()) as {
        error?: string
        message?: ChatMessage
        clientId?: string
      }
      if (!res.ok || !json.message) {
        throw new Error(json.error || "Could not send message.")
      }
      const confirmed = { ...json.message, clientId, pending: false }
      setMessages((current) =>
        current.map((row) =>
          row.clientId === clientId || row.id === optimistic.id
            ? confirmed
            : row,
        ),
      )
      onMessageSent?.(confirmed)
    } catch (error) {
      setMessages((current) =>
        current.map((row) =>
          row.clientId === clientId ? { ...row, pending: false, failed: true } : row,
        ),
      )
      toast.error(
        error instanceof Error ? error.message : "Could not send message.",
      )
    }
  }

  async function handleSubmit(event?: FormEvent) {
    event?.preventDefault()
    const text = draft.trim()
    if (!text || !conversationId || sending) return
    setSending(true)
    setDraft("")
    try {
      await sendPayload({ body: text, kind: "text" })
    } finally {
      setSending(false)
    }
  }

  async function handleFile(file: File | null) {
    if (!file || !conversationId) return
    setUploading(true)
    try {
      const duration = await mediaDurationSeconds(file)
      const uploaded = await uploadChatFile(file, duration)
      await sendPayload({
        kind: uploaded.kind,
        body: "",
        mediaUrl: uploaded.url,
        mediaKey: uploaded.key,
        mediaName: file.name,
        mediaMime: uploaded.mime,
        mediaSize: file.size,
        mediaDuration: duration,
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed.")
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
      if (imageRef.current) imageRef.current.value = ""
      if (videoRef.current) videoRef.current.value = ""
    }
  }

  async function toggleRecording() {
    if (recording) {
      mediaRecorderRef.current?.stop()
      setRecording(false)
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop())
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        const file = new File([blob], `voice-${Date.now()}.webm`, {
          type: "audio/webm",
        })
        void handleFile(file)
      }
      mediaRecorderRef.current = recorder
      recorder.start()
      setRecording(true)
    } catch {
      toast.error("Microphone access is required for voice notes.")
    }
  }

  if (!conversationId || !peer) {
    return (
      <div className="flex h-full min-h-[28rem] flex-1 flex-col items-center justify-center bg-[#fafafa] px-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-[#00206F]/8 text-[#00206F]">
          <SolarIcon name="chat-round-dots" size={28} className="size-7" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-[#001752]">
          Select a conversation
        </h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Choose a person from the list to start messaging. Anyone can send the
          first message.
        </p>
      </div>
    )
  }

  let lastDay = ""

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#fafafa]">
      <header className="flex items-center gap-3 border-b border-black/6 bg-white/90 px-4 py-3 backdrop-blur-sm">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex size-9 items-center justify-center rounded-xl text-[#00206F] transition hover:bg-[#00206F]/6 active:scale-95 md:hidden"
            aria-label="Back to inbox"
          >
            <SolarIcon name="alt-arrow-left" size={18} />
          </button>
        ) : null}
        <Avatar size="default" className="size-10">
          {peer.avatarUrl ? (
            <AvatarImage src={peer.avatarUrl} alt={peer.name} />
          ) : null}
          <AvatarFallback className="bg-[#00206F]/10 text-sm font-semibold text-[#00206F]">
            {initials(peer.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold text-[#001752]">
            {peer.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {peer.trackLabel || peer.role}
          </p>
        </div>
      </header>

      <div
        ref={listRef}
        onScroll={onScroll}
        className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4"
      >
        {loadingMore ? (
          <p className="text-center text-xs text-muted-foreground">Loading…</p>
        ) : null}
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Loading messages…
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <SolarIcon
              name="chat-round-line"
              size={28}
              className="size-7 text-[#00206F]/50"
            />
            <p className="mt-3 text-sm font-medium text-[#001752]">
              Say hello to {peer.name.split(" ")[0]}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Messages are private between you two.
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const day = formatDayLabel(message.createdAt)
            const showDay = day !== lastDay
            lastDay = day
            const mine = message.senderId === currentUserId
            return (
              <div key={message.id} className="space-y-3">
                {showDay ? (
                  <div className="flex justify-center">
                    <span className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-sm ring-1 ring-black/5">
                      {day}
                    </span>
                  </div>
                ) : null}
                <div
                  className={cn(
                    "flex animate-[chat-in_220ms_ease-out]",
                    mine ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[min(100%,28rem)] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm",
                      mine
                        ? "rounded-br-md bg-[#00206F] text-white"
                        : "rounded-bl-md border border-black/8 bg-white text-[#001752]",
                      message.pending && "opacity-70",
                      message.failed && "ring-1 ring-red-400/60",
                    )}
                  >
                    <MessageBody message={message} mine={mine} />
                    <p
                      className={cn(
                        "mt-1 text-[10px]",
                        mine ? "text-white/65" : "text-muted-foreground",
                      )}
                    >
                      {formatTime(message.createdAt)}
                      {message.pending ? " · Sending" : null}
                      {message.failed ? " · Failed" : null}
                    </p>
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-black/6 bg-white px-3 py-3"
      >
        <div className="flex items-end gap-2">
          <div className="flex items-center gap-0.5 pb-1">
            <input
              ref={imageRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(event) =>
                void handleFile(event.target.files?.[0] ?? null)
              }
            />
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt,application/pdf,text/plain"
              className="hidden"
              onChange={(event) =>
                void handleFile(event.target.files?.[0] ?? null)
              }
            />
            <input
              ref={videoRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              className="hidden"
              onChange={(event) =>
                void handleFile(event.target.files?.[0] ?? null)
              }
            />
            <IconButton
              label="Attach image"
              onClick={() => imageRef.current?.click()}
              disabled={uploading || sending}
            >
              <SolarIcon name="gallery" size={18} />
            </IconButton>
            <IconButton
              label="Attach file"
              onClick={() => fileRef.current?.click()}
              disabled={uploading || sending}
            >
              <SolarIcon name="paperclip" size={18} />
            </IconButton>
            <IconButton
              label="Attach short video"
              onClick={() => videoRef.current?.click()}
              disabled={uploading || sending}
            >
              <SolarIcon name="videocamera" size={18} />
            </IconButton>
            <IconButton
              label={recording ? "Stop recording" : "Record voice note"}
              onClick={() => void toggleRecording()}
              disabled={uploading || sending}
              active={recording}
            >
              <SolarIcon name={recording ? "stop" : "microphone"} size={18} />
            </IconButton>
          </div>
          <div className="min-w-0 flex-1">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault()
                  void handleSubmit()
                }
              }}
              rows={1}
              placeholder={
                uploading
                  ? "Uploading…"
                  : recording
                    ? "Recording voice note…"
                    : "Write a message…"
              }
              disabled={uploading || recording}
              className="max-h-32 min-h-11 w-full resize-none rounded-2xl border border-black/10 bg-[#fafafa] px-3.5 py-2.5 text-sm text-[#001752] outline-none transition focus:border-[#00206F]/35 focus:ring-2 focus:ring-[#00206F]/10"
            />
          </div>
          <Button
            type="submit"
            disabled={!draft.trim() || sending || uploading || recording}
            className="h-11 shrink-0 rounded-2xl bg-[#FB7801] px-4 text-white shadow-none transition active:scale-95 hover:bg-[#e86d00]"
          >
            <SolarIcon name="plain-2" size={18} className="size-[18px]" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </form>
      <style jsx global>{`
        @keyframes chat-in {
          from {
            opacity: 0;
            transform: translateY(6px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  )
}

function IconButton({
  children,
  label,
  onClick,
  disabled,
  active,
}: {
  children: React.ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
  active?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-xl text-[#00206F]/80 transition hover:bg-[#00206F]/6 active:scale-95 disabled:opacity-40",
        active && "bg-red-50 text-red-600 hover:bg-red-50",
      )}
    >
      {children}
    </button>
  )
}

function MessageBody({
  message,
  mine,
}: {
  message: ChatMessage
  mine: boolean
}) {
  if (message.kind === "image" && message.mediaUrl) {
    return (
      <a href={message.mediaUrl} target="_blank" rel="noreferrer">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={message.mediaUrl}
          alt={message.mediaName || "Image"}
          className="max-h-64 max-w-full rounded-xl object-cover"
        />
      </a>
    )
  }

  if (message.kind === "video" && message.mediaUrl) {
    return (
      <video
        controls
        src={message.mediaUrl}
        className="max-h-64 max-w-full rounded-xl"
      />
    )
  }

  if (message.kind === "audio" && message.mediaUrl) {
    return (
      <audio controls src={message.mediaUrl} className="max-w-full" />
    )
  }

  if (message.kind === "file" && message.mediaUrl) {
    return (
      <a
        href={message.mediaUrl}
        target="_blank"
        rel="noreferrer"
        className={cn(
          "inline-flex items-center gap-2 rounded-xl px-2 py-1.5",
          mine ? "bg-white/10" : "bg-[#00206F]/5",
        )}
      >
        <SolarIcon name="document" size={18} />
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">
            {message.mediaName || "Attachment"}
          </span>
          <span
            className={cn(
              "block text-[11px]",
              mine ? "text-white/65" : "text-muted-foreground",
            )}
          >
            {formatBytes(message.mediaSize)}
          </span>
        </span>
      </a>
    )
  }

  return (
    <p className="whitespace-pre-wrap break-words leading-relaxed">
      {message.body}
    </p>
  )
}
