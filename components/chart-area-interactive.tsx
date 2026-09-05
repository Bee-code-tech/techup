"use client"

import { useMemo, useState } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"
import { TrendingUpIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

const chartConfig = {
  count: {
    label: "Registrations",
    color: "#00206F",
  },
} satisfies ChartConfig

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const

type DayPoint = {
  date: string
  count: number
}

type WeekOption = {
  week: number
  startDay: number
  endDay: number
  label: string
}

function dateKeyInLagos(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", {
    timeZone: "Africa/Lagos",
  })
}

function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate()
}

function formatDay(year: number, monthIndex: number, day: number) {
  return new Date(year, monthIndex, day).toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
  })
}

function buildWeekOptions(year: number, monthIndex: number): WeekOption[] {
  const totalDays = daysInMonth(year, monthIndex)
  const weekCount = Math.ceil(totalDays / 7)
  const options: WeekOption[] = []

  for (let week = 1; week <= weekCount; week += 1) {
    const startDay = (week - 1) * 7 + 1
    const endDay = Math.min(week * 7, totalDays)
    options.push({
      week,
      startDay,
      endDay,
      label: `Week ${week} · ${formatDay(year, monthIndex, startDay)} – ${formatDay(year, monthIndex, endDay)}`,
    })
  }

  return options
}

function currentPartsInLagos(date = new Date()) {
  const key = date.toLocaleDateString("en-CA", { timeZone: "Africa/Lagos" })
  const [year, month, day] = key.split("-").map(Number)
  return {
    year,
    monthIndex: month - 1,
    week: Math.min(Math.ceil(day / 7), 5),
  }
}

function buildWeekDaySeries(
  registrations: Array<{ createdAt: string }>,
  year: number,
  monthIndex: number,
  week: number,
): DayPoint[] {
  const prefix = `${year}-${String(monthIndex + 1).padStart(2, "0")}`
  const totals = new Map<string, number>()

  for (const row of registrations) {
    const key = dateKeyInLagos(row.createdAt)
    if (!key.startsWith(prefix)) continue
    totals.set(key, (totals.get(key) ?? 0) + 1)
  }

  const startDay = (week - 1) * 7 + 1
  const endDay = Math.min(week * 7, daysInMonth(year, monthIndex))
  const series: DayPoint[] = []

  for (let day = startDay; day <= endDay; day += 1) {
    const date = `${prefix}-${String(day).padStart(2, "0")}`
    series.push({ date, count: totals.get(date) ?? 0 })
  }

  return series
}

