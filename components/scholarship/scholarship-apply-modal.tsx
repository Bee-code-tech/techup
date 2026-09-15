"use client"

import { useEffect, useId, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import toast from "react-hot-toast"

import { SolarIcon } from "@/components/icons/solar-icon"
import { Select } from "@/components/marketing/Select"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  StepProgress,
  type StepProgressItem,
} from "@/components/ui/step-progress"
import { Textarea } from "@/components/ui/textarea"
import {
  amountAfterPercentOff,
  formatNgnFromKobo,
} from "@/lib/cohort-pricing"
import { cn } from "@/lib/utils"

type OptionItem = { value: string; label: string }

type CohortOption = {
  id: string
  name: string
  description: string
  priceKobo: number
  tracks: string[]
  trackOptions: { id: string; label: string }[]
  scholarshipPercentOff: number
  scholarshipConsentText: string | null
  scholarshipDeadlineDays: number
}

type OptionsPayload = {
  options: {
    ageRanges: OptionItem[]
    genders: OptionItem[]
    countries: string[]
    educationLevels: OptionItem[]
    referralSources: OptionItem[]
    dailyHours: OptionItem[]
    yesNo: OptionItem[]
  }
  tracks: { id: string; label: string }[]
  cohorts: CohortOption[]
}

type FormState = {
  cohortId: string
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
}

const emptyForm: FormState = {
  cohortId: "",
  fullName: "",
  email: "",
  ageRange: "",
  gender: "",
  whatsapp: "",
  country: "",
  education: "",
  referralSource: "",
  track: "",
  laptop: "",
  internet: "",
  dailyHours: "",
  onlineBefore: "",
  careerGoals: "",
  consentAccepted: false,
}

const APPLY_STEPS: StepProgressItem[] = [
  { id: 1, label: "About", icon: "user" },
  { id: 2, label: "Background", icon: "notebook" },
  { id: 3, label: "Readiness", icon: "laptop" },
  { id: 4, label: "Consent", icon: "verified-check" },
]

const inputClass =
  "h-10 rounded-lg border border-black/10 bg-transparent px-3 text-sm text-[#001752] shadow-none transition-[border-color,box-shadow] duration-150 ease-out placeholder:text-muted-foreground/70 focus-visible:border-[#00206F]/40 focus-visible:ring-2 focus-visible:ring-[#00206F]/12 md:text-sm"

const selectClass =
  "h-10 rounded-lg border border-black/10 bg-transparent px-3 text-sm text-[#001752] shadow-none transition-[border-color,box-shadow] duration-150 ease-out focus-visible:border-[#00206F]/40 focus-visible:ring-2 focus-visible:ring-[#00206F]/12"

const primaryBtnClass =
  "h-10 rounded-lg bg-[#00206F] text-sm font-medium text-white transition-transform duration-150 ease-out hover:bg-[#001752] active:scale-[0.98]"

const ghostBtnClass =
  "h-10 rounded-lg border border-black/10 bg-transparent text-sm font-medium text-[#001752] transition-transform duration-150 ease-out hover:bg-black/[0.03] active:scale-[0.98]"

function copyForStep(step: number) {
  if (step === 1) {
    return {
      title: "Tell us about you",
      description: "We’ll use this to confirm your scholarship award.",
    }
  }
  if (step === 2) {
    return {
      title: "Your background",
      description: "Pick a cohort and how you found TechUp.",
    }
  }
  if (step === 3) {
    return {
      title: "Learning readiness",
      description: "A quick check that you’re set up to succeed.",
    }
  }
  return {
    title: "Confirm & apply",
    description: "Review the commitment, then submit for instant award.",
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
      className={cn("scholarship-item", className)}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {children}
    </div>
  )
}

