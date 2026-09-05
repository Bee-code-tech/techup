"use client"

import type { LucideIcon } from "lucide-react"
import {
  CalendarDaysIcon,
  LayersIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type StatCardItem = {
  label: string
  value: number
  icon: LucideIcon
  accent: "navy" | "orange" | "green"
  details: string[]
  tone?: "up" | "down" | "neutral"
}

type SectionCardsProps = {
  total: number
  today: number
  yesterday: number
  week: number
  month: number
  tracks: number
  topTrack: { label: string; count: number } | null
}

function deltaLabel(current: number, previous: number) {
  const diff = current - previous
  if (diff === 0) return { text: "Same as yesterday", tone: "neutral" as const }
  if (diff > 0) {
    return {
      text: `+${diff} vs yesterday`,
      tone: "up" as const,
    }
  }
  return {
    text: `${diff} vs yesterday`,
    tone: "down" as const,
  }
}

function percentOf(part: number, whole: number) {
  if (!whole) return "0%"
  return `${Math.round((part / whole) * 100)}%`
}

export function StatCards({ cards }: { cards: StatCardItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card
            key={card.label}
            className="@container/card overflow-hidden border-black/5 py-0 shadow-[0_14px_40px_-30px_rgba(0,32,111,0.35)]"
          >
            <CardHeader className="gap-3 px-5 py-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "flex size-9 items-center justify-center rounded-xl",
                      card.accent === "orange" && "bg-[#fff1e6] text-[#FB7801]",
                      card.accent === "green" && "bg-[#e8faf0] text-[#128c4a]",
                      card.accent === "navy" && "bg-[#00206F]/8 text-[#00206F]",
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <CardDescription className="text-[13px] font-medium tracking-wide text-muted-foreground uppercase">
                    {card.label}
                  </CardDescription>
                </div>
                {card.tone === "up" ? (
                  <span className="rounded-md bg-[#e8faf0] px-2 py-0.5 text-[11px] font-semibold text-[#128c4a]">
                    Up
                  </span>
                ) : null}
                {card.tone === "down" ? (
                  <span className="rounded-md bg-[#fff1eb] px-2 py-0.5 text-[11px] font-semibold text-[#b85700]">
                    Down
                  </span>
                ) : null}
              </div>
              <CardTitle className="text-3xl font-semibold tabular-nums tracking-tight text-[#001752] @[250px]/card:text-4xl">
                {card.value.toLocaleString("en-NG")}
              </CardTitle>
              <div className="space-y-1.5 pt-1">
                {card.details.map((line) => (
                  <p
                    key={line}
                    className="text-[13px] leading-snug text-muted-foreground"
                  >
                    {line}
                  </p>
                ))}
              </div>
            </CardHeader>
          </Card>
        )
      })}
    </div>
  )
}

export function SectionCards({
  total,
  today,
  yesterday,
  week,
  month,
  tracks,
  topTrack,
}: SectionCardsProps) {
  const todayDelta = deltaLabel(today, yesterday)
  const weekShare = percentOf(week, total)
  const monthShare = percentOf(month, total)
  const weekAvg = week / 7
  const topShare = topTrack ? percentOf(topTrack.count, total) : "0%"

  const cards: StatCardItem[] = [
    {
      label: "Total registrations",
      value: total,
      icon: UsersIcon,
      accent: "navy",
      details: [
        `${month} this month · ${monthShare} of all`,
        topTrack
          ? `Leading track: ${topTrack.label}`
          : "No track breakdown yet",
      ],
    },
    {
      label: "Registered today",
      value: today,
      icon: CalendarDaysIcon,
      accent: "orange",
      details: [todayDelta.text, `Yesterday closed at ${yesterday}`],
      tone: todayDelta.tone,
    },
    {
      label: "This week",
      value: week,
      icon: TrendingUpIcon,
      accent: "navy",
      details: [
        `${weekAvg.toFixed(1)} avg / day · ${weekShare} of total`,
        "Rolling last 7 days",
      ],
    },
    {
      label: "Active tracks",
      value: tracks,
      icon: LayersIcon,
      accent: "green",
      details: [
        topTrack
          ? `${topTrack.label} leads with ${topTrack.count}`
          : "Waiting for first registration",
        topTrack ? `${topShare} of all students` : "Share unavailable",
      ],
    },
  ]

  return <StatCards cards={cards} />
}
