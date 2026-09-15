"use client"

import { useEffect, useId, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import toast from "react-hot-toast"

import { SolarIcon } from "@/components/icons/solar-icon"
import type {
  CohortRow,
  TrackOption,
} from "@/components/dashboard/payments/types"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  StepProgress,
  type StepProgressItem,
} from "@/components/ui/step-progress"
import { Textarea } from "@/components/ui/textarea"
import {
  amountAfterPercentOff,
  formatNgnFromKobo,
  koboToNaira,
  nairaToKobo,
  splitInstallmentAmounts,
  validateInstallmentPercents,
} from "@/lib/cohort-pricing"
import { cn } from "@/lib/utils"

const STEPS: StepProgressItem[] = [
  { id: 1, label: "Basics", icon: "notebook" },
  { id: 2, label: "Scholarship", icon: "square-academic-cap" },
  { id: 3, label: "Installments", icon: "calendar-mark" },
  { id: 4, label: "Review", icon: "checklist" },
]

const REMINDER_OPTIONS = [
  { days: 7, label: "7 days before" },
  { days: 3, label: "3 days before" },
  { days: 1, label: "1 day before" },
  { days: 0, label: "On due date" },
]

const PRESETS: { id: string; label: string; hint: string; percents: number[] }[] =
  [
    {
      id: "2equal",
      label: "2 payments",
      hint: "50% · 50%",
      percents: [50, 50],
    },
    {
      id: "3front",
      label: "3 payments",
      hint: "40% · 30% · 30%",
      percents: [40, 30, 30],
    },
    {
      id: "3equal",
      label: "3 equal",
      hint: "34% · 33% · 33%",
      percents: [34, 33, 33],
    },
    {
      id: "4equal",
      label: "4 payments",
      hint: "25% each",
      percents: [25, 25, 25, 25],
    },
  ]

const inputClass =
  "h-10 rounded-lg border border-black/10 bg-transparent px-3 text-sm text-[#001752] shadow-none transition-[border-color,box-shadow] duration-150 ease-out placeholder:text-muted-foreground/70 focus-visible:border-[#00206F]/40 focus-visible:ring-2 focus-visible:ring-[#00206F]/12"

const primaryBtnClass =
  "h-10 rounded-lg bg-[#00206F] text-sm font-medium text-white transition-transform duration-150 ease-out hover:bg-[#001752] active:scale-[0.98]"

const ghostBtnClass =
  "h-10 rounded-lg border border-black/10 bg-transparent text-sm font-medium text-[#001752] transition-transform duration-150 ease-out hover:bg-black/[0.03] active:scale-[0.98]"

type FormState = {
  name: string
  description: string
  priceNaira: string
  tracks: string[]
  status: "draft" | "active"
  scholarshipEnabled: boolean
  scholarshipPercentOff: string
  scholarshipConsentText: string
  scholarshipDeadlineDays: string
  installmentEnabled: boolean
  installmentPercents: number[]
  installmentReminderDays: number[]
  installmentOverdueRemoveDays: string
  installmentIntervalDays: string
}

function emptyForm(tracks: TrackOption[]): FormState {
  return {
    name: "",
    description: "",
    priceNaira: "",
    tracks: tracks.map((t) => t.id),
    status: "draft",
    scholarshipEnabled: true,
    scholarshipPercentOff: "70",
    scholarshipConsentText: "",
    scholarshipDeadlineDays: "14",
    installmentEnabled: true,
    installmentPercents: [40, 30, 30],
    installmentReminderDays: [3, 1],
    installmentOverdueRemoveDays: "3",
    installmentIntervalDays: "30",
  }
}

