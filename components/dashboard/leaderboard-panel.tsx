"use client"

import { SolarIcon } from "@/components/icons/solar-icon"

import { useCallback, useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type LeaderboardEntry = {
  rank: number
  userId: string
  name: string
  avatarUrl: string | null
  currentStreak: number
  quizzesPassed: number
  avgQuizScore: number
  assignmentsSubmitted: number
  points: number
  isMe: boolean
}

const PAGE_SIZE = 20

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

function PodiumCard({
  entry,
  place,
}: {
  entry: LeaderboardEntry
  place: 1 | 2 | 3
}) {
  const height =
    place === 1 ? "pt-8 pb-5" : place === 2 ? "pt-5 pb-5" : "pt-4 pb-5"
  const crown =
    place === 1
      ? "bg-[#FB7801] text-white"
      : place === 2
        ? "bg-[#00206F] text-white"
        : "bg-[#001752] text-white"

  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center rounded-2xl border px-3 text-center",
        place === 1
          ? "order-1 border-[#FB7801]/35 bg-gradient-to-b from-[#fff8f1] to-white shadow-sm sm:order-2"
          : place === 2
            ? "order-2 border-black/8 bg-white sm:order-1"
            : "order-3 border-black/8 bg-white sm:order-3",
        height,
      )}
    >
      <span
        className={cn(
          "flex size-8 items-center justify-center rounded-full text-sm font-bold",
          crown,
        )}
      >
        {place}
      </span>
      <Avatar
        className={cn(
          "mt-3 ring-2",
          place === 1
            ? "size-16 ring-[#FB7801]/40"
            : "size-12 ring-[#00206F]/15",
        )}
      >
        {entry.avatarUrl ? <AvatarImage src={entry.avatarUrl} alt="" /> : null}
        <AvatarFallback className="bg-[#eef2f9] text-sm font-semibold text-[#00206F]">
          {initials(entry.name)}
        </AvatarFallback>
      </Avatar>
      <p className="mt-3 max-w-full truncate text-sm font-semibold text-[#001752]">
        {entry.name}
        {entry.isMe ? " (you)" : ""}
      </p>
      <p className="mt-1 text-lg font-bold tabular-nums text-[#00206F]">
        {entry.points}
        <span className="ml-1 text-xs font-medium text-muted-foreground">
          pts
        </span>
      </p>
      <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
        <SolarIcon name="fire" className="size-3.5 text-[#FB7801]" />
        {entry.currentStreak}d streak
      </p>
    </div>
  )
}

