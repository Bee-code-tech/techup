"use client"

import { useEffect, useRef, useState } from "react"
import Ably from "ably"

import { SolarIcon } from "@/components/icons/solar-icon"
import { liveSessionChannel } from "@/lib/live-session"
import { cn } from "@/lib/utils"

type ChatItem = {
  id: string
  userId: string
  name: string
  text: string
  at: string
  avatarUrl?: string | null
}

function initials(name?: string) {
  const parts = String(name || "Student")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
  return parts.map((part) => part[0]?.toUpperCase() || "").join("") || "S"
}

function ChatAvatar({
  name,
  avatarUrl,
}: {
  name: string
  avatarUrl?: string | null
}) {
  return (
    <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#00206F] text-[10px] font-semibold text-white">
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt="" className="size-full object-cover" />
      ) : (
        initials(name)
      )}
    </div>
  )
}

export function LiveChat({
  sessionId,
  userId,
  userName,
  userAvatar,
}: {
  sessionId: string
  userId: string
  userName: string
  userAvatar?: string | null
}) {
  const [messages, setMessages] = useState<ChatItem[]>([])
  const [draft, setDraft] = useState("")
  const [ready, setReady] = useState(false)
  const [offline, setOffline] = useState(false)
  const channelRef = useRef<Ably.RealtimeChannel | null>(null)
  const scroller = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let cancelled = false
    let client: Ably.Realtime | null = null

    void (async () => {
      try {
        const probe = await fetch("/api/chat/ably-token")
        const probeJson = (await probe.json().catch(() => ({}))) as {
          configured?: boolean
        }
        if (cancelled) return
        if (!probe.ok || !probeJson.configured) {
          setOffline(true)
          return
        }

        client = new Ably.Realtime({
          authCallback: (_tokenParams, callback) => {
            void (async () => {
              try {
                const res = await fetch("/api/chat/ably-token")
                const json = (await res.json()) as {
                  tokenRequest?: Ably.TokenRequest
                  error?: string
                }
                if (!res.ok || !json.tokenRequest) {
                  callback(json.error || "Ably auth failed", null)
                  return
                }
                callback(null, json.tokenRequest)
              } catch (error) {
                callback(
                  error instanceof Error ? error.message : "Ably auth failed",
                  null,
                )
              }
            })()
          },
        })

        const channel = client.channels.get(liveSessionChannel(sessionId))
        channelRef.current = channel
        await channel.subscribe("chat", (message) => {
          const data = (message.data || {}) as ChatItem
          if (!data.id || !data.text) return
          setMessages((current) => {
            if (current.some((item) => item.id === data.id)) return current
            return [...current, data].slice(-200)
          })
        })
        if (!cancelled) setReady(true)
      } catch {
        if (!cancelled) setOffline(true)
      }
    })()

    return () => {
      cancelled = true
      void channelRef.current?.unsubscribe()
      channelRef.current = null
      client?.close()
    }
  }, [sessionId])

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight })
  }, [messages.length])

  async function send(event: React.FormEvent) {
    event.preventDefault()
    const text = draft.trim()
    if (!text || !channelRef.current) return
    const item: ChatItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId,
      name: userName,
      text,
      at: new Date().toISOString(),
      avatarUrl: userAvatar || null,
    }
    setDraft("")
    setMessages((current) => [...current, item].slice(-200))
    try {
      await channelRef.current.publish("chat", item)
    } catch {
      setMessages((current) => current.filter((row) => row.id !== item.id))
      setDraft(text)
    }
  }

  return (
    <aside className="flex h-full min-h-0 flex-col">
      <div ref={scroller} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {offline ? (
          <p className="text-sm text-muted-foreground">
            Chat is unavailable right now.
          </p>
        ) : messages.length === 0 ? (
          <div className="flex h-full min-h-36 flex-col items-center justify-center text-center">
            <div className="grid size-10 place-items-center rounded-xl bg-[#f4f7fc] text-[#00206F]">
              <SolarIcon name="chat-round-dots" className="size-4" />
            </div>
            <p className="mt-3 text-sm font-medium text-[#001752]">
              {ready ? "Say something" : "Connecting chat…"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Messages stay in this class.
            </p>
          </div>
        ) : (
          messages.map((item) => {
            const mine = item.userId === userId
            return (
              <div
                key={item.id}
                className={cn(
                  "flex max-w-[92%] items-end gap-2",
                  mine && "ml-auto flex-row-reverse",
                )}
              >
                <ChatAvatar name={item.name} avatarUrl={item.avatarUrl} />
                <div className={cn(mine && "text-right")}>
                  <p className="mb-1 text-[11px] font-medium text-muted-foreground">
                    {mine ? "You" : item.name}
                  </p>
                  <div
                    className={cn(
                      "rounded-2xl px-3 py-2 text-left text-sm leading-relaxed",
                      mine
                        ? "bg-[#FB7801] text-white"
                        : "bg-[#f4f7fc] text-[#001752]",
                    )}
                  >
                    {item.text}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
      <form
        onSubmit={(event) => void send(event)}
        className="flex gap-2 border-t border-black/6 p-3"
      >
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={offline ? "Chat unavailable" : "Message the class"}
          disabled={!ready || offline}
          className="h-10 min-w-0 flex-1 rounded-xl border border-black/8 bg-[#f7f9fc] px-3 text-sm text-[#001752] placeholder:text-muted-foreground focus:border-[#00206F]/30 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!ready || offline || !draft.trim()}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#00206F] text-white disabled:opacity-40"
        >
          <SolarIcon name="plain-2" className="size-4" />
        </button>
      </form>
    </aside>
  )
}