function formFromCohort(cohort: CohortRow): FormState {
  return {
    name: cohort.name,
    description: cohort.description,
    priceNaira: String(koboToNaira(cohort.priceKobo)),
    tracks: [...cohort.tracks],
    status: cohort.status === "active" ? "active" : "draft",
    scholarshipEnabled: cohort.scholarshipEnabled,
    scholarshipPercentOff: String(cohort.scholarshipPercentOff),
    scholarshipConsentText: cohort.scholarshipConsentText || "",
    scholarshipDeadlineDays: String(cohort.scholarshipDeadlineDays),
    installmentEnabled: cohort.installmentEnabled,
    installmentPercents:
      cohort.installmentPercents.length >= 2
        ? [...cohort.installmentPercents]
        : [40, 30, 30],
    installmentReminderDays:
      cohort.installmentReminderDays.length > 0
        ? [...cohort.installmentReminderDays]
        : [3, 1],
    installmentOverdueRemoveDays: String(cohort.installmentOverdueRemoveDays),
    installmentIntervalDays: String(cohort.installmentIntervalDays),
  }
}

function copyForStep(step: number, editing: boolean) {
  if (step === 1) {
    return {
      title: editing ? "Edit cohort basics" : "Name this cohort",
      description: "Set the fee, status, and which tracks can enroll.",
    }
  }
  if (step === 2) {
    return {
      title: "Scholarship rules",
      description:
        "Students get this discount automatically. They pay only the remnant.",
    }
  }
  if (step === 3) {
    return {
      title: "Installment plan",
      description:
        "Same schedule for everyone — choose the split, spacing, and reminders.",
    }
  }
  return {
    title: "Review & save",
    description: "Confirm the rules students will see at checkout.",
  }
}

function FormItem({
  index,
  children,
  className,
}: {
  index: number
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn("cohort-item", className)}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {children}
    </div>
  )
}

function RuleCard({
  icon,
  title,
  children,
  enabled,
  onEnabledChange,
}: {
  icon: string
  title: string
  children?: React.ReactNode
  enabled: boolean
  onEnabledChange: (value: boolean) => void
}) {
  return (
    <div className="rounded-xl border border-black/8 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#00206F]/8 text-[#00206F]">
            <SolarIcon name={icon} className="size-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-[#001752]">{title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {enabled ? "Enabled for this cohort" : "Turned off"}
            </p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => onEnabledChange(!enabled)}
          className={cn(
            "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-150 ease-out",
            enabled ? "bg-[#00206F]" : "bg-black/15",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform duration-150 ease-out",
              enabled && "translate-x-5",
            )}
          />
        </button>
      </div>
      {enabled ? <div className="mt-4 space-y-4">{children}</div> : null}
    </div>
  )
}