export function LeaderboardPanel() {
  const [loading, setLoading] = useState(true)
  const [trackLabel, setTrackLabel] = useState<string | null>(null)
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [me, setMe] = useState<LeaderboardEntry | null>(null)
  const [page, setPage] = useState(1)
  const [pageCount, setPageCount] = useState(1)
  const [total, setTotal] = useState(0)

  const load = useCallback(async (nextPage: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(nextPage),
        pageSize: String(PAGE_SIZE),
      })
      const response = await fetch(`/api/student/leaderboard?${params}`)
      const payload = (await response.json().catch(() => ({}))) as {
        trackLabel?: string
        entries?: LeaderboardEntry[]
        me?: LeaderboardEntry | null
        page?: number
        pageCount?: number
        total?: number
      }
      if (!response.ok) return
      setTrackLabel(payload.trackLabel || null)
      setEntries(payload.entries || [])
      setMe(payload.me || null)
      setPage(payload.page || nextPage)
      setPageCount(payload.pageCount || 1)
      setTotal(payload.total || 0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load(page)
  }, [load, page])

  const topThree =
    page === 1
      ? ([1, 2, 3]
          .map((rank) => entries.find((e) => e.rank === rank))
          .filter(Boolean) as LeaderboardEntry[])
      : []
  const listEntries =
    page === 1 ? entries.filter((e) => e.rank > 3) : entries

  return (
    <div className="flex flex-col gap-5 px-4 py-6 lg:px-6 md:py-8">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.14em] text-[#FB7801] uppercase">
          Competition
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#001752]">
          Leaderboard
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Track rankings by streak, quizzes, and assignments
          {trackLabel ? ` · ${trackLabel}` : ""}.
        </p>
      </div>

      {me ? (
        <div className="relative overflow-hidden rounded-2xl border border-[#00206F]/12 bg-[#00206F] px-5 py-5 text-white sm:px-6">
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              background:
                "radial-gradient(ellipse at 100% 0%, #FB7801 0%, transparent 45%)",
            }}
          />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="flex size-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                <SolarIcon name="cup-star" className="size-5 text-[#FB7801]" />
                <span className="mt-0.5 text-lg font-bold tabular-nums">
                  #{me.rank}
                </span>
              </span>
              <div>
                <p className="text-[11px] font-semibold tracking-[0.14em] text-[#FB7801] uppercase">
                  Your rank
                </p>
                <p className="mt-1 text-xl font-semibold tracking-tight">
                  {me.points} points
                </p>
                <p className="mt-0.5 text-sm text-white/65">
                  {me.quizzesPassed} quizzes · {me.assignmentsSubmitted}{" "}
                  assignments
                </p>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 self-start rounded-xl bg-white/10 px-3.5 py-2.5 text-sm font-semibold backdrop-blur-sm">
              <SolarIcon name="fire" className="size-4 text-[#FB7801]" />
              {me.currentStreak} day streak
            </div>
          </div>
        </div>
      ) : null}

      {page === 1 && topThree.length > 0 ? (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <SolarIcon name="medal-ribbons-star" className="size-4 text-[#FB7801]" />
            <p className="text-[11px] font-semibold tracking-[0.14em] text-[#00206F]/55 uppercase">
              Top performers
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            {topThree[1] ? (
              <PodiumCard entry={topThree[1]} place={2} />
            ) : (
              <div className="hidden flex-1 sm:block" />
            )}
            {topThree[0] ? <PodiumCard entry={topThree[0]} place={1} /> : null}
            {topThree[2] ? (
              <PodiumCard entry={topThree[2]} place={3} />
            ) : (
              <div className="hidden flex-1 sm:block" />
            )}
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-black/8 bg-white">
        {loading ? (
          <p className="px-5 py-10 text-sm text-muted-foreground">Loading…</p>
        ) : entries.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <SolarIcon
              name="cup-star"
              className="mx-auto size-8 text-[#00206F]/35"
            />
            <p className="mt-3 font-medium text-[#001752]">No rankings yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Learn, pass quizzes, and submit assignments to climb.
            </p>
          </div>
        ) : listEntries.length === 0 && page === 1 ? (
          <p className="px-5 py-6 text-center text-sm text-muted-foreground">
            You&apos;re looking at the full podium — check back as more
            classmates join.
          </p>
        ) : (
          <ul className="divide-y divide-black/5">
            {listEntries.map((entry) => (
              <li
                key={entry.userId}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 sm:px-5",
                  entry.isMe && "bg-[#f4f7fc]",
                )}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold tabular-nums",
                    entry.rank <= 3
                      ? "bg-[#00206F] text-white"
                      : "bg-[#eef2f9] text-[#001752]",
                  )}
                >
                  {entry.rank}
                </span>
                <Avatar className="size-9">
                  {entry.avatarUrl ? (
                    <AvatarImage src={entry.avatarUrl} alt="" />
                  ) : null}
                  <AvatarFallback className="bg-[#eef2f9] text-xs font-semibold text-[#00206F]">
                    {initials(entry.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-[#001752]">
                    {entry.name}
                    {entry.isMe ? " (you)" : ""}
                  </p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <SolarIcon
                        name="fire"
                        className="size-3 text-[#FB7801]"
                      />
                      {entry.currentStreak} streak
                    </span>
                    <span>·</span>
                    <span>{entry.quizzesPassed} quizzes</span>
                    <span className="hidden sm:inline">·</span>
                    <span className="hidden sm:inline">
                      {entry.assignmentsSubmitted} assignments
                    </span>
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold tabular-nums text-[#001752]">
                    {entry.points}
                  </p>
                  <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                    pts
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}

        {total > 0 ? (
          <div className="flex flex-col gap-3 border-t border-black/5 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-sm text-muted-foreground">
              Page {page} of {pageCount}
              <span className="text-muted-foreground/70">
                {" "}
                · {total} student{total === 1 ? "" : "s"}
              </span>
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={loading || page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="gap-1.5"
              >
                <SolarIcon name="alt-arrow-left" className="size-4" />
                Prev
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={loading || page >= pageCount}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                className="gap-1.5"
              >
                Next
                <SolarIcon name="alt-arrow-right" className="size-4" />
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
