"use client"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type SectionCardsProps = {
  total: number
  today: number
  tracks: number
  week: number
}

export function SectionCards({
  total,
  today,
  tracks,
  week,
}: SectionCardsProps) {
  const cards = [
    {
      label: "Total registrations",
      value: total,
      hint: "All bootcamp students",
    },
    {
      label: "Registered today",
      value: today,
      hint: "Since midnight",
    },
    {
      label: "This week",
      value: week,
      hint: "Last 7 days",
    },
    {
      label: "Active tracks",
      value: tracks,
      hint: "Tracks with students",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="@container/card py-6">
          <CardHeader className="gap-3">
            <CardDescription className="text-[15px]">
              {card.label}
            </CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums tracking-tight @[250px]/card:text-4xl">
              {card.value}
            </CardTitle>
            <p className="text-[15px] text-muted-foreground">{card.hint}</p>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
