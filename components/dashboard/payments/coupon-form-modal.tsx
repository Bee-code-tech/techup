"use client"

import { useEffect, useId, useState } from "react"
import { createPortal } from "react-dom"
import { format } from "date-fns"
import toast from "react-hot-toast"

import { SolarIcon } from "@/components/icons/solar-icon"
import type { CohortRow } from "@/components/dashboard/payments/types"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

const inputClass =
  "h-10 rounded-lg border border-black/10 bg-transparent px-3 text-sm text-[#001752] shadow-none transition-[border-color,box-shadow] duration-150 ease-out placeholder:text-muted-foreground/70 focus-visible:border-[#00206F]/40 focus-visible:ring-2 focus-visible:ring-[#00206F]/12"

const primaryBtnClass =
  "h-10 rounded-lg bg-[#00206F] text-sm font-medium text-white transition-transform duration-150 ease-out hover:bg-[#001752] active:scale-[0.98]"

const ghostBtnClass =
  "h-10 rounded-lg border border-black/10 bg-transparent text-sm font-medium text-[#001752] transition-transform duration-150 ease-out hover:bg-black/[0.03] active:scale-[0.98]"

export function CouponFormModal({
  open,
  onClose,
  cohorts,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  cohorts: CohortRow[]
  onSaved: () => void
}) {
  const titleId = useId()
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const [saving, setSaving] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [code, setCode] = useState("")
  const [percentOff, setPercentOff] = useState("10")
  const [cohortId, setCohortId] = useState("")
  const [maxUses, setMaxUses] = useState("")
  const [expiresAt, setExpiresAt] = useState<Date | undefined>()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) {
      setVisible(false)
      return
    }
    setCode("")
    setPercentOff("10")
    setCohortId("")
    setMaxUses("")
    setExpiresAt(undefined)
    setCalendarOpen(false)
    const frame = requestAnimationFrame(() => setVisible(true))
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      cancelAnimationFrame(frame)
      document.body.style.overflow = prev
    }
  }, [open])

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (code.trim().length < 2) {
      toast.error("Enter a coupon code.")
      return
    }
    const pct = Number(percentOff)
    if (!Number.isFinite(pct) || pct < 1 || pct > 100) {
      toast.error("Percent off must be between 1 and 100.")
      return
    }
    setSaving(true)
    try {
      const response = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          percentOff: pct,
          cohortId: cohortId || null,
          maxUses: maxUses ? Number(maxUses) : null,
          expiresAt: expiresAt ? expiresAt.toISOString() : null,
        }),
      })
      const payload = (await response.json()) as { error?: string }
      if (!response.ok) {
        toast.error(payload.error || "Could not create coupon.")
        return
      }
      toast.success("Coupon created.")
      onSaved()
      onClose()
    } catch {
      toast.error("Network error.")
    } finally {
      setSaving(false)
    }
  }

  if (!mounted || !open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close overlay"
        className={cn(
          "absolute inset-0 bg-[#001028]/50 backdrop-blur-[4px] transition-opacity duration-200 ease-out",
          visible ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "relative z-10 flex max-h-[min(94dvh,640px)] w-full max-w-[420px] flex-col overflow-hidden rounded-t-2xl border border-black/10 bg-[#fafafa] shadow-[0_28px_80px_-28px_rgba(0,16,40,0.55)] transition-[opacity,transform] duration-200 ease-out sm:rounded-2xl",
          visible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-3 scale-[0.985] opacity-0",
        )}
      >
        <div className="flex items-center justify-between border-b border-black/6 px-5 py-3.5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-full bg-[#fff1e6] text-[#FB7801]">
              <SolarIcon name="tag-price" className="size-4" />
            </span>
            <div>
              <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                Coupons
              </p>
              <h2
                id={titleId}
                className="text-sm font-semibold tracking-tight text-[#001752]"
              >
                New coupon
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-150 hover:bg-black/4 hover:text-[#001752] active:scale-[0.96]"
          >
            <SolarIcon name="close-circle" className="size-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => void submit(e)}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="coupon-code">Code</FieldLabel>
                <Input
                  id="coupon-code"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="EARLYBIRD"
                  className={cn(inputClass, "font-mono tracking-wide")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="coupon-pct">Percent off</FieldLabel>
                <Input
                  id="coupon-pct"
                  required
                  type="number"
                  min={1}
                  max={100}
                  value={percentOff}
                  onChange={(e) => setPercentOff(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field>
                <FieldLabel>Applies to</FieldLabel>
                <Select
                  value={cohortId || "all"}
                  onValueChange={(value) => {
                    if (value == null) return
                    setCohortId(value === "all" ? "" : String(value))
                  }}
                  modal={false}
                  items={[
                    { value: "all", label: "All cohorts" },
                    ...cohorts.map((c) => ({ value: c.id, label: c.name })),
                  ]}
                >
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder="All cohorts" />
                  </SelectTrigger>
                  <SelectContent align="start" alignItemWithTrigger={false}>
                    <SelectItem value="all">All cohorts</SelectItem>
                    {cohorts.map((cohort) => (
                      <SelectItem key={cohort.id} value={cohort.id}>
                        {cohort.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="coupon-uses">
                  Max uses (optional)
                </FieldLabel>
                <Input
                  id="coupon-uses"
                  type="number"
                  min={1}
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  placeholder="Unlimited"
                  className={inputClass}
                />
              </Field>
              <Field>
                <FieldLabel>Expiry date (optional)</FieldLabel>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          inputClass,
                          "justify-between font-normal",
                          !expiresAt && "text-muted-foreground",
                        )}
                      />
                    }
                  >
                    <span className="inline-flex items-center gap-2">
                      <SolarIcon name="calendar" className="size-4" />
                      {expiresAt
                        ? format(expiresAt, "EEE, MMM d, yyyy")
                        : "No expiry"}
                    </span>
                    {expiresAt ? (
                      <span
                        role="button"
                        tabIndex={0}
                        className="rounded-md p-0.5 text-muted-foreground hover:text-[#001752]"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setExpiresAt(undefined)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            e.stopPropagation()
                            setExpiresAt(undefined)
                          }
                        }}
                      >
                        <SolarIcon name="close-circle" className="size-4" />
                      </span>
                    ) : null}
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    className="w-(--anchor-width) min-w-72 overflow-hidden p-0"
                  >
                    <Calendar
                      mode="single"
                      selected={expiresAt}
                      className="w-full [--cell-size:2.5rem]"
                      classNames={{ root: "w-full" }}
                      onSelect={(day) => {
                        setExpiresAt(day)
                        setCalendarOpen(false)
                      }}
                      disabled={{ before: new Date() }}
                    />
                  </PopoverContent>
                </Popover>
              </Field>
            </FieldGroup>
          </div>

          <div className="flex items-center gap-2 border-t border-black/6 bg-white/80 px-5 py-4 backdrop-blur-sm sm:px-6">
            <Button
              type="button"
              variant="ghost"
              className={cn(ghostBtnClass, "flex-1")}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className={cn(primaryBtnClass, "flex-[1.4]")}
            >
              {saving ? "Creating…" : "Create coupon"}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}
