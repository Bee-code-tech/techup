"use client"

import { useMemo } from "react"
import {
  MailIcon,
  MegaphoneIcon,
  SendIcon,
  UsersIcon,
} from "lucide-react"

import type {
  BroadcastRecord,
  Registration,
} from "@/components/admin/use-admin-dashboard"
import { StatCards, type StatCardItem } from "@/components/section-cards"

function dateKeyInLagos(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", {
    timeZone: "Africa/Lagos",
  })
}

function percentOf(part: number, whole: number) {
  if (!whole) return "0%"
  return `${Math.round((part / whole) * 100)}%`
}

export function BroadcastStatCards({
  broadcasts,
  registrations,
}: {
  broadcasts: BroadcastRecord[]
  registrations: Registration[]
}) {
  const cards = useMemo(() => {
    const todayKey = dateKeyInLagos(new Date().toISOString())
    const monthPrefix = todayKey.slice(0, 7)

    const emailsDelivered = broadcasts.reduce(
      (sum, item) => sum + item.recipientCount,
      0,
    )
    const sentToday = broadcasts.filter(
      (item) => dateKeyInLagos(item.createdAt) === todayKey,
    ).length
    const sentThisMonth = broadcasts.filter((item) =>
      dateKeyInLagos(item.createdAt).startsWith(monthPrefix),
    ).length
    const last = broadcasts[0]
    const avgRecipients =
      broadcasts.length > 0 ? emailsDelivered / broadcasts.length : 0
    const largest = broadcasts.reduce(
      (best, item) =>
        item.recipientCount > best.recipientCount ? item : best,
      broadcasts[0] ?? { id: "", subject: "", recipientCount: 0, createdAt: "" },
    )

    const items: StatCardItem[] = [
      {
        label: "Broadcasts sent",
        value: broadcasts.length,
        icon: MegaphoneIcon,
        accent: "navy",
        details: [
          `${sentThisMonth} this month`,
          last
            ? `Latest: ${last.subject}`
            : "No broadcasts yet",
        ],
      },
      {
        label: "Emails delivered",
        value: emailsDelivered,
        icon: SendIcon,
        accent: "orange",
        details: [
          `${avgRecipients.toFixed(1)} avg recipients / send`,
          largest.recipientCount > 0
            ? `Largest send: ${largest.recipientCount}`
            : "Waiting for first send",
        ],
      },
      {
        label: "Sent today",
        value: sentToday,
        icon: MailIcon,
        accent: "green",
        details: [
          `${sentThisMonth} in ${new Date().toLocaleDateString("en-NG", { month: "long" })}`,
          last
            ? `${last.recipientCount} on last send`
            : "Compose a message to get started",
        ],
      },
      {
        label: "Audience size",
        value: registrations.length,
        icon: UsersIcon,
        accent: "navy",
        details: [
          "Students available for broadcast",
          emailsDelivered > 0
            ? `${percentOf(emailsDelivered, registrations.length || 1)} cumulative reach vs roster`
            : "No delivery history yet",
        ],
      },
    ]

    return items
  }, [broadcasts, registrations])

  return <StatCards cards={cards} />
}
