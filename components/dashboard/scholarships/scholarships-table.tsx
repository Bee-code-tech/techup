"use client"

import { SolarIcon } from "@/components/icons/solar-icon"

import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { formatNgnFromKobo } from "@/lib/cohort-pricing"
import { bootcampTracks } from "@/lib/bootcamp"

export type ScholarshipRow = {
  id: string
  cohortId: string
  cohortName: string
  userId: string | null
  fullName: string
  email: string
  ageRange: string
  gender: string
  whatsapp: string
  country: string
  education: string
  referralSource: string
  track: string
  laptop: string
  internet: string
  dailyHours: string
  onlineBefore: string
  careerGoals: string
  consentAccepted: boolean
  status: string
  percentOff: number
  amountDueKobo: number
  payDeadline: string | null
  revokedAt: string | null
  createdAt: string
  hasAccount: boolean
}

function statusTone(status: string) {
  if (status === "awarded") return "bg-[#eef2f9] text-[#00206F]"
  if (status === "paid") return "bg-emerald-50 text-emerald-700"
  if (status === "revoked") return "bg-red-50 text-red-700"
  if (status === "expired") return "bg-[#fff1e6] text-[#9a4d00]"
  return "bg-[#f4f6fa] text-muted-foreground"
}

function formatDate(value: string | null) {
  if (!value) return "—"
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
  }).format(new Date(value))
}

export function ScholarshipsTable({
  rows,
  page,
  pageSize,
  pageCount,
  total,
  query,
  status,
  loading,
  onQueryChange,
  onStatusChange,
  onPageChange,
  onChanged,
}: {
  rows: ScholarshipRow[]
  page: number
  pageSize: number
  pageCount: number
  total: number
  query: string
  status: string
  loading: boolean
  onQueryChange: (value: string) => void
  onStatusChange: (value: string) => void
  onPageChange: (page: number) => void
  onChanged: () => void
}) {
  const [revokingId, setRevokingId] = useState<string | null>(null)
  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, total)

  async function revoke(row: ScholarshipRow) {
    if (row.status !== "awarded") return
    if (!window.confirm(`Revoke scholarship for ${row.fullName}?`)) return
    setRevokingId(row.id)
    try {
      const response = await fetch(
        `/api/admin/scholarships/${row.id}/revoke`,
        { method: "POST" },
      )
      const payload = (await response.json()) as {
        error?: string
        already?: boolean
      }
      if (!response.ok) {
        toast.error(payload.error || "Could not revoke scholarship.")
        return
      }
      toast.success(
        payload.already ? "Already revoked." : "Scholarship revoked.",
      )
      onChanged()
    } catch {
      toast.error("Network error.")
    } finally {
      setRevokingId(null)
    }
  }

  useEffect(() => {
    if (page > pageCount) onPageChange(pageCount)
  }, [page, pageCount, onPageChange])

  return (
    <div className="flex flex-col gap-5 px-4 lg:px-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-[1.35rem] font-semibold tracking-tight text-[#001752]">
            Applications
          </h2>
          <p className="mt-1 text-[14.5px] text-muted-foreground">
            {total} match · showing {rangeStart}-{rangeEnd}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:flex-1">
          <SolarIcon name="magnifer" className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search name, email, or WhatsApp"
            className="h-11 rounded-xl border-black/[0.06] bg-[#f4f6fa] px-3.5 pl-10 text-[15px] shadow-none focus-visible:border-[#00206F]/30 focus-visible:bg-white focus-visible:ring-3 focus-visible:ring-[#00206F]/10 md:text-[15px]"
          />
        </div>
        <Select
          value={status || "all"}
          onValueChange={(value) => {
            if (value == null) return
            onStatusChange(value === "all" ? "" : String(value))
          }}
          modal={false}
          items={[
            { value: "all", label: "All statuses" },
            { value: "awarded", label: "Awarded" },
            { value: "paid", label: "Paid" },
            { value: "revoked", label: "Revoked" },
            { value: "expired", label: "Expired" },
          ]}
        >
          <SelectTrigger className="h-11 w-full rounded-xl border-black/[0.06] bg-[#f4f6fa] px-3.5 text-[15px] shadow-none sm:w-48 data-[size=default]:h-11">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent align="end" alignItemWithTrigger={false}>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="awarded">Awarded</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="revoked">Revoked</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="admin-panel overflow-hidden">
        <Table>
          <TableHeader className="bg-[#f4f6fa]/90">
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-12 px-4 text-[12px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                Applicant
              </TableHead>
              <TableHead className="h-12 px-4 text-[12px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                Cohort
              </TableHead>
              <TableHead className="h-12 px-4 text-[12px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                Track
              </TableHead>
              <TableHead className="h-12 px-4 text-[12px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                Due
              </TableHead>
              <TableHead className="h-12 px-4 text-[12px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                Deadline
              </TableHead>
              <TableHead className="h-12 px-4 text-[12px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                Status
              </TableHead>
              <TableHead className="h-12 px-4 text-right text-[12px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="px-4 py-10 text-center text-sm text-muted-foreground"
                >
                  Loading scholarships…
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="px-4 py-12 text-center">
                  <span className="mx-auto mb-3 flex size-11 items-center justify-center rounded-xl bg-[#00206F]/8 text-[#00206F]">
                    <SolarIcon name="square-academic-cap" className="size-5" />
                  </span>
                  <p className="text-sm font-medium text-[#001752]">
                    No applications found
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Try another search or status filter.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="px-4 py-3">
                    <p className="font-medium text-[#001752]">{row.fullName}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {row.email}
                      {row.hasAccount ? " · has account" : ""}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm">
                    {row.cohortName}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm">
                    {bootcampTracks[row.track] || row.track}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm tabular-nums">
                    <span className="font-medium">
                      {formatNgnFromKobo(row.amountDueKobo)}
                    </span>
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({row.percentOff}% off)
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm">
                    {formatDate(row.payDeadline)}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge
                      variant="secondary"
                      className={statusTone(row.status)}
                    >
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    {row.status === "awarded" ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={revokingId === row.id}
                        onClick={() => void revoke(row)}
                      >
                        {revokingId === row.id ? "Revoking…" : "Revoke"}
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Page {page} of {pageCount}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <SolarIcon name="alt-arrow-left" className="size-4" />
            Prev
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= pageCount}
            onClick={() => onPageChange(page + 1)}
          >
            Next
            <SolarIcon name="alt-arrow-right" className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
