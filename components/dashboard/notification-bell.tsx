"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import {
  BellIcon,
  BookOpenIcon,
  ClipboardCheckIcon,
  CreditCardIcon,
  RadioIcon,
  SparklesIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type NotificationItem = {
  id: string
  type: string
  title: string
  body: string
  href: string | null
  readAt: string | null
  createdAt: string
}

function iconForType(type: string) {
  switch (type) {
    case "assignment":
    case "grade":
      return ClipboardCheckIcon
    case "live":
      return RadioIcon
    case "payment":
      return CreditCardIcon
    case "course":
      return BookOpenIcon
    default:
      return SparklesIcon
  }
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [items, setItems] = useState<NotificationItem[]>([])

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications")
      const payload = (await response.json().catch(() => ({}))) as {
        unreadCount?: number
        notifications?: NotificationItem[]
      }
      if (!response.ok) return
      setUnreadCount(payload.unreadCount || 0)
      setItems(payload.notifications || [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
    const timer = window.setInterval(() => void load(), 45000)
    return () => window.clearInterval(timer)
  }, [load])

  useEffect(() => {
    if (open) void load()
  }, [open, load])

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "read-all" }),
    })
    setItems((current) =>
      current.map((item) => ({
        ...item,
        readAt: item.readAt || new Date().toISOString(),
      })),
    )
    setUnreadCount(0)
  }

  async function markRead(id: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "read", id }),
    })
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, readAt: item.readAt || new Date().toISOString() }
          : item,
      ),
    )
    setUnreadCount((count) => Math.max(0, count - 1))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="relative size-9 rounded-lg text-[#00206F] hover:bg-[#eef2f9]"
            aria-label="Notifications"
          />
        }
      >
        <BellIcon className="size-4" />
        {unreadCount > 0 ? (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FB7801] px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[min(92vw,22rem)] overflow-hidden p-0 shadow-lg"
      >
        <div className="flex items-center justify-between border-b border-black/5 px-3.5 py-2.5">
          <p className="text-sm font-semibold text-[#001752]">Notifications</p>
          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={() => void markAllRead()}
              className="text-xs font-medium text-[#00206F] transition-colors hover:text-[#001752]"
            >
              Mark all read
            </button>
          ) : null}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <p className="px-3.5 py-8 text-center text-sm text-muted-foreground">
              Loading…
            </p>
          ) : items.length === 0 ? (
            <p className="px-3.5 py-8 text-center text-sm text-muted-foreground">
              You&apos;re all caught up.
            </p>
          ) : (
            <ul>
              {items.map((item) => {
                const Icon = iconForType(item.type)
                const unread = !item.readAt
                const content = (
                  <div
                    className={cn(
                      "flex gap-3 px-3.5 py-3 transition-colors",
                      unread ? "bg-[#fff8f1]/70" : "bg-white",
                      "hover:bg-[#f7f8fb]",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
                        unread
                          ? "bg-[#fff4ea] text-[#FB7801]"
                          : "bg-[#eef2f9] text-[#00206F]",
                      )}
                    >
                      <Icon className="size-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-[#001752]">
                          {item.title}
                        </p>
                        {unread ? (
                          <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[#FB7801]" />
                        ) : null}
                      </div>
                      {item.body ? (
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                          {item.body}
                        </p>
                      ) : null}
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {formatDistanceToNow(new Date(item.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                )

                if (item.href) {
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        onClick={() => {
                          if (unread) void markRead(item.id)
                          setOpen(false)
                        }}
                      >
                        {content}
                      </Link>
                    </li>
                  )
                }

                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      className="w-full text-left"
                      onClick={() => {
                        if (unread) void markRead(item.id)
                      }}
                    >
                      {content}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
