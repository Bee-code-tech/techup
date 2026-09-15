"use client"

import { useEffect, useRef, useState } from "react"
import Ably from "ably"

import type { ChatRealtimeEvent } from "@/components/dashboard/chat/types"
import {
  conversationChannel,
  userInboxChannel,
} from "@/lib/chat"

type Options = {
  userId?: string | null
  conversationId?: string | null
  enabled?: boolean
  onEvent?: (event: ChatRealtimeEvent) => void
}

/**
 * Ably realtime for chat. When ABLY_API_KEY is unset, configured=false and
 * callers should poll. onEvent fires for inbox + active conversation events.
 */
export function useChatRealtime(options: Options) {
  const { userId, conversationId, enabled = true, onEvent } = options
  const [configured, setConfigured] = useState(false)
  const onEventRef = useRef(onEvent)
  onEventRef.current = onEvent

  useEffect(() => {
    if (!enabled || !userId) {
      setConfigured(false)
      return
    }

    let cancelled = false
    let client: Ably.Realtime | null = null
    let inbox: Ably.RealtimeChannel | null = null
    let thread: Ably.RealtimeChannel | null = null

    const emit = (message: Ably.Message) => {
      const data = (message.data || {}) as Record<string, unknown>
      onEventRef.current?.({
        name: message.name || "message",
        ...data,
      })
    }

    void (async () => {
      try {
        const probe = await fetch("/api/chat/ably-token")
        const probeJson = (await probe.json().catch(() => ({}))) as {
          configured?: boolean
        }
        if (cancelled) return
        if (!probe.ok || !probeJson.configured) {
          setConfigured(false)
          return
        }
        setConfigured(true)

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
          clientId: userId,
        })

        if (cancelled) {
          client.close()
          return
        }

        inbox = client.channels.get(userInboxChannel(userId))
        inbox.subscribe(emit)

        if (conversationId) {
          thread = client.channels.get(conversationChannel(conversationId))
          thread.subscribe(emit)
        }
      } catch {
        if (!cancelled) setConfigured(false)
      }
    })()

    return () => {
      cancelled = true
      try {
        inbox?.unsubscribe(emit)
        thread?.unsubscribe(emit)
      } catch {
        /* ignore */
      }
      client?.close()
    }
  }, [userId, conversationId, enabled])

  return {
    configured,
    onEvent: (handler: (event: ChatRealtimeEvent) => void) => {
      onEventRef.current = handler
    },
  }
}
