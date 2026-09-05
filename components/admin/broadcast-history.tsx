"use client"

import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  RefreshCwIcon,
  SendIcon,
} from "lucide-react"

import type { BroadcastRecord } from "@/components/admin/use-admin-dashboard"
import { bootcampTracks } from "@/lib/bootcamp"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

const PAGE_SIZE_OPTIONS = [5, 10, 25] as const

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function audienceLabel(tracks: string[]) {
  if (tracks.length === 0) return "All students"
  return tracks.map((track) => bootcampTracks[track] ?? track).join(", ")
}

export function BroadcastHistory({
  broadcasts,
  onSent,
  onReuse,
}: {
  broadcasts: BroadcastRecord[]
  onSent?: () => void
  onReuse?: (broadcast: BroadcastRecord) => void
}) {
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] =
    useState<(typeof PAGE_SIZE_OPTIONS)[number]>(10)

  const pageCount = Math.max(1, Math.ceil(broadcasts.length / pageSize))

  useEffect(() => {
    setPage(1)
  }, [pageSize, broadcasts.length])

  useEffect(() => {
    if (page > pageCount) setPage(pageCount)
  }, [page, pageCount])

  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize
    return broadcasts.slice(start, start + pageSize)
  }, [broadcasts, page, pageSize])

  const rangeStart = broadcasts.length === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, broadcasts.length)

  async function sendRemaining(item: BroadcastRecord) {
    if (!item.campaignKey) {
      toast.error("This older broadcast has no campaign key.")
      return
    }
    if (item.remaining <= 0) {
      toast.error("Everyone in this audience already received this campaign.")
      return
    }

    setPendingId(item.id)
    try {
      const response = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignKey: item.campaignKey,
          subject: item.subject,
          heading: item.heading,
          message: item.body,
          ctaLabel: item.ctaLabel || undefined,
          ctaUrl: item.ctaUrl || undefined,
          tracks: item.tracks.length > 0 ? item.tracks : undefined,
          skipAlreadySent: true,
        }),
      })
      const payload = (await response.json()) as {
        error?: string
        sent?: number
        skipped?: number
      }

      if (!response.ok) {
        toast.error(payload.error || "Could not send remaining emails.")
        return
      }

      toast.success(
        `Sent to ${payload.sent ?? 0} remaining student(s)${
          payload.skipped ? ` · ${payload.skipped} skipped` : ""
        }.`,
      )
      onSent?.()
    } catch {
      toast.error("Network error while sending remaining emails.")
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-black/5 bg-card shadow-[0_18px_50px_-36px_rgba(0,32,111,0.35)]">
      <div className="flex flex-col gap-3 border-b border-black/5 bg-linear-to-r from-[#00206F]/4 to-transparent px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.16em] text-[#00206F] uppercase">
            Campaign history
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-[#001752]">
            Sent emails
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {broadcasts.length === 0
              ? "No emails sent yet."
              : `Showing ${rangeStart}-${rangeEnd} of ${broadcasts.length} campaigns`}
          </p>
        </div>
      </div>

      <Table>
        <TableHeader className="bg-muted/70">
          <TableRow className="hover:bg-transparent">
            <TableHead className="h-12 px-4 text-[13px] font-semibold tracking-wide text-muted-foreground uppercase">
              Campaign
            </TableHead>
            <TableHead className="h-12 px-4 text-[13px] font-semibold tracking-wide text-muted-foreground uppercase">
              Audience
            </TableHead>
            <TableHead className="h-12 px-4 text-[13px] font-semibold tracking-wide text-muted-foreground uppercase">
              This run
            </TableHead>
            <TableHead className="h-12 px-4 text-[13px] font-semibold tracking-wide text-muted-foreground uppercase">
              Received
            </TableHead>
            <TableHead className="h-12 px-4 text-[13px] font-semibold tracking-wide text-muted-foreground uppercase">
              Remaining
            </TableHead>
            <TableHead className="h-12 px-4 text-[13px] font-semibold tracking-wide text-muted-foreground uppercase">
              Sent
            </TableHead>
            <TableHead className="h-12 px-4 text-right text-[13px] font-semibold tracking-wide text-muted-foreground uppercase">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageRows.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={7}
                className="h-28 text-center text-[15px] text-muted-foreground"
              >
                No campaign history yet.
              </TableCell>
            </TableRow>
          ) : (
            pageRows.map((item) => {
              const canSendRemaining =
                Boolean(item.campaignKey) && item.remaining > 0

              return (
                <TableRow key={item.id} className="hover:bg-muted/40">
                  <TableCell className="max-w-64 px-4 py-4">
                    <div className="min-w-0 space-y-1.5">
                      <p className="truncate text-[15px] font-medium text-[#001752]">
                        {item.subject}
                      </p>
                      {item.campaignKey ? (
                        <span className="inline-flex max-w-full truncate rounded-full bg-[#00206F]/8 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-[#00206F]">
                          {item.campaignKey}
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-black/5 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                          Legacy send
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-44 px-4 py-4 text-[13px] whitespace-normal text-muted-foreground">
                    {audienceLabel(item.tracks)}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-[15px] tabular-nums text-[#001752]">
                    {item.recipientCount}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-[15px] tabular-nums text-[#001752]">
                    {item.alreadyReceived}
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums",
                        item.remaining > 0
                          ? "bg-[#fff6ef] text-[#b85700]"
                          : "bg-black/5 text-muted-foreground",
                      )}
                    >
                      {item.remaining}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-4 text-[13px] whitespace-nowrap text-muted-foreground">
                    {formatDate(item.createdAt)}
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-lg px-2.5 text-xs"
                        onClick={() => onReuse?.(item)}
                      >
                        <RefreshCwIcon className="size-3.5" />
                        <span className="hidden lg:inline">Load</span>
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        className="h-8 rounded-lg bg-[#00206F] px-2.5 text-xs text-white hover:bg-[#001752]"
                        disabled={!canSendRemaining || pendingId === item.id}
                        onClick={() => void sendRemaining(item)}
                      >
                        <SendIcon className="size-3.5" />
                        <span className="hidden lg:inline">
                          {pendingId === item.id
                            ? "Sending..."
                            : `Remaining (${item.remaining})`}
                        </span>
                        <span className="lg:hidden">
                          {pendingId === item.id ? "..." : item.remaining}
                        </span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>

      <div className="flex flex-col gap-3 border-t border-black/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Rows per page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              if (value == null) return
              setPageSize(Number(value) as (typeof PAGE_SIZE_OPTIONS)[number])
            }}
            items={Object.fromEntries(
              PAGE_SIZE_OPTIONS.map((size) => [String(size), String(size)]),
            )}
          >
            <SelectTrigger
              size="sm"
              className="h-8 w-[4.5rem] rounded-lg"
              aria-label="Rows per page"
            >
              <SelectValue>
                {(value) => (value != null ? String(value) : "10")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent align="start">
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <p className="text-sm tabular-nums text-muted-foreground">
            Page {page} of {pageCount}
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 px-2.5"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ChevronLeftIcon className="size-4" />
              <span className="sr-only sm:not-sr-only sm:ml-1">Prev</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 px-2.5"
              disabled={page >= pageCount}
              onClick={() =>
                setPage((current) => Math.min(pageCount, current + 1))
              }
            >
              <span className="sr-only sm:not-sr-only sm:mr-1">Next</span>
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