export function CohortFormModal({
  open,
  onClose,
  tracks,
  cohort,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  tracks: TrackOption[]
  cohort: CohortRow | null
  onSaved: () => void
}) {
  const titleId = useId()
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [step, setStep] = useState(1)
  const [stepDirection, setStepDirection] = useState<"forward" | "back">(
    "forward",
  )
  const [form, setForm] = useState<FormState>(() => emptyForm(tracks))

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) {
      setVisible(false)
      return
    }
    setForm(cohort ? formFromCohort(cohort) : emptyForm(tracks))
    setStep(1)
    setStepDirection("forward")
    const frame = requestAnimationFrame(() => setVisible(true))
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      cancelAnimationFrame(frame)
      document.body.style.overflow = prev
    }
  }, [open, cohort, tracks])

  const priceKobo = useMemo(() => {
    const naira = Number(form.priceNaira)
    return Number.isFinite(naira) && naira > 0 ? nairaToKobo(naira) : 0
  }, [form.priceNaira])

  const scholarshipPct = Math.min(
    100,
    Math.max(0, Number(form.scholarshipPercentOff) || 0),
  )
  const remnantKobo = form.scholarshipEnabled
    ? amountAfterPercentOff(priceKobo, scholarshipPct)
    : priceKobo

  const installmentCheck = validateInstallmentPercents(form.installmentPercents)
  const installmentPreview = useMemo(() => {
    if (!form.installmentEnabled || !installmentCheck.ok || priceKobo <= 0) {
      return null
    }
    try {
      return splitInstallmentAmounts(priceKobo, form.installmentPercents)
    } catch {
      return null
    }
  }, [form.installmentEnabled, form.installmentPercents, installmentCheck.ok, priceKobo])

  const activePreset = PRESETS.find(
    (p) =>
      p.percents.length === form.installmentPercents.length &&
      p.percents.every((v, i) => v === form.installmentPercents[i]),
  )

  const copy = copyForStep(step, Boolean(cohort))

  function toggleTrack(id: string) {
    setForm((prev) => {
      const has = prev.tracks.includes(id)
      return {
        ...prev,
        tracks: has
          ? prev.tracks.filter((t) => t !== id)
          : [...prev.tracks, id],
      }
    })
  }

  function toggleReminder(days: number) {
    setForm((prev) => {
      const has = prev.installmentReminderDays.includes(days)
      return {
        ...prev,
        installmentReminderDays: has
          ? prev.installmentReminderDays.filter((d) => d !== days)
          : [...prev.installmentReminderDays, days].sort((a, b) => b - a),
      }
    })
  }

  function setPercentAt(index: number, value: string) {
    const next = Number(value)
    setForm((prev) => {
      const percents = [...prev.installmentPercents]
      percents[index] = Number.isFinite(next) ? next : 0
      return { ...prev, installmentPercents: percents }
    })
  }

  function validateStep(current: number) {
    if (current === 1) {
      if (form.name.trim().length < 2) return "Enter a cohort name."
      const price = Number(form.priceNaira)
      if (!Number.isFinite(price) || price <= 0) {
        return "Enter a valid price in Naira."
      }
      if (form.tracks.length === 0) return "Pick at least one track."
    }
    if (current === 2 && form.scholarshipEnabled) {
      const pct = Number(form.scholarshipPercentOff)
      if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
        return "Scholarship percent must be between 0 and 100."
      }
      const days = Number(form.scholarshipDeadlineDays)
      if (!Number.isFinite(days) || days < 1) {
        return "Deadline must be at least 1 day."
      }
    }
    if (current === 3 && form.installmentEnabled) {
      const check = validateInstallmentPercents(form.installmentPercents)
      if (!check.ok) return check.error
      const interval = Number(form.installmentIntervalDays)
      if (!Number.isFinite(interval) || interval < 1) {
        return "Days between payments must be at least 1."
      }
      const overdue = Number(form.installmentOverdueRemoveDays)
      if (!Number.isFinite(overdue) || overdue < 1) {
        return "Overdue remove days must be at least 1."
      }
    }
    return null
  }

  function goNext() {
    const error = validateStep(step)
    if (error) {
      toast.error(error)
      return
    }
    setStepDirection("forward")
    setStep((prev) => Math.min(prev + 1, STEPS.length))
  }

  function goBack() {
    setStepDirection("back")
    setStep((prev) => Math.max(prev - 1, 1))
  }

  async function save() {
    const error =
      validateStep(1) || validateStep(2) || validateStep(3)
    if (error) {
      toast.error(error)
      return
    }
    setSaving(true)
    try {
      const body = {
        name: form.name.trim(),
        description: form.description.trim(),
        priceNaira: Number(form.priceNaira),
        tracks: form.tracks,
        status: form.status,
        scholarshipEnabled: form.scholarshipEnabled,
        scholarshipPercentOff: Number(form.scholarshipPercentOff) || 0,
        scholarshipConsentText: form.scholarshipConsentText,
        scholarshipDeadlineDays: Number(form.scholarshipDeadlineDays) || 14,
        installmentEnabled: form.installmentEnabled,
        installmentPercents: form.installmentPercents,
        installmentReminderDays: form.installmentReminderDays,
        installmentOverdueRemoveDays:
          Number(form.installmentOverdueRemoveDays) || 3,
        installmentIntervalDays: Number(form.installmentIntervalDays) || 30,
      }
      const response = await fetch(
        cohort ? `/api/admin/cohorts/${cohort.id}` : "/api/admin/cohorts",
        {
          method: cohort ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      )
      const payload = (await response.json()) as { error?: string }
      if (!response.ok) {
        toast.error(payload.error || "Could not save cohort.")
        return
      }
      toast.success(cohort ? "Cohort updated." : "Cohort created.")
      onSaved()
      onClose()
    } catch {
      toast.error("Network error.")
    } finally {
      setSaving(false)
    }
  }

  if (!mounted || !open) return null

  const trackLabels = tracks
    .filter((t) => form.tracks.includes(t.id))
    .map((t) => t.label)

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
          "relative z-10 flex max-h-[min(94dvh,860px)] w-full max-w-[480px] flex-col overflow-hidden rounded-t-2xl border border-black/10 bg-[#fafafa] shadow-[0_28px_80px_-28px_rgba(0,16,40,0.55)] transition-[opacity,transform] duration-200 ease-out sm:rounded-2xl",
          visible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-3 scale-[0.985] opacity-0",
        )}
      >
        <div className="flex items-center justify-between border-b border-black/6 px-5 py-3.5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-full bg-[#00206F]/8 text-[#00206F]">
              <SolarIcon name="users-group-rounded" className="size-4" />
            </span>
            <div>
              <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                Payments
              </p>
              <h2 className="text-sm font-semibold tracking-tight text-[#001752]">
                {cohort ? "Edit cohort" : "Create cohort"}
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

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          <StepProgress step={step} steps={STEPS} />

          <h3
            id={titleId}
            key={`title-${step}`}
            className={cn(
              "cohort-item text-xl font-semibold tracking-tight text-[#001752]",
              stepDirection === "forward"
                ? "cohort-step-forward"
                : "cohort-step-back",
            )}
          >
            {copy.title}
          </h3>
          <p
            key={`desc-${step}`}
            className={cn(
              "cohort-item mt-1.5 text-sm text-muted-foreground",
              stepDirection === "forward"
                ? "cohort-step-forward"
                : "cohort-step-back",
            )}
            style={{ animationDelay: "35ms" }}
          >
            {copy.description}
          </p>

          <div
            key={`body-${step}`}
            className={cn(
              "mt-6",
              stepDirection === "forward"
                ? "cohort-step-forward"
                : "cohort-step-back",
            )}
          >
            {step === 1 ? (
              <FieldGroup>
                <FormItem index={0}>
                  <Field>
                    <FieldLabel htmlFor="cohort-name">Cohort name</FieldLabel>
                    <Input
                      id="cohort-name"
                      value={form.name}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="October 2026 Cohort"
                      className={inputClass}
                    />
                  </Field>
                </FormItem>
                <FormItem index={1}>
                  <Field>
                    <FieldLabel htmlFor="cohort-desc">
                      Description (optional)
                    </FieldLabel>
                    <Textarea
                      id="cohort-desc"
                      value={form.description}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      rows={3}
                      placeholder="Shown to students at checkout"
                      className={cn(
                        inputClass,
                        "h-auto min-h-[84px] resize-none py-2.5",
                      )}
                    />
                  </Field>
                </FormItem>
                <FormItem index={2} className="grid gap-5 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="cohort-price">Full price (₦)</FieldLabel>
                    <Input
                      id="cohort-price"
                      type="number"
                      min={1}
                      value={form.priceNaira}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          priceNaira: e.target.value,
                        }))
                      }
                      placeholder="150000"
                      className={inputClass}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Status</FieldLabel>
                    <Select
                      value={form.status}
                      onValueChange={(value) => {
                        if (value === "draft" || value === "active") {
                          setForm((prev) => ({ ...prev, status: value }))
                        }
                      }}
                      modal={false}
                      items={[
                        { value: "draft", label: "Draft (hidden)" },
                        { value: "active", label: "Active (live)" },
                      ]}
                    >
                      <SelectTrigger className={inputClass}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent
                        align="start"
                        alignItemWithTrigger={false}
                      >
                        <SelectItem value="draft">Draft (hidden)</SelectItem>
                        <SelectItem value="active">Active (live)</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </FormItem>
                <FormItem index={3}>
                  <Field>
                    <FieldLabel>Tracks included</FieldLabel>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {tracks.map((track) => {
                        const selected = form.tracks.includes(track.id)
                        return (
                          <button
                            key={track.id}
                            type="button"
                            onClick={() => toggleTrack(track.id)}
                            className={cn(
                              "rounded-lg border px-3 py-1.5 text-sm font-medium transition-[border-color,background-color,transform] duration-150 ease-out active:scale-[0.97]",
                              selected
                                ? "border-[#00206F] bg-[#00206F] text-white"
                                : "border-black/10 bg-white text-[#001752] hover:border-[#00206F]/25",
                            )}
                          >
                            {track.label}
                          </button>
                        )
                      })}
                    </div>
                  </Field>
                </FormItem>
              </FieldGroup>
            ) : null}

            {step === 2 ? (
              <RuleCard
                icon="square-academic-cap"
                title="Offer scholarships"
                enabled={form.scholarshipEnabled}
                onEnabledChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    scholarshipEnabled: value,
                  }))
                }
              >
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Auto-approve applicants for this discount. They unlock paid
                  access after paying the remnant by the deadline.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="sch-pct">Discount %</FieldLabel>
                    <Input
                      id="sch-pct"
                      type="number"
                      min={0}
                      max={100}
                      value={form.scholarshipPercentOff}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          scholarshipPercentOff: e.target.value,
                        }))
                      }
                      className={inputClass}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="sch-deadline">
                      Days to pay remnant
                    </FieldLabel>
                    <Input
                      id="sch-deadline"
                      type="number"
                      min={1}
                      value={form.scholarshipDeadlineDays}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          scholarshipDeadlineDays: e.target.value,
                        }))
                      }
                      className={inputClass}
                    />
                  </Field>
                </div>
                {priceKobo > 0 ? (
                  <div className="rounded-xl border border-black/6 bg-[#f7f8fb] px-3.5 py-3">
                    <p className="text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                      Student sees
                    </p>
                    <div className="mt-1.5 flex items-baseline gap-2">
                      <span className="text-sm text-muted-foreground line-through">
                        {formatNgnFromKobo(priceKobo)}
                      </span>
                      <span className="text-lg font-semibold tabular-nums text-[#001752]">
                        {formatNgnFromKobo(remnantKobo)}
                      </span>
                      <span className="text-xs text-[#FB7801]">
                        {scholarshipPct}% off
                      </span>
                    </div>
                  </div>
                ) : null}
                <Field>
                  <FieldLabel htmlFor="sch-consent">
                    Consent copy (optional)
                  </FieldLabel>
                  <Textarea
                    id="sch-consent"
                    value={form.scholarshipConsentText}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        scholarshipConsentText: e.target.value,
                      }))
                    }
                    rows={3}
                    placeholder="Shown on the scholarship apply form before submit"
                    className={cn(
                      inputClass,
                      "h-auto min-h-[84px] resize-none py-2.5",
                    )}
                  />
                </Field>
              </RuleCard>
            ) : null}

            {step === 3 ? (
              <div className="space-y-4">
                <RuleCard
                  icon="calendar-mark"
                  title="Allow installments"
                  enabled={form.installmentEnabled}
                  onEnabledChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      installmentEnabled: value,
                    }))
                  }
                >
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Whole cohort uses one schedule. First payment is due at
                    checkout; later parts are spaced by the interval below.
                  </p>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Payment split
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {PRESETS.map((preset) => {
                        const active = activePreset?.id === preset.id
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                installmentPercents: [...preset.percents],
                              }))
                            }
                            className={cn(
                              "rounded-xl border px-3 py-2.5 text-left transition-[border-color,background-color,box-shadow,transform] duration-150 ease-out active:scale-[0.98]",
                              active
                                ? "border-[#00206F] bg-[#00206F] text-white shadow-[0_0_0_3px_rgba(0,32,111,0.12)]"
                                : "border-black/10 bg-[#f7f8fb] text-[#001752] hover:border-[#00206F]/25",
                            )}
                          >
                            <p className="text-sm font-semibold">
                              {preset.label}
                            </p>
                            <p
                              className={cn(
                                "mt-0.5 text-xs",
                                active
                                  ? "text-white/75"
                                  : "text-muted-foreground",
                              )}
                            >
                              {preset.hint}
                            </p>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Fine-tune percents
                      <span
                        className={cn(
                          "ml-2 font-semibold",
                          installmentCheck.ok
                            ? "text-emerald-600"
                            : "text-[#b85700]",
                        )}
                      >
                        {form.installmentPercents.reduce((a, b) => a + b, 0)}
                        /100
                      </span>
                    </p>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {form.installmentPercents.map((percent, index) => (
                        <div
                          key={`part-${index}`}
                          className="flex items-center gap-2 rounded-lg border border-black/8 bg-[#f7f8fb] px-2.5 py-2"
                        >
                          <span className="w-14 shrink-0 text-xs font-medium text-muted-foreground">
                            Part {index + 1}
                          </span>
                          <Input
                            type="number"
                            min={1}
                            max={99}
                            value={percent}
                            onChange={(e) =>
                              setPercentAt(index, e.target.value)
                            }
                            className={cn(inputClass, "h-9 bg-white")}
                          />
                          <span className="text-xs text-muted-foreground">%</span>
                        </div>
                      ))}
                    </div>
                    {!installmentCheck.ok ? (
                      <p className="mt-2 text-xs text-[#b85700]">
                        {installmentCheck.error}
                      </p>
                    ) : null}
                  </div>

                  {installmentPreview ? (
                    <div className="rounded-xl border border-black/6 bg-[#f7f8fb] px-3.5 py-3">
                      <p className="text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                        Example schedule
                      </p>
                      <ul className="mt-2 space-y-1.5">
                        {installmentPreview.map((amount, index) => (
                          <li
                            key={`ex-${index}`}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-muted-foreground">
                              {index === 0
                                ? "Due at checkout"
                                : `Due after ${index * Number(form.installmentIntervalDays || 30)} days`}
                            </span>
                            <span className="font-semibold tabular-nums text-[#001752]">
                              {formatNgnFromKobo(amount)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="inst-interval">
                        Days between payments
                      </FieldLabel>
                      <Input
                        id="inst-interval"
                        type="number"
                        min={1}
                        value={form.installmentIntervalDays}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            installmentIntervalDays: e.target.value,
                          }))
                        }
                        className={inputClass}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="inst-overdue">
                        Remove access after overdue
                      </FieldLabel>
                      <Input
                        id="inst-overdue"
                        type="number"
                        min={1}
                        value={form.installmentOverdueRemoveDays}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            installmentOverdueRemoveDays: e.target.value,
                          }))
                        }
                        className={inputClass}
                      />
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Days past due before access returns to free
                      </p>
                    </Field>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Email reminders
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {REMINDER_OPTIONS.map((option) => {
                        const selected =
                          form.installmentReminderDays.includes(option.days)
                        return (
                          <button
                            key={option.days}
                            type="button"
                            onClick={() => toggleReminder(option.days)}
                            className={cn(
                              "rounded-lg border px-3 py-1.5 text-sm font-medium transition-[border-color,background-color,transform] duration-150 ease-out active:scale-[0.97]",
                              selected
                                ? "border-[#00206F] bg-[#00206F] text-white"
                                : "border-black/10 bg-white text-[#001752] hover:border-[#00206F]/25",
                            )}
                          >
                            {option.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </RuleCard>
              </div>
            ) : null}

            {step === 4 ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-black/8 bg-white p-4">
                  <p className="text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                    Cohort
                  </p>
                  <p className="mt-1 text-base font-semibold text-[#001752]">
                    {form.name || "Untitled"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {priceKobo
                      ? formatNgnFromKobo(priceKobo)
                      : "No price"}{" "}
                    · {form.status === "active" ? "Active" : "Draft"}
                  </p>
                  <p className="mt-2 text-sm text-[#001752]/80">
                    {trackLabels.length
                      ? trackLabels.join(" · ")
                      : "No tracks selected"}
                  </p>
                </div>

                <div className="rounded-xl border border-black/8 bg-white p-4">
                  <div className="flex items-center gap-2">
                    <SolarIcon
                      name="square-academic-cap"
                      className="size-4 text-[#00206F]"
                    />
                    <p className="text-sm font-semibold text-[#001752]">
                      Scholarship
                    </p>
                  </div>
                  {form.scholarshipEnabled ? (
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <li>
                        {scholarshipPct}% off → remnant{" "}
                        <span className="font-medium text-[#001752]">
                          {priceKobo
                            ? formatNgnFromKobo(remnantKobo)
                            : "—"}
                        </span>
                      </li>
                      <li>
                        Pay within {form.scholarshipDeadlineDays} days or lose
                        award
                      </li>
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Disabled for this cohort
                    </p>
                  )}
                </div>

                <div className="rounded-xl border border-black/8 bg-white p-4">
                  <div className="flex items-center gap-2">
                    <SolarIcon
                      name="calendar-mark"
                      className="size-4 text-[#00206F]"
                    />
                    <p className="text-sm font-semibold text-[#001752]">
                      Installments
                    </p>
                  </div>
                  {form.installmentEnabled ? (
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <li>
                        Split {form.installmentPercents.join(" / ")}% every{" "}
                        {form.installmentIntervalDays} days
                      </li>
                      <li>
                        Reminders:{" "}
                        {form.installmentReminderDays.length
                          ? form.installmentReminderDays
                              .map((d) =>
                                d === 0 ? "on due date" : `${d}d before`,
                              )
                              .join(", ")
                          : "none"}
                      </li>
                      <li>
                        Revoke after {form.installmentOverdueRemoveDays} days
                        overdue
                      </li>
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Full payment only
                    </p>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-black/6 bg-white/80 px-5 py-4 backdrop-blur-sm sm:px-6">
          {step > 1 ? (
            <Button
              type="button"
              variant="ghost"
              className={cn(ghostBtnClass, "flex-1")}
              onClick={goBack}
            >
              <SolarIcon name="alt-arrow-left" className="size-4" />
              Back
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              className={cn(ghostBtnClass, "flex-1")}
              onClick={onClose}
            >
              Cancel
            </Button>
          )}
          {step < STEPS.length ? (
            <Button
              type="button"
              className={cn(primaryBtnClass, "flex-[1.4] gap-1.5")}
              onClick={goNext}
            >
              Continue
              <SolarIcon
                name="alt-arrow-right"
                className="size-4 text-white"
              />
            </Button>
          ) : (
            <Button
              type="button"
              disabled={saving}
              className={cn(primaryBtnClass, "flex-[1.4]")}
              onClick={() => void save()}
            >
              {saving
                ? "Saving…"
                : cohort
                  ? "Save changes"
                  : "Create cohort"}
            </Button>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes cohort-item-in {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes cohort-step-forward {
          from {
            opacity: 0;
            transform: translateX(12px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes cohort-step-back {
          from {
            opacity: 0;
            transform: translateX(-12px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .cohort-item {
          animation: cohort-item-in 260ms cubic-bezier(0.23, 1, 0.32, 1) both;
        }
        .cohort-step-forward {
          animation: cohort-step-forward 280ms cubic-bezier(0.23, 1, 0.32, 1)
            both;
        }
        .cohort-step-back {
          animation: cohort-step-back 280ms cubic-bezier(0.23, 1, 0.32, 1) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .cohort-item,
          .cohort-step-forward,
          .cohort-step-back {
            animation: none;
          }
        }
      `}</style>
    </div>,
    document.body,
  )
}
