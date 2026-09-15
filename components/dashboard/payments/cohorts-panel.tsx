"use client"

import { SolarIcon } from "@/components/icons/solar-icon"

import { useState } from "react"
import toast from "react-hot-toast"
import { CohortFormModal } from "@/components/dashboard/payments/cohort-form-modal"
import type {
  CohortRow,
  TrackOption,
} from "@/components/dashboard/payments/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatNgnFromKobo } from "@/lib/cohort-pricing"

function statusTone(status: string) {
  if (status === "active") return "bg-emerald-50 text-emerald-700"
  if (status === "closed") return "bg-red-50 text-red-700"
  return "bg-[#eef2f9] text-[#00206F]"
}

export function CohortsPanel({
  cohorts,
  tracks,
  loading,
  onChanged,
}: {
  cohorts: CohortRow[]
  tracks: TrackOption[]
  loading: boolean
  onChanged: () => void
}) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<CohortRow | null>(null)

  function openCreate() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(cohort: CohortRow) {
    setEditing(cohort)
    setModalOpen(true)
  }

  async function closeCohort(cohort: CohortRow) {
    if (cohort.status === "closed") return
    if (!window.confirm(`Close cohort “${cohort.name}”?`)) return
    try {
      const response = await fetch(`/api/admin/cohorts/${cohort.id}`, {
        method: "DELETE",
      })
      const payload = (await response.json()) as { error?: string }
      if (!response.ok) {
        toast.error(payload.error || "Could not close cohort.")
        return
      }
      toast.success("Cohort closed.")
      onChanged()
    } catch {
      toast.error("Network error.")
    }
  }

  return (
    <div className="flex flex-col gap-5 px-4 lg:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-[1.35rem] font-semibold tracking-tight text-[#001752]">
            Cohorts
          </h2>
          <p className="mt-1 text-[14.5px] text-muted-foreground">
            Pricing, scholarships, and installment schedules.
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="h-11 gap-2 rounded-xl bg-[#00206F] px-4 text-white hover:bg-[#001752]"
        >
          <SolarIcon name="add-circle" className="size-4" />
          New cohort
        </Button>
      </div>

      <div className="admin-panel overflow-hidden">
        <Table>
          <TableHeader className="bg-[#f4f6fa]/90">
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-12 px-4 text-[12px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                Cohort
              </TableHead>
              <TableHead className="h-12 px-4 text-[12px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                Price
              </TableHead>
              <TableHead className="h-12 px-4 text-[12px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                Scholarship
              </TableHead>
              <TableHead className="h-12 px-4 text-[12px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                Installments
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
            {loading && cohorts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="px-4 py-10 text-center text-sm text-muted-foreground"
                >
                  Loading cohorts…
                </TableCell>
              </TableRow>
            ) : cohorts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="px-4 py-12 text-center">
                  <span className="mx-auto mb-3 flex size-11 items-center justify-center rounded-xl bg-[#00206F]/8 text-[#00206F]">
                    <SolarIcon name="users-group-rounded" className="size-5" />
                  </span>
                  <p className="text-sm font-medium text-[#001752]">
                    No cohorts yet
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Create one to start taking payments.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              cohorts.map((cohort) => (
                <TableRow key={cohort.id}>
                  <TableCell className="px-4 py-3">
                    <p className="font-medium text-[#001752]">{cohort.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {cohort.enrollmentCount} enrolled ·{" "}
                      {cohort.scholarshipCount} scholarships ·{" "}
                      {cohort.tracks.length} tracks
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-3 tabular-nums text-sm">
                    {formatNgnFromKobo(cohort.priceKobo)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm">
                    {cohort.scholarshipEnabled
                      ? `${cohort.scholarshipPercentOff}% · ${cohort.scholarshipDeadlineDays}d`
                      : "Off"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm">
                    {cohort.installmentEnabled
                      ? cohort.installmentPercents.join(" / ") + "%"
                      : "Off"}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge
                      variant="secondary"
                      className={statusTone(cohort.status)}
                    >
                      {cohort.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(cohort)}
                      >
                        <SolarIcon name="pen" className="size-3.5" />
                        Edit
                      </Button>
                      {cohort.status !== "closed" ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => void closeCohort(cohort)}
                        >
                          Close
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CohortFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        tracks={tracks}
        cohort={editing}
        onSaved={onChanged}
      />
    </div>
  )
}
