"use client"

import { formatDistanceToNowStrict } from "date-fns"
import { useMemo, useState } from "react"

import { SolarIcon } from "@/components/icons/solar-icon"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import type {
  ChatConversation,
  ChatPeer,
  InboxRow,
} from "@/components/dashboard/chat/types"

type Props = {
  role: "student" | "tutor"
  conversations: ChatConversation[]
  peers: ChatPeer[]
  selectedConversationId: string | null
  selectedPeerId: string | null
  onSelectConversation: (conversation: ChatConversation) => void
  onSelectPeer: (peer: ChatPeer) => void
  loading?: boolean
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function relativeTime(iso: string | null) {
  if (!iso) return ""
  try {
    return formatDistanceToNowStrict(new Date(iso), { addSuffix: false })
  } catch {
    return ""
  }
}

export function ChatInbox({
  role,
  conversations,
  peers,
  selectedConversationId,
  selectedPeerId,
  onSelectConversation,
  onSelectPeer,
  loading,
}: Props) {
  const [query, setQuery] = useState("")

  const rows = useMemo(() => {
    const conversationPeerIds = new Set(
      conversations.map((row) => row.peer.id),
    )
    const list: InboxRow[] = [
      ...conversations.map((conversation) => ({
        key: `c-${conversation.id}`,
        kind: "conversation" as const,
        conversation,
        peer: conversation.peer,
      })),
      ...peers
        .filter((peer) => !conversationPeerIds.has(peer.id))
        .map((peer) => ({
          key: `p-${peer.id}`,
          kind: "peer" as const,
          peer,
          conversation: null,
        })),
    ]

    const q = query.trim().toLowerCase()
    if (!q) return list
    return list.filter((row) => {
      const hay = [
        row.peer.name,
        row.peer.trackLabel,
        row.kind === "conversation" ? row.conversation.lastMessageText : "",
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      return hay.includes(q)
    })
  }, [conversations, peers, query])

  return (
    <aside className="flex h-full min-h-0 w-full flex-col border-r border-black/6 bg-[#fafafa] md:w-[22rem] md:shrink-0">
      <div className="border-b border-black/6 bg-white/90 px-4 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-[#00206F]/8 text-[#00206F]">
            <SolarIcon name="chat-round-dots" size={18} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#001752]">Messages</h2>
            <p className="text-xs text-muted-foreground">
              {role === "tutor"
                ? "Students on your tracks"
                : "Tutors on your track"}
            </p>
          </div>
        </div>
        <label className="relative mt-3 block">
          <SolarIcon
            name="magnifer"
            size={16}
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search people…"
            className="h-10 w-full rounded-xl border border-black/10 bg-[#fafafa] pr-3 pl-9 text-sm text-[#001752] outline-none transition focus:border-[#00206F]/35 focus:ring-2 focus:ring-[#00206F]/10"
          />
        </label>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="space-y-2 p-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded-2xl bg-black/5"
              />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <SolarIcon
              name="users-group-rounded"
              size={28}
              className="size-7 text-[#00206F]/40"
            />
            <p className="mt-3 text-sm font-medium text-[#001752]">
              No people yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {role === "tutor"
                ? "Students on your tracks will appear here."
                : "Tutors assigned to your track will appear here."}
            </p>
          </div>
        ) : (
          <ul className="space-y-1">
            {rows.map((row) => {
              const active =
                (row.kind === "conversation" &&
                  row.conversation.id === selectedConversationId) ||
                (row.kind === "peer" && row.peer.id === selectedPeerId)
              const unread =
                row.kind === "conversation" ? row.conversation.unread : 0
              const preview =
                row.kind === "conversation"
                  ? row.conversation.lastMessageText || "No messages yet"
                  : "Start a conversation"
              const time =
                row.kind === "conversation"
                  ? relativeTime(row.conversation.lastMessageAt)
                  : ""

              return (
                <li key={row.key}>
                  <button
                    type="button"
                    onClick={() => {
                      if (row.kind === "conversation") {
                        onSelectConversation(row.conversation)
                      } else {
                        onSelectPeer(row.peer)
                      }
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition active:scale-[0.99]",
                      active
                        ? "bg-[#00206F] text-white shadow-sm"
                        : "hover:bg-white hover:shadow-sm",
                    )}
                  >
                    <div className="relative shrink-0">
                      <Avatar size="default" className="size-10">
                        {row.peer.avatarUrl ? (
                          <AvatarImage
                            src={row.peer.avatarUrl}
                            alt={row.peer.name}
                          />
                        ) : null}
                        <AvatarFallback
                          className={cn(
                            "text-sm font-semibold",
                            active
                              ? "bg-white/15 text-white"
                              : "bg-[#00206F]/10 text-[#00206F]",
                          )}
                        >
                          {initials(row.peer.name)}
                        </AvatarFallback>
                      </Avatar>
                      {unread > 0 ? (
                        <span
                          className={cn(
                            "absolute -top-1 -right-1 inline-flex min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-semibold",
                            active
                              ? "bg-[#FB7801] text-white"
                              : "bg-[#FB7801] text-white",
                          )}
                        >
                          {unread > 99 ? "99+" : unread}
                        </span>
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p
                          className={cn(
                            "truncate text-sm font-semibold",
                            active ? "text-white" : "text-[#001752]",
                          )}
                        >
                          {row.peer.name}
                        </p>
                        {time ? (
                          <span
                            className={cn(
                              "ml-auto shrink-0 text-[10px]",
                              active ? "text-white/65" : "text-muted-foreground",
                            )}
                          >
                            {time}
                          </span>
                        ) : null}
                      </div>
                      <p
                        className={cn(
                          "mt-0.5 truncate text-xs",
                          active ? "text-white/70" : "text-muted-foreground",
                          unread > 0 && !active && "font-medium text-[#001752]",
                        )}
                      >
                        {preview}
                      </p>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </aside>
  )
}
