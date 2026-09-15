"use client"

import { useState } from "react"
import toast from "react-hot-toast"

import { SolarIcon } from "@/components/icons/solar-icon"
import { CouponFormModal } from "@/components/dashboard/payments/coupon-form-modal"
import type {
  CohortRow,
  CouponRow,
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

function formatDate(value: string | null) {
  if (!value) return "—"
  return new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(
    new Date(value),
  )
}

export function CouponsPanel({
  coupons,
  cohorts,
  loading,
  onChanged,
}: {
  coupons: CouponRow[]
  cohorts: CohortRow[]
  loading: boolean
  onChanged: () => void
}) {
  const [modalOpen, setModalOpen] = useState(false)

  async function deactivate(coupon: CouponRow) {
    try {
      const response = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: false }),
      })
      const payload = (await response.json()) as { error?: string }
      if (!response.ok) {
        toast.error(payload.error || "Could not deactivate coupon.")
        return
      }
      toast.success("Coupon deactivated.")
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
            Coupons
          </h2>
          <p className="mt-1 text-[14.5px] text-muted-foreground">
            Percent-off codes, optionally scoped to a cohort.
          </p>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          className="h-11 gap-2 rounded-xl bg-[#00206F] px-4 text-white hover:bg-[#001752]"
        >
          <SolarIcon name="add-circle" className="size-4" />
          New coupon
        </Button>
      </div>

      <div className="admin-panel overflow-hidden">
        <Table>
          <TableHeader className="bg-[#f4f6fa]/90">
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-12 px-4 text-[12px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                Code
              </TableHead>
              <TableHead className="h-12 px-4 text-[12px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                Off
              </TableHead>
              <TableHead className="h-12 px-4 text-[12px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                Cohort
              </TableHead>
              <TableHead className="h-12 px-4 text-[12px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                Uses
              </TableHead>
              <TableHead className="h-12 px-4 text-[12px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                Expires
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
            {loading && coupons.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="px-4 py-10 text-center text-sm text-muted-foreground"
                >
                  Loading coupons…
                </TableCell>
              </TableRow>
            ) : coupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="px-4 py-12 text-center">
                  <span className="mx-auto mb-3 flex size-11 items-center justify-center rounded-xl bg-[#fff1e6] text-[#FB7801]">
                    <SolarIcon name="tag-price" className="size-5" />
                  </span>
                  <p className="text-sm font-medium text-[#001752]">
                    No coupons yet
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Create a code to offer checkout discounts.
                  </p>
                  <Button
                    type="button"
                    className="mt-4 h-10 gap-2 rounded-lg bg-[#00206F] text-white hover:bg-[#001752]"
                    onClick={() => setModalOpen(true)}
                  >
                    <SolarIcon name="add-circle" className="size-4" />
                    New coupon
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="px-4 py-3 font-mono text-sm font-semibold text-[#001752]">
                    {coupon.code}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm">
                    {coupon.percentOff}%
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm">
                    {coupon.cohortName || "All cohorts"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm tabular-nums">
                    {coupon.usedCount}
                    {coupon.maxUses != null ? ` / ${coupon.maxUses}` : ""}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm">
                    {formatDate(coupon.expiresAt)}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge
                      variant="secondary"
                      className={
                        coupon.isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-700"
                      }
                    >
                      {coupon.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    {coupon.isActive ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => void deactivate(coupon)}
                      >
                        Deactivate
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

      <CouponFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        cohorts={cohorts}
        onSaved={onChanged}
      />
    </div>
  )
}
