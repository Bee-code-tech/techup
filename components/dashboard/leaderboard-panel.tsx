"use client"

import { useCallback, useEffect, useState } from "react"
import { FlameIcon, TrophyIcon } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

export function LeaderboardPanel() {
  const [loading, setLoading] = useState(true)
  const [trackLabel, setTrackLabel] = useState<string | null>(null)
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [me, setMe] = useState<LeaderboardEntry | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/student/leaderboard")
      const payload = (await response.json().catch(() => ({}))) as {
        trackLabel?: string
        entries?: LeaderboardEntry[]
        me?: LeaderboardEntry | null
      }
      if (!response.ok) return
      setTrackLabel(payload.trackLabel || null)
      setEntries(payload.entries || [])
      setMe(payload.me || null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="flex flex-col gap-5 px-4 py-6 lg:px-6 md:py-8">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.14em] text-[#00206F]/65 uppercase">
          Competition
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#001752]">
          Leaderboard
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Ranked by streak, quizzes, and assignment completion
          {trackLabel ? ` in ${trackLabel}` : ""}.
        </p>
      </div>

      {me ? (
        <div className="rounded-2xl border border-[#FB7801]/25 bg-[#fff8f1] px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.14em] text-[#FB7801] uppercase">
                Your standing
              </p>
              <p className="mt-1 text-lg font-semibold text-[#001752]">
                #{me.rank} · {me.points} pts
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#001752]">
              <FlameIcon className="size-4 text-[#FB7801]" />
              {me.currentStreak} day streak
            </div>
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-black/8 bg-white">
        {loading ? (
          <p className="px-5 py-10 text-sm text-muted-foreground">Loading…</p>
        ) : entries.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <TrophyIcon className="mx-auto size-8 text-[#00206F]/35" />
            <p className="mt-3 font-medium text-[#001752]">No rankings yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Learn, pass quizzes, and submit assignments to climb.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-black/5">
            {entries.map((entry) => (
              <li
                key={entry.userId}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 sm:px-5",
                  entry.isMe && "bg-[#f4f7fc]",
                )}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold",
                    entry.rank === 1
                      ? "bg-[#FB7801] text-white"
                      : entry.rank <= 3
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
                  <p className="text-xs text-muted-foreground">
                    {entry.currentStreak} streak · {entry.quizzesPassed} quizzes
                    · {entry.assignmentsSubmitted} assignments
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold tabular-nums text-[#001752]">
                  {entry.points}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
