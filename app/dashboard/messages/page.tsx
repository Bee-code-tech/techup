"use client"

import { Suspense, useCallback, useEffect, useEffectEvent, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import toast from "react-hot-toast"

import { ChatInbox } from "@/components/dashboard/chat/chat-inbox"
import { ChatThread } from "@/components/dashboard/chat/chat-thread"
import { useChatRealtime } from "@/components/dashboard/chat/use-chat-realtime"
import type {
  ChatConversation,
  ChatMessage,
  ChatPeer,
  ChatRealtimeEvent,
  ConversationsPayload,
} from "@/components/dashboard/chat/types"
import { useSessionUser } from "@/components/dashboard/use-session"
import { cn } from "@/lib/utils"

function messagePreview(kind: string, body: string) {
  if (kind === "image") return "Photo"
  if (kind === "file") return "File"
  if (kind === "audio") return "Voice note"
  if (kind === "video") return "Video"
  return body
}

function MessagesWorkspace() {
  const session = useSessionUser()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<"student" | "tutor">("student")
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [students, setStudents] = useState<ChatPeer[]>([])
  const [tutors, setTutors] = useState<ChatPeer[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedPeer, setSelectedPeer] = useState<ChatPeer | null>(null)
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false)
  const [realtimeMessage, setRealtimeMessage] = useState<ChatMessage | null>(
    null,
  )

  const selectedConversation = useMemo(
    () => conversations.find((row) => row.id === selectedId) ?? null,
    [conversations, selectedId],
  )

  const activePeer = selectedConversation?.peer ?? selectedPeer
  const peers = role === "tutor" ? students : tutors

  const loadInbox = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res = await fetch("/api/chat/conversations")
      const json = (await res.json()) as ConversationsPayload & {
        error?: string
      }
      if (!res.ok) {
        throw new Error(json.error || "Failed to load conversations.")
      }
      setRole(json.role)
      setConversations(json.conversations || [])
      setStudents(json.students || [])
      setTutors(json.tutors || [])
      return json
    } catch (error) {
      if (!silent) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to load conversations.",
        )
      }
      return null
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadInbox()
  }, [loadInbox])

  useEffect(() => {
    const deepLink = searchParams.get("c")
    if (!deepLink || loading) return
    const match = conversations.find((row) => row.id === deepLink)
    if (match) {
      setSelectedId(match.id)
      setSelectedPeer(match.peer)
      setMobileThreadOpen(true)
    }
  }, [searchParams, conversations, loading])

  const handleRealtime = useEffectEvent((event: ChatRealtimeEvent) => {
    const message = event.message
    if (message?.conversationId) {
      setRealtimeMessage(message)
      setConversations((current) => {
        const index = current.findIndex(
          (row) => row.id === message.conversationId,
        )
        if (index < 0) {
          void loadInbox(true)
          return current
        }
        const next = [...current]
        const row = next[index]
        const isMine = message.senderId === session.user?.id
        const viewing = selectedId === message.conversationId
        next[index] = {
          ...row,
          lastMessageAt: message.createdAt,
          lastMessageText:
            event.preview ||
            messagePreview(message.kind, message.body) ||
            row.lastMessageText,
          lastMessage: {
            id: message.id,
            kind: message.kind,
            body: message.body,
            senderId: message.senderId,
            createdAt: message.createdAt,
          },
          unread: isMine || viewing ? (viewing ? 0 : row.unread) : row.unread + 1,
          updatedAt: message.createdAt,
        }
        next.sort((a, b) => {
          const at = a.lastMessageAt ? Date.parse(a.lastMessageAt) : 0
          const bt = b.lastMessageAt ? Date.parse(b.lastMessageAt) : 0
          return bt - at
        })
        return next
      })
    } else {
      void loadInbox(true)
    }
  })

  const { configured } = useChatRealtime({
    userId: session.user?.id,
    conversationId: selectedId,
    enabled: Boolean(session.user?.id),
    onEvent: handleRealtime,
  })

  useEffect(() => {
    if (configured) return
    const timer = window.setInterval(() => {
      void loadInbox(true)
    }, 4000)
    return () => window.clearInterval(timer)
  }, [configured, loadInbox])

  async function openPeer(peer: ChatPeer) {
    setSelectedPeer(peer)
    setMobileThreadOpen(true)
    const existing = conversations.find((row) => row.peer.id === peer.id)
    if (existing) {
      setSelectedId(existing.id)
      return
    }
    try {
      const res = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ peerId: peer.id }),
      })
      const json = (await res.json()) as {
        error?: string
        conversation?: ChatConversation
      }
      if (!res.ok || !json.conversation) {
        throw new Error(json.error || "Could not open conversation.")
      }
      setConversations((current) => {
        if (current.some((row) => row.id === json.conversation!.id)) {
          return current
        }
        return [json.conversation!, ...current]
      })
      setSelectedId(json.conversation.id)
      setSelectedPeer(json.conversation.peer)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not open conversation.",
      )
    }
  }

  function openConversation(conversation: ChatConversation) {
    setSelectedId(conversation.id)
    setSelectedPeer(conversation.peer)
    setMobileThreadOpen(true)
    setConversations((current) =>
      current.map((row) =>
        row.id === conversation.id ? { ...row, unread: 0 } : row,
      ),
    )
  }

  function onMessageSent(message: ChatMessage) {
    setConversations((current) => {
      const index = current.findIndex(
        (row) => row.id === message.conversationId,
      )
      if (index < 0) return current
      const next = [...current]
      next[index] = {
        ...next[index],
        lastMessageAt: message.createdAt,
        lastMessageText: messagePreview(message.kind, message.body),
        lastMessage: {
          id: message.id,
          kind: message.kind,
          body: message.body,
          senderId: message.senderId,
          createdAt: message.createdAt,
        },
        unread: 0,
        updatedAt: message.createdAt,
      }
      next.sort((a, b) => {
        const at = a.lastMessageAt ? Date.parse(a.lastMessageAt) : 0
        const bt = b.lastMessageAt ? Date.parse(b.lastMessageAt) : 0
        return bt - at
      })
      return next
    })
  }

  if (!session.user) return null

  if (session.user.role !== "student" && session.user.role !== "tutor") {
    return (
      <div className="px-4 py-10 text-sm text-muted-foreground lg:px-6">
        Messages are available for students and tutors.
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-[calc(100dvh-7.5rem)] flex-1 overflow-hidden border-y border-black/6 bg-white md:mx-4 md:mb-4 md:rounded-2xl md:border lg:mx-6">
        <div
          className={cn(
            "h-full min-h-0 w-full md:flex md:w-auto",
            mobileThreadOpen ? "hidden md:flex" : "flex",
          )}
        >
          <ChatInbox
            role={role}
            conversations={conversations}
            peers={peers}
            selectedConversationId={selectedId}
            selectedPeerId={activePeer?.id ?? null}
            onSelectConversation={openConversation}
            onSelectPeer={(peer) => void openPeer(peer)}
            loading={loading}
          />
        </div>
        <div
          className={cn(
            "min-h-0 min-w-0 flex-1",
            mobileThreadOpen ? "flex" : "hidden md:flex",
          )}
        >
          <ChatThread
            conversationId={selectedId}
            peer={activePeer}
            currentUserId={session.user.id}
            onBack={() => setMobileThreadOpen(false)}
            onMessageSent={onMessageSent}
            onMessagesRead={() => {
              if (!selectedId) return
              setConversations((current) =>
                current.map((row) =>
                  row.id === selectedId ? { ...row, unread: 0 } : row,
                ),
              )
            }}
            realtimeMessage={realtimeMessage}
            pollFallback={!configured}
          />
        </div>
      </div>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="px-4 py-10 text-sm text-muted-foreground lg:px-6">
          Loading messages…
        </div>
      }
    >
      <MessagesWorkspace />
    </Suspense>
  )
}