export function ScholarshipApplyModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const titleId = useId()
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(1)
  const [stepDirection, setStepDirection] = useState<"forward" | "back">(
    "forward",
  )
  const [loadingOptions, setLoadingOptions] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [options, setOptions] = useState<OptionsPayload | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [done, setDone] = useState<{
    hasAccount: boolean
    amountDueKobo: number
    percentOff: number
  } | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) {
      setVisible(false)
      return
    }
    setStep(1)
    setStepDirection("forward")
    setDone(null)
    setForm(emptyForm)
    const frame = requestAnimationFrame(() => setVisible(true))
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"

    void (async () => {
      setLoadingOptions(true)
      try {
        const response = await fetch("/api/scholarship/options")
        const payload = (await response.json()) as OptionsPayload & {
          error?: string
        }
        if (!response.ok) {
          toast.error(payload.error || "Could not load scholarship options.")
          return
        }
        setOptions(payload)
        if (payload.cohorts[0]) {
          setForm((prev) => ({
            ...prev,
            cohortId: payload.cohorts[0].id,
          }))
        }
      } catch {
        toast.error("Network error loading options.")
      } finally {
        setLoadingOptions(false)
      }
    })()

    return () => {
      cancelAnimationFrame(frame)
      document.body.style.overflow = prev
    }
  }, [open])

  const selectedCohort = useMemo(
    () => options?.cohorts.find((c) => c.id === form.cohortId) ?? null,
    [form.cohortId, options],
  )

  const trackOptions = useMemo(() => {
    const rows = selectedCohort?.trackOptions || options?.tracks || []
    return rows.map((t) => ({ value: t.id, label: t.label }))
  }, [options?.tracks, selectedCohort])

  const copy = copyForStep(step)

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function validateStep(current: number) {
    if (current === 1) {
      if (form.fullName.trim().length < 2) return "Enter your full name."
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        return "Enter a valid email."
      }
      if (!form.ageRange) return "Select your age range."
      if (!form.gender) return "Select your gender."
      if (form.whatsapp.trim().length < 7) return "Enter a valid WhatsApp number."
      if (!form.country) return "Select your country."
    }
    if (current === 2) {
      if (!form.cohortId) return "Select a cohort."
      if (!form.education) return "Select your education level."
      if (!form.referralSource) return "Tell us how you heard about us."
      if (!form.track) return "Select a track."
    }
    if (current === 3) {
      if (!form.laptop) return "Indicate laptop access."
      if (!form.internet) return "Indicate internet access."
      if (!form.dailyHours) return "Select daily study hours."
      if (!form.onlineBefore) return "Indicate prior online learning."
      if (form.careerGoals.trim().length < 10) {
        return "Tell us a bit more about your career goals."
      }
    }
    if (current === 4) {
      if (!form.consentAccepted) {
        return "Accept the scholarship consent to continue."
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
    setStep((prev) => Math.min(prev + 1, APPLY_STEPS.length))
  }

  function goBack() {
    setStepDirection("back")
    setStep((prev) => Math.max(prev - 1, 1))
  }

  async function submit() {
    const error = validateStep(4)
    if (error) {
      toast.error(error)
      return
    }
    setSubmitting(true)
    try {
      const response = await fetch("/api/scholarship/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          email: form.email.trim().toLowerCase(),
          fullName: form.fullName.trim(),
          whatsapp: form.whatsapp.trim(),
          careerGoals: form.careerGoals.trim(),
        }),
      })
      const payload = (await response.json()) as {
        error?: string
        hasAccount?: boolean
        amountDueKobo?: number
        percentOff?: number
      }
      if (!response.ok) {
        toast.error(payload.error || "Could not submit application.")
        return
      }
      setDone({
        hasAccount: Boolean(payload.hasAccount),
        amountDueKobo: Number(payload.amountDueKobo) || 0,
        percentOff: Number(payload.percentOff) || 0,
      })
      toast.success("Scholarship awarded — check your email.")
    } catch {
      toast.error("Network error.")
    } finally {
      setSubmitting(false)
    }
  }

  if (!mounted || !open) return null

  const discounted = selectedCohort
    ? amountAfterPercentOff(
        selectedCohort.priceKobo,
        selectedCohort.scholarshipPercentOff,
      )
    : 0

  return createPortal(
    <div className="fixed inset-0 z-60 flex items-end justify-center p-0 sm:items-center sm:p-4">
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
          "relative z-10 flex max-h-[min(94dvh,820px)] w-full max-w-[440px] flex-col overflow-hidden rounded-t-2xl border border-black/10 bg-[#fafafa] shadow-[0_28px_80px_-28px_rgba(0,16,40,0.55)] transition-[opacity,transform] duration-200 ease-out sm:rounded-2xl",
          visible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-3 scale-[0.985] opacity-0",
        )}
      >
        <div className="flex items-center justify-between border-b border-black/6 px-5 py-3.5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-full bg-[#00206F]/8 text-[#00206F]">
              <SolarIcon name="square-academic-cap" className="size-4" />
            </span>
            <p className="text-sm font-semibold tracking-tight text-[#001752]">
              TechUp Scholarship
            </p>
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

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-6 sm:py-7">
          {loadingOptions ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <SolarIcon
                name="refresh-circle"
                className="size-8 animate-spin text-[#00206F]" />
              <p className="text-sm text-muted-foreground">Loading form…</p>
            </div>
          ) : done ? (
            <div className="flex flex-col items-center text-center">
              <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-[#00206F] text-white shadow-[0_0_0_4px_rgba(0,32,111,0.12)]">
                <SolarIcon name="check-circle" className="size-7 text-white" />
              </span>
              <h2
                id={titleId}
                className="text-xl font-semibold tracking-tight text-[#001752]"
              >
                You’re awarded
              </h2>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                {done.percentOff}% scholarship applied. Remnant due{" "}
                <span className="font-semibold text-[#001752]">
                  {formatNgnFromKobo(done.amountDueKobo)}
                </span>
                .
                {done.hasAccount
                  ? " Sign in to your dashboard to pay and unlock access."
                  : " Create an account with this email, then pay from your dashboard."}
              </p>
              <Button
                type="button"
                className={cn(primaryBtnClass, "mt-6 w-full")}
                onClick={onClose}
              >
                Done
              </Button>
            </div>
          ) : options && options.cohorts.length === 0 ? (
            <div className="py-10 text-center">
              <SolarIcon
                name="calendar-mark"
                className="mx-auto size-10 text-[#00206F]/50" />
              <p className="mt-3 text-sm text-muted-foreground">
                No scholarship cohorts are open right now. Check back soon.
              </p>
            </div>
          ) : (
            <>
              <StepProgress step={step} steps={APPLY_STEPS} />

              <h2
                id={titleId}
                key={`title-${step}`}
                className={cn(
                  "scholarship-item text-xl font-semibold tracking-tight text-[#001752]",
                  stepDirection === "forward"
                    ? "scholarship-step-forward"
                    : "scholarship-step-back",
                )}
              >
                {copy.title}
              </h2>
              <p
                key={`desc-${step}`}
                className={cn(
                  "scholarship-item mt-1.5 text-sm text-muted-foreground",
                  stepDirection === "forward"
                    ? "scholarship-step-forward"
                    : "scholarship-step-back",
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
                    ? "scholarship-step-forward"
                    : "scholarship-step-back",
                )}
              >
                {step === 1 ? (
                  <FieldGroup>
                    <FormItem index={0}>
                      <Field>
                        <FieldLabel htmlFor="sch-name">Full name</FieldLabel>
                        <Input
                          id="sch-name"
                          value={form.fullName}
                          onChange={(e) => update("fullName", e.target.value)}
                          placeholder="Ada Lovelace"
                          className={inputClass}
                          autoComplete="name"
                        />
                      </Field>
                    </FormItem>
                    <FormItem index={1}>
                      <Field>
                        <FieldLabel htmlFor="sch-email">Email</FieldLabel>
                        <Input
                          id="sch-email"
                          type="email"
                          value={form.email}
                          onChange={(e) => update("email", e.target.value)}
                          placeholder="you@email.com"
                          className={inputClass}
                          autoComplete="email"
                        />
                      </Field>
                    </FormItem>
                    <FormItem index={2} className="grid gap-5 sm:grid-cols-2">
                      <Field>
                        <FieldLabel>Age range</FieldLabel>
                        <Select
                          options={options?.options.ageRanges || []}
                          value={form.ageRange || undefined}
                          onValueChange={(v) => update("ageRange", v)}
                          placeholder="Select age"
                          className={selectClass}
                        />
                      </Field>
                      <Field>
                        <FieldLabel>Gender</FieldLabel>
                        <Select
                          options={options?.options.genders || []}
                          value={form.gender || undefined}
                          onValueChange={(v) => update("gender", v)}
                          placeholder="Select gender"
                          className={selectClass}
                        />
                      </Field>
                    </FormItem>
                    <FormItem index={3}>
                      <Field>
                        <FieldLabel htmlFor="sch-wa">WhatsApp</FieldLabel>
                        <Input
                          id="sch-wa"
                          value={form.whatsapp}
                          onChange={(e) => update("whatsapp", e.target.value)}
                          placeholder="+234…"
                          className={inputClass}
                          autoComplete="tel"
                        />
                      </Field>
                    </FormItem>
                    <FormItem index={4}>
                      <Field>
                        <FieldLabel>Country</FieldLabel>
                        <Select
                          options={(options?.options.countries || []).map(
                            (c) => ({ value: c, label: c }),
                          )}
                          value={form.country || undefined}
                          onValueChange={(v) => update("country", v)}
                          placeholder="Select country"
                          className={selectClass}
                        />
                      </Field>
                    </FormItem>
                  </FieldGroup>
                ) : null}

                {step === 2 ? (
                  <FieldGroup>
                    <FormItem index={0}>
                      <Field>
                        <FieldLabel>Cohort</FieldLabel>
                        <Select
                          options={(options?.cohorts || []).map((c) => ({
                            value: c.id,
                            label: `${c.name} · ${c.scholarshipPercentOff}% off`,
                          }))}
                          value={form.cohortId || undefined}
                          onValueChange={(v) => {
                            update("cohortId", v)
                            update("track", "")
                          }}
                          placeholder="Select cohort"
                          className={selectClass}
                        />
                      </Field>
                      {selectedCohort ? (
                        <div className="mt-3 rounded-xl border border-black/8 bg-white px-3.5 py-3">
                          <p className="text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                            Your fee after scholarship
                          </p>
                          <div className="mt-1.5 flex items-baseline gap-2">
                            <span className="text-sm text-muted-foreground line-through">
                              {formatNgnFromKobo(selectedCohort.priceKobo)}
                            </span>
                            <span className="text-lg font-semibold tabular-nums text-[#001752]">
                              {formatNgnFromKobo(discounted)}
                            </span>
                          </div>
                        </div>
                      ) : null}
                    </FormItem>
                    <FormItem index={1}>
                      <Field>
                        <FieldLabel>Education</FieldLabel>
                        <Select
                          options={options?.options.educationLevels || []}
                          value={form.education || undefined}
                          onValueChange={(v) => update("education", v)}
                          placeholder="Select level"
                          className={selectClass}
                        />
                      </Field>
                    </FormItem>
                    <FormItem index={2}>
                      <Field>
                        <FieldLabel>How did you hear about us?</FieldLabel>
                        <Select
                          options={options?.options.referralSources || []}
                          value={form.referralSource || undefined}
                          onValueChange={(v) => update("referralSource", v)}
                          placeholder="Select source"
                          className={selectClass}
                        />
                      </Field>
                    </FormItem>
                    <FormItem index={3}>
                      <Field>
                        <FieldLabel>Track</FieldLabel>
                        <Select
                          options={trackOptions}
                          value={form.track || undefined}
                          onValueChange={(v) => update("track", v)}
                          placeholder="Select track"
                          className={selectClass}
                        />
                      </Field>
                    </FormItem>
                  </FieldGroup>
                ) : null}

                {step === 3 ? (
                  <FieldGroup>
                    <FormItem index={0} className="grid gap-5 sm:grid-cols-2">
                      <Field>
                        <FieldLabel>Laptop access</FieldLabel>
                        <Select
                          options={options?.options.yesNo || []}
                          value={form.laptop || undefined}
                          onValueChange={(v) => update("laptop", v)}
                          placeholder="Select"
                          className={selectClass}
                        />
                      </Field>
                      <Field>
                        <FieldLabel>Reliable internet</FieldLabel>
                        <Select
                          options={options?.options.yesNo || []}
                          value={form.internet || undefined}
                          onValueChange={(v) => update("internet", v)}
                          placeholder="Select"
                          className={selectClass}
                        />
                      </Field>
                    </FormItem>
                    <FormItem index={1} className="grid gap-5 sm:grid-cols-2">
                      <Field>
                        <FieldLabel>Daily study hours</FieldLabel>
                        <Select
                          options={options?.options.dailyHours || []}
                          value={form.dailyHours || undefined}
                          onValueChange={(v) => update("dailyHours", v)}
                          placeholder="Select"
                          className={selectClass}
                        />
                      </Field>
                      <Field>
                        <FieldLabel>Taken an online course?</FieldLabel>
                        <Select
                          options={options?.options.yesNo || []}
                          value={form.onlineBefore || undefined}
                          onValueChange={(v) => update("onlineBefore", v)}
                          placeholder="Select"
                          className={selectClass}
                        />
                      </Field>
                    </FormItem>
                    <FormItem index={2}>
                      <Field>
                        <FieldLabel htmlFor="sch-goals">
                          Career goals
                        </FieldLabel>
                        <Textarea
                          id="sch-goals"
                          value={form.careerGoals}
                          onChange={(e) =>
                            update("careerGoals", e.target.value)
                          }
                          placeholder="What do you want to achieve in the next 12 months?"
                          rows={4}
                          className={cn(
                            inputClass,
                            "h-auto min-h-[96px] resize-none py-2.5",
                          )}
                        />
                      </Field>
                    </FormItem>
                  </FieldGroup>
                ) : null}

                {step === 4 ? (
                  <FieldGroup>
                    <FormItem index={0}>
                      <div className="rounded-xl border border-black/8 bg-white p-4">
                        <p className="text-[11px] font-semibold tracking-[0.1em] text-[#FB7801] uppercase">
                          Commitment
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-[#001752]/85">
                          {selectedCohort?.scholarshipConsentText ||
                            "I understand the scholarship discount and agree to pay the remaining commitment fee by the deadline, or forfeit my award."}
                        </p>
                        {selectedCohort ? (
                          <p className="mt-3 text-xs text-muted-foreground">
                            Pay within{" "}
                            <span className="font-medium text-[#001752]">
                              {selectedCohort.scholarshipDeadlineDays} days
                            </span>{" "}
                            · remnant{" "}
                            <span className="font-medium text-[#001752]">
                              {formatNgnFromKobo(discounted)}
                            </span>
                          </p>
                        ) : null}
                      </div>
                    </FormItem>
                    <FormItem index={1}>
                      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-black/8 bg-white px-3.5 py-3.5 transition-colors duration-150 hover:border-[#00206F]/25">
                        <input
                          type="checkbox"
                          checked={form.consentAccepted}
                          onChange={(e) =>
                            update("consentAccepted", e.target.checked)
                          }
                          className="mt-0.5 size-4 rounded border-black/20 text-[#00206F] accent-[#00206F]"
                        />
                        <span className="text-sm leading-snug text-[#001752]">
                          I have read and agree to the scholarship commitment
                          above.
                        </span>
                      </label>
                    </FormItem>
                  </FieldGroup>
                ) : null}
              </div>
            </>
          )}
        </div>

        {!done && !loadingOptions && options && options.cohorts.length > 0 ? (
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
            {step < APPLY_STEPS.length ? (
              <Button
                type="button"
                className={cn(primaryBtnClass, "flex-[1.4]")}
                onClick={goNext}
              >
                Continue
                <SolarIcon name="alt-arrow-right" className="size-4 text-white" />
              </Button>
            ) : (
              <Button
                type="button"
                disabled={submitting}
                className={cn(primaryBtnClass, "flex-[1.4]")}
                onClick={() => void submit()}
              >
                {submitting ? "Submitting…" : "Submit application"}
              </Button>
            )}
          </div>
        ) : null}
      </div>

      <style jsx global>{`
        @keyframes scholarship-item-in {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scholarship-step-forward {
          from {
            opacity: 0;
            transform: translateX(12px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes scholarship-step-back {
          from {
            opacity: 0;
            transform: translateX(-12px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .scholarship-item {
          animation: scholarship-item-in 260ms cubic-bezier(0.23, 1, 0.32, 1)
            both;
        }
        .scholarship-step-forward {
          animation: scholarship-step-forward 280ms
            cubic-bezier(0.23, 1, 0.32, 1) both;
        }
        .scholarship-step-back {
          animation: scholarship-step-back 280ms cubic-bezier(0.23, 1, 0.32, 1)
            both;
        }
        @media (prefers-reduced-motion: reduce) {
          .scholarship-item,
          .scholarship-step-forward,
          .scholarship-step-back {
            animation: none;
          }
        }
      `}</style>
    </div>,
    document.body,
  )
}