export function ChartAreaInteractive({
  registrations,
}: {
  registrations: Array<{ createdAt: string }>
}) {
  const now = useMemo(() => new Date(), [])
  const initial = useMemo(() => currentPartsInLagos(now), [now])
  const [year, setYear] = useState(initial.year)
  const [month, setMonth] = useState(initial.monthIndex)
  const [week, setWeek] = useState(initial.week)

  const years = useMemo(() => {
    const set = new Set<number>([now.getFullYear()])
    for (const row of registrations) {
      const key = dateKeyInLagos(row.createdAt)
      const y = Number(key.slice(0, 4))
      if (!Number.isNaN(y)) set.add(y)
    }
    return Array.from(set).sort((a, b) => b - a)
  }, [now, registrations])

  const weekOptions = useMemo(
    () => buildWeekOptions(year, month),
    [month, year],
  )

  const selectedWeek =
    weekOptions.find((option) => option.week === week) ?? weekOptions[0]

  const data = useMemo(
    () =>
      buildWeekDaySeries(
        registrations,
        year,
        month,
        selectedWeek?.week ?? 1,
      ),
    [month, registrations, selectedWeek?.week, year],
  )

  const summary = useMemo(() => {
    const total = data.reduce((sum, day) => sum + day.count, 0)
    const activeDays = data.filter((day) => day.count > 0).length
    const peak = data.reduce(
      (best, day) => (day.count > best.count ? day : best),
      data[0] ?? { date: "", count: 0 },
    )
    const average = data.length ? total / data.length : 0
    const yMax = Math.max(peak.count, 1)
    return { total, activeDays, peak, average, yMax }
  }, [data])

  const peakLabel = summary.peak.date
    ? new Date(`${summary.peak.date}T12:00:00`).toLocaleDateString("en-NG", {
        weekday: "short",
        day: "numeric",
      })
    : "—"

  const yAxisWidth = summary.yMax >= 100 ? 44 : summary.yMax >= 10 ? 36 : 28

  const rangeLabel = selectedWeek
    ? `${formatDay(year, month, selectedWeek.startDay)} – ${formatDay(year, month, selectedWeek.endDay)}`
    : ""

  function handleMonthChange(nextMonth: number) {
    setMonth(nextMonth)
    const options = buildWeekOptions(year, nextMonth)
    setWeek((current) =>
      options.some((option) => option.week === current)
        ? current
        : (options.at(-1)?.week ?? 1),
    )
  }

  function handleYearChange(nextYear: number) {
    setYear(nextYear)
    const options = buildWeekOptions(nextYear, month)
    setWeek((current) =>
      options.some((option) => option.week === current)
        ? current
        : (options.at(-1)?.week ?? 1),
    )
  }

  return (
    <Card className="@container/card overflow-hidden border border-black/5 bg-linear-to-b from-white to-[#f6f8fc] py-0 shadow-[0_18px_50px_-36px_rgba(0,32,111,0.35)] ring-1 ring-foreground/10">
      <CardHeader className="gap-4 border-b border-black/4 px-5 pt-5 pb-4 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-md bg-[#00206F]/6 px-2.5 py-1 text-[11px] font-semibold tracking-[0.14em] text-[#00206F] uppercase">
              <TrendingUpIcon className="size-3.5" />
              Momentum
            </div>
            <CardTitle className="text-xl font-semibold tracking-tight text-[#001752]">
              Registration pace
            </CardTitle>
            <CardDescription className="text-[14px] text-muted-foreground">
              Daily signups for {rangeLabel}, {year}
            </CardDescription>
          </div>

          <div className="flex flex-col items-stretch gap-3 sm:items-end">
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={String(selectedWeek?.week ?? 1)}
                onValueChange={(value) => {
                  if (value != null) setWeek(Number(value))
                }}
                items={Object.fromEntries(
                  weekOptions.map((option) => [
                    String(option.week),
                    option.label,
                  ]),
                )}
              >
                <SelectTrigger
                  aria-label="Week"
                  size="sm"
                  className="h-8 min-w-[11rem] rounded-full border-black/8 bg-white px-3.5 text-[13px] font-medium text-[#001752] shadow-none sm:min-w-[15rem]"
                >
                  <SelectValue>
                    {(value) =>
                      weekOptions.find(
                        (option) => String(option.week) === String(value),
                      )?.label ?? "Select week"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent align="end" className="min-w-[15rem]">
                  {weekOptions.map((option) => (
                    <SelectItem key={option.week} value={String(option.week)}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={String(month)}
                onValueChange={(value) => {
                  if (value != null) handleMonthChange(Number(value))
                }}
                items={Object.fromEntries(
                  MONTHS.map((label, index) => [String(index), label]),
                )}
              >
                <SelectTrigger
                  aria-label="Month"
                  size="sm"
                  className="h-8 rounded-full border-black/8 bg-white px-3.5 text-[13px] font-medium text-[#001752] shadow-none"
                >
                  <SelectValue>
                    {(value) => MONTHS[Number(value)] ?? "Select month"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent align="end">
                  {MONTHS.map((label, index) => (
                    <SelectItem key={label} value={String(index)}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={String(year)}
                onValueChange={(value) => {
                  if (value != null) handleYearChange(Number(value))
                }}
                items={Object.fromEntries(
                  years.map((value) => [String(value), String(value)]),
                )}
              >
                <SelectTrigger
                  aria-label="Year"
                  size="sm"
                  className="h-8 rounded-full border-black/8 bg-white px-3.5 text-[13px] font-medium text-[#001752] shadow-none"
                >
                  <SelectValue>
                    {(value) => (value != null ? String(value) : "Select year")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent align="end">
                  {years.map((value) => (
                    <SelectItem key={value} value={String(value)}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-black/6 bg-white px-2.5 py-1 text-[12px] text-[#001752]">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold tabular-nums">
                  {summary.total}
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-black/6 bg-white px-2.5 py-1 text-[12px] text-[#001752]">
                <span className="text-muted-foreground">Avg/day</span>
                <span className="font-semibold tabular-nums">
                  {summary.average.toFixed(1)}
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FB7801]/25 bg-[#fff6ef] px-2.5 py-1 text-[12px] text-[#b85700]">
                <span className="opacity-80">Peak</span>
                <span className="font-semibold tabular-nums">
                  {summary.peak.count}
                </span>
                <span className="opacity-70">{peakLabel}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-black/6 bg-white px-2.5 py-1 text-[12px] text-[#001752]">
                <span className="text-muted-foreground">Active days</span>
                <span className="font-semibold tabular-nums">
                  {summary.activeDays}/{data.length}
                </span>
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-3 pt-4 pb-5 sm:px-5 sm:pt-5">
        <ChartContainer
          config={chartConfig}
          className={cn("aspect-auto h-75 w-full")}
        >
          <AreaChart
            data={data}
            margin={{ top: 12, right: 12, left: 4, bottom: 0 }}
          >
            <defs>
              <linearGradient id="fillCountPremium" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00206F" stopOpacity={0.28} />
                <stop offset="55%" stopColor="#00206F" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#FB7801" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient
                id="strokeCountPremium"
                x1="0"
                y1="0"
                x2="1"
                y2="0"
              >
                <stop offset="0%" stopColor="#00206F" />
                <stop offset="100%" stopColor="#FB7801" />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              strokeDasharray="4 8"
              stroke="rgba(0,32,111,0.08)"
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              minTickGap={18}
              tick={{ fill: "#5b6475", fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(`${value}T12:00:00`)
                return date.toLocaleDateString("en-NG", {
                  weekday: "short",
                  day: "numeric",
                })
              }}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              width={yAxisWidth}
              tickMargin={10}
              domain={[0, (max: number) => Math.max(Math.ceil(max * 1.1), 1)]}
              tick={{ fill: "#5b6475", fontSize: 12 }}
              tickFormatter={(value) => String(value)}
            />
            <ChartTooltip
              cursor={{
                stroke: "rgba(0,32,111,0.18)",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
              content={
                <ChartTooltipContent
                  className="rounded-xl border-0 shadow-lg"
                  labelFormatter={(value) =>
                    new Date(`${value}T12:00:00`).toLocaleDateString("en-NG", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="count"
              type="monotone"
              fill="url(#fillCountPremium)"
              stroke="url(#strokeCountPremium)"
              strokeWidth={2.5}
              activeDot={{
                r: 5,
                fill: "#FB7801",
                stroke: "#fff",
                strokeWidth: 2,
              }}
              dot={{
                r: 3.5,
                fill: "#00206F",
                stroke: "#fff",
                strokeWidth: 1.5,
              }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
