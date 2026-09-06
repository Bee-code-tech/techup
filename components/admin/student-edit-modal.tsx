"use client"

import { useEffect, useId, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import toast from "react-hot-toast"
import { PencilIcon, XIcon } from "lucide-react"

import type { Registration } from "@/components/admin/use-admin-dashboard"
import { bootcampTracks, laptopLabels } from "@/lib/bootcamp"
import { Select } from "@/components/marketing/Select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const fieldClass =
  "h-11 w-full rounded-xl border border-black/8 bg-[#f7f8fb] px-3.5 text-[15px] text-[#001752] shadow-none outline-none transition-[border-color,background-color,box-shadow] duration-150 ease-[var(--ease-out)] focus-visible:border-[#00206F]/35 focus-visible:bg-white focus-visible:ring-3 focus-visible:ring-[#00206F]/12 md:text-[15px]"

const genderOptions = [
  { value: "Female", label: "Female" },
  { value: "Male", label: "Male" },
  { value: "Prefer not to say", label: "Prefer not to say" },
]

const educationOptions = [
  { value: "SSCE / O'Level", label: "SSCE / O'Level" },
  { value: "Undergraduate", label: "Undergraduate" },
  { value: "Graduate", label: "Graduate" },
]

const laptopOptions = Object.entries(laptopLabels).map(([value, label]) => ({
  value,
  label,
}))

const trackOptions = Object.entries(bootcampTracks).map(([value, label]) => ({
  value,
  label,
}))

type FormState = {
  fullName: string
  email: string
  age: string
  gender: string
  whatsapp: string
  education: string
  laptop: string
  track: string
}

function toFormState(student: Registration): FormState {
  return {
    fullName: student.fullName,
    email: student.email,
    age: String(student.age),
    gender: student.gender,
    whatsapp: student.whatsapp,
    education: student.education,
    laptop: student.laptop,
    track: student.track,
  }
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

function formatRegistered(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function Field({
  label,
  htmlFor,
  className,
  children,
  hint,
}: {
  label: string
  htmlFor: string
  className?: string
  children: React.ReactNode
  hint?: string
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-[#001752]"
      >
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs leading-5 text-[#b85700]">{hint}</p> : null}
    </div>
  )
}

export function StudentEditModal({
  student,
  open,
  onClose,
  onSaved,
}: {
  student: Registration | null
  open: boolean
  onClose: () => void
  onSaved?: () => void
}) {
  const formId = useId()
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const [form, setForm] = useState<FormState | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open || !student) {
      setVisible(false)
      return
    }

    setForm(toFormState(student))
    const frame = window.requestAnimationFrame(() => setVisible(true))
    return () => window.cancelAnimationFrame(frame)
  }, [open, student])

  useEffect(() => {
    if (!open) return

    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !pending) onClose()
    }
    window.addEventListener("keydown", onKeyDown)

    return () => {
      document.body.style.overflow = previous
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [open, onClose, pending])

  const dirty = useMemo(() => {
    if (!student || !form) return false
    const original = toFormState(student)
    return (Object.keys(original) as Array<keyof FormState>).some(
      (key) => original[key] !== form[key],
    )
  }, [form, student])

  const trackChanged = Boolean(student && form && student.track !== form.track)

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => (current ? { ...current, [key]: value } : current))
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!student || !form || pending) return

    setPending(true)
    try {
      const response = await fetch(`/api/admin/registrations/${student.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          age: Number(form.age),
        }),
      })
      const payload = (await response.json()) as {
        error?: string
        trackChanged?: boolean
        emailSent?: boolean
        emailError?: string
      }

      if (!response.ok) {
        toast.error(payload.error || "Could not save student.")
        return
      }

      if (payload.trackChanged && payload.emailSent) {
        toast.success("Student updated · track change email sent.")
      } else if (payload.trackChanged && payload.emailError) {
        toast.success("Student updated, but the email could not be sent.")
      } else {
        toast.success("Student details updated.")
      }

      onSaved?.()
      onClose()
    } catch {
      toast.error("Network error while saving student.")
    } finally {
      setPending(false)
    }
  }

  if (!mounted || !open || !student || !form) return null

  const genderChoices = genderOptions.some(
    (option) => option.value === form.gender,
  )
    ? genderOptions
    : [{ value: form.gender, label: form.gender }, ...genderOptions]

  const educationChoices = educationOptions.some(
    (option) => option.value === form.education,
  )
    ? educationOptions
    : [{ value: form.education, label: form.education }, ...educationOptions]

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end justify-center p-3 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close dialog"
        disabled={pending}
        className={cn(
          "absolute inset-0 z-0 bg-[#001028]/55 backdrop-blur-[6px] transition-opacity duration-200 ease-out",
          visible ? "opacity-100" : "opacity-0",
        )}
        onClick={() => {
          if (!pending) onClose()
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${formId}-title`}
        className={cn(
          "relative z-10 flex max-h-[min(92vh,860px)] w-full max-w-2xl origin-center flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#f7f8fb] shadow-[0_28px_80px_-28px_rgba(0,32,111,0.55)] transition-[opacity,transform] duration-200 ease-[var(--ease-out)]",
          visible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-2 scale-[0.96] opacity-0",
        )}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="relative shrink-0 overflow-hidden bg-[#00206F] px-5 pb-5 pt-5 text-white sm:px-6 sm:pb-6 sm:pt-6">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-16 size-48 rounded-full bg-[#FB7801]/25 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-16 left-10 size-40 rounded-full bg-white/10 blur-3xl"
          />

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3.5">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-sm font-bold ring-1 ring-white/15">
                {initials(form.fullName || student.fullName)}
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold tracking-[0.18em] text-white/55 uppercase">
                  Edit student
                </p>
                <h2
                  id={`${formId}-title`}
                  className="mt-1 truncate text-xl font-semibold tracking-tight"
                >
                  {form.fullName || student.fullName}
                </h2>
                <p className="mt-1 truncate text-sm text-white/70">
                  Registered {formatRegistered(student.createdAt)}
                </p>
              </div>
            </div>

            <button
              type="button"
              aria-label="Close"
              disabled={pending}
              onClick={onClose}
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/15 hover:text-white active:scale-[0.97] disabled:opacity-50"
            >
              <XIcon className="size-4" />
            </button>
          </div>

          <div className="relative mt-5 flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium text-white/85 ring-1 ring-white/10">
              {bootcampTracks[student.track] ?? student.track}
            </span>
            {trackChanged ? (
              <span className="rounded-lg bg-[#FB7801]/20 px-2.5 py-1 text-xs font-medium text-[#ffd7b0] ring-1 ring-[#FB7801]/25">
                Email will be sent on save
              </span>
            ) : null}
          </div>
        </div>

        <form
          onSubmit={handleSave}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
            <section className="rounded-2xl border border-black/5 bg-white p-4 shadow-[0_1px_0_rgba(0,32,111,0.04)] sm:p-5">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-[#001752]">
                  Contact
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  How we reach this student
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Full name"
                  htmlFor={`${formId}-fullName`}
                  className="sm:col-span-2"
                >
                  <Input
                    id={`${formId}-fullName`}
                    value={form.fullName}
                    onChange={(event) =>
                      updateField("fullName", event.target.value)
                    }
                    required
                    className={fieldClass}
                  />
                </Field>

                <Field
                  label="Email"
                  htmlFor={`${formId}-email`}
                  className="sm:col-span-2"
                >
                  <Input
                    id={`${formId}-email`}
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      updateField("email", event.target.value)
                    }
                    required
                    className={fieldClass}
                  />
                </Field>

                <Field label="WhatsApp" htmlFor={`${formId}-whatsapp`} className="sm:col-span-2">
                  <Input
                    id={`${formId}-whatsapp`}
                    value={form.whatsapp}
                    onChange={(event) =>
                      updateField("whatsapp", event.target.value)
                    }
                    required
                    className={fieldClass}
                  />
                </Field>
              </div>
            </section>

            <section className="rounded-2xl border border-black/5 bg-white p-4 shadow-[0_1px_0_rgba(0,32,111,0.04)] sm:p-5">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-[#001752]">
                  Profile
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Registration details on file
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Age" htmlFor={`${formId}-age`}>
                  <Input
                    id={`${formId}-age`}
                    type="number"
                    min={13}
                    max={80}
                    value={form.age}
                    onChange={(event) => updateField("age", event.target.value)}
                    required
                    className={fieldClass}
                  />
                </Field>

                <Field label="Gender" htmlFor={`${formId}-gender`}>
                  <Select
                    id={`${formId}-gender`}
                    value={form.gender}
                    onValueChange={(value) => updateField("gender", value)}
                    required
                    options={genderChoices}
                    placeholder="Select gender"
                  />
                </Field>

                <Field label="Education" htmlFor={`${formId}-education`}>
                  <Select
                    id={`${formId}-education`}
                    value={form.education}
                    onValueChange={(value) => updateField("education", value)}
                    required
                    options={educationChoices}
                    placeholder="Select education"
                  />
                </Field>

                <Field label="Laptop access" htmlFor={`${formId}-laptop`}>
                  <Select
                    id={`${formId}-laptop`}
                    value={form.laptop}
                    onValueChange={(value) => updateField("laptop", value)}
                    required
                    options={laptopOptions}
                    placeholder="Select laptop access"
                  />
                </Field>
              </div>
            </section>

            <section
              className={cn(
                "rounded-2xl border bg-white p-4 shadow-[0_1px_0_rgba(0,32,111,0.04)] sm:p-5",
                trackChanged
                  ? "border-[#FB7801]/35 shadow-[0_8px_24px_-18px_rgba(251,120,1,0.45)]"
                  : "border-black/5",
              )}
            >
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-[#001752]">
                  Bootcamp track
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Changing course emails the student their new WhatsApp group
                </p>
              </div>

              <Field
                label="Course"
                htmlFor={`${formId}-track`}
                hint={
                  trackChanged
                    ? `${bootcampTracks[student.track] ?? student.track} → ${bootcampTracks[form.track] ?? form.track}`
                    : undefined
                }
              >
                <Select
                  id={`${formId}-track`}
                  value={form.track}
                  onValueChange={(value) => updateField("track", value)}
                  required
                  options={trackOptions}
                  placeholder="Select track"
                  className={
                    trackChanged
                      ? "border-[#FB7801]/40 bg-[#fff6ef] hover:bg-[#fff6ef]"
                      : undefined
                  }
                />
              </Field>
            </section>
          </div>

          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-black/5 bg-white/90 px-4 py-4 backdrop-blur-sm sm:px-5">
            <p className="hidden text-xs text-muted-foreground sm:block">
              {dirty
                ? trackChanged
                  ? "Track change will notify the student by email."
                  : "Unsaved changes"
                : "No changes yet"}
            </p>
            <div className="ml-auto flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                className="h-10 rounded-xl px-4"
                disabled={pending}
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="admin-press h-10 rounded-xl bg-[#00206F] px-5 text-white hover:bg-[#001752]"
                disabled={pending || !dirty}
              >
                {pending ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}

export function StudentActionButton({
  onClick,
}: {
  onClick: () => void
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-8 rounded-lg border-black/[0.08] px-2.5 text-xs"
      onClick={onClick}
    >
      <PencilIcon className="size-3.5" />
      <span className="hidden sm:inline">Edit</span>
    </Button>
  )
}
