"use client"

import { useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"
import {
  CameraIcon,
  CheckIcon,
  KeyRoundIcon,
  LoaderCircleIcon,
  ShieldCheckIcon,
  UserRoundIcon,
} from "lucide-react"

import { useSessionUser } from "@/components/dashboard/use-session"
import {
  useProfile,
  type ProfileUser,
} from "@/components/dashboard/use-profile"
import { Select } from "@/components/marketing/Select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { bootcampTracks, laptopLabels } from "@/lib/bootcamp"
import { cn } from "@/lib/utils"

const fieldClass =
  "h-11 w-full rounded-xl border border-black/8 bg-[#f7f8fb] px-3.5 text-[15px] text-[#001752] shadow-none outline-none transition-[border-color,background-color,box-shadow] duration-150 ease-[var(--ease-out)] placeholder:text-muted-foreground/70 focus-visible:border-[#00206F]/35 focus-visible:bg-white focus-visible:ring-3 focus-visible:ring-[#00206F]/12 md:text-[15px]"

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

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

function roleLabel(role: string) {
  if (role === "admin") return "Admin"
  if (role === "tutor") return "Tutor"
  return "Student"
}

function hydrateFromProfile(user: ProfileUser) {
  return {
    name: user.name || "",
    email: user.email || "",
    role: user.role || "student",
    bio: user.bio || "",
    avatarUrl: user.avatarUrl,
    whatsapp: user.whatsapp || "",
    age: user.age != null ? String(user.age) : "",
    gender: user.gender || "",
    education: user.education || "",
    laptop: user.laptop || "",
    track: user.track,
  }
}

export default function SettingsPage() {
  const session = useSessionUser()
  const { profile, loading, error, applyProfile } = useProfile()
  const fileRef = useRef<HTMLInputElement>(null)

  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [mounted, setMounted] = useState(false)

  const seeded = profile ? hydrateFromProfile(profile) : null
  const [name, setName] = useState(seeded?.name ?? "")
  const [email, setEmail] = useState(seeded?.email ?? "")
  const [role, setRole] = useState(seeded?.role ?? "student")
  const [bio, setBio] = useState(seeded?.bio ?? "")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    seeded?.avatarUrl ?? null,
  )
  const [whatsapp, setWhatsapp] = useState(seeded?.whatsapp ?? "")
  const [age, setAge] = useState(seeded?.age ?? "")
  const [gender, setGender] = useState(seeded?.gender ?? "")
  const [education, setEducation] = useState(seeded?.education ?? "")
  const [laptop, setLaptop] = useState(seeded?.laptop ?? "")
  const [track, setTrack] = useState<string | null>(seeded?.track ?? null)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const seededRef = useRef(Boolean(seeded))

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true))
    return () => window.cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    if (!profile || seededRef.current) return
    seededRef.current = true
    const next = hydrateFromProfile(profile)
    setName(next.name)
    setEmail(next.email)
    setRole(next.role)
    setBio(next.bio)
    setAvatarUrl(next.avatarUrl)
    setWhatsapp(next.whatsapp)
    setAge(next.age)
    setGender(next.gender)
    setEducation(next.education)
    setLaptop(next.laptop)
    setTrack(next.track)
  }, [profile])

  function syncForm(user: ProfileUser) {
    applyProfile(user)
    const next = hydrateFromProfile(user)
    setName(next.name)
    setEmail(next.email)
    setRole(next.role)
    setBio(next.bio)
    setAvatarUrl(next.avatarUrl)
    setWhatsapp(next.whatsapp)
    setAge(next.age)
    setGender(next.gender)
    setEducation(next.education)
    setLaptop(next.laptop)
    setTrack(next.track)
  }

  useEffect(() => {
    if (error) toast.error(error)
  }, [error])

  async function uploadAvatar(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB.")
      return
    }

    setUploading(true)
    try {
      const signRes = await fetch("/api/auth/avatar/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      const signed = (await signRes.json()) as {
        error?: string
        cloudName?: string
        apiKey?: string
        timestamp?: number
        folder?: string
        signature?: string
      }
      if (!signRes.ok || !signed.cloudName) {
        toast.error(signed.error || "Upload signing failed.")
        return
      }

      const form = new FormData()
      form.append("file", file)
      form.append("api_key", signed.apiKey!)
      form.append("timestamp", String(signed.timestamp))
      form.append("signature", signed.signature!)
      form.append("folder", signed.folder!)

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`,
        { method: "POST", body: form },
      )
      const uploaded = (await uploadRes.json()) as {
        secure_url?: string
        error?: { message?: string }
      }
      if (!uploadRes.ok || !uploaded.secure_url) {
        toast.error(uploaded.error?.message || "Image upload failed.")
        return
      }

      const saveRes = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: uploaded.secure_url }),
      })
      const savePayload = (await saveRes.json()) as {
        error?: string
        user?: ProfileUser
      }
      if (!saveRes.ok) {
        toast.error(savePayload.error || "Could not save photo.")
        return
      }

      if (savePayload.user) syncForm(savePayload.user)
      else setAvatarUrl(uploaded.secure_url)
      await session.reload({ silent: true })
      toast.success("Profile photo updated.")
    } catch {
      toast.error("Upload network error.")
    } finally {
      setUploading(false)
    }
  }

  async function removeAvatar() {
    setUploading(true)
    try {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: null }),
      })
      const payload = (await response.json()) as {
        error?: string
        user?: ProfileUser
      }
      if (!response.ok) {
        toast.error(payload.error || "Could not remove photo.")
        return
      }
      if (payload.user) syncForm(payload.user)
      else setAvatarUrl(null)
      await session.reload({ silent: true })
      toast.success("Photo removed.")
    } finally {
      setUploading(false)
    }
  }

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault()
    setSavingProfile(true)
    try {
      const body: Record<string, unknown> = {
        name,
        email,
        bio,
        whatsapp,
      }
      if (role === "student") {
        body.age = age
        body.gender = gender
        body.education = education
        body.laptop = laptop
      }

      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const payload = (await response.json()) as {
        error?: string
        user?: ProfileUser
      }
      if (!response.ok) {
        toast.error(payload.error || "Could not save profile.")
        return
      }
      if (payload.user) syncForm(payload.user)
      await session.reload({ silent: true })
      toast.success("Profile saved.")
    } catch {
      toast.error("Network error.")
    } finally {
      setSavingProfile(false)
    }
  }

  async function savePassword(event: React.FormEvent) {
    event.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.")
      return
    }
    setSavingPassword(true)
    try {
      const response = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const payload = (await response.json()) as { error?: string }
      if (!response.ok) {
        toast.error(payload.error || "Could not update password.")
        return
      }
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      await session.reload({ silent: true })
      toast.success("Password updated.")
    } catch {
      toast.error("Network error.")
    } finally {
      setSavingPassword(false)
    }
  }

  if (loading && !profile) {
    return (
      <div className="flex flex-col gap-5 px-4 py-6 lg:px-6 md:py-8" aria-busy>
        <Skeleton className="h-44 w-full rounded-xl" />
        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <Skeleton className="h-[28rem] w-full rounded-xl" />
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="px-4 py-8 lg:px-6">
        <p className="text-sm text-muted-foreground">
          {error || "Could not load settings."}
        </p>
      </div>
    )
  }

  return (
    <div
      data-mounted={mounted}
      className={cn(
        "flex flex-col gap-5 px-4 py-6 transition-[opacity,transform] duration-300 ease-[var(--ease-out)] lg:px-6 md:py-8",
        mounted
          ? "translate-y-0 opacity-100"
          : "translate-y-2 opacity-0",
      )}
    >
      <section className="admin-panel overflow-hidden">
        <div className="overflow-hidden bg-[#001752] px-5 py-6 text-white sm:px-7 sm:py-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="group relative">
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                  className="admin-press relative flex size-[4.75rem] items-center justify-center overflow-hidden rounded-2xl bg-white/10 text-xl font-semibold ring-1 ring-white/15"
                  aria-label="Change profile photo"
                >
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    initials(name || "U")
                  )}
                  <span className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity duration-150 ease-[var(--ease-out)] group-hover:opacity-100">
                    {uploading ? (
                      <LoaderCircleIcon className="size-5 animate-spin text-white" />
                    ) : (
                      <CameraIcon className="size-5 text-white" />
                    )}
                  </span>
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) void uploadAvatar(file)
                    event.target.value = ""
                  }}
                />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-white/12 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-white/90 uppercase">
                    {roleLabel(role)}
                  </span>
                  {track && bootcampTracks[track] ? (
                    <span className="rounded-lg bg-[#FB7801]/20 px-2 py-0.5 text-[11px] font-semibold text-[#ffd7b0]">
                      {bootcampTracks[track]}
                    </span>
                  ) : null}
                </div>
                <h1 className="mt-2 truncate font-display text-2xl font-bold tracking-tight sm:text-[1.75rem]">
                  {name || "Your profile"}
                </h1>
                <p className="mt-1 truncate text-sm text-white/70">{email}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="admin-press h-10 rounded-xl bg-white px-4 text-sm font-semibold text-[#001752] hover:bg-white/90"
              >
                {uploading ? "Uploading…" : "Change photo"}
              </Button>
              {avatarUrl ? (
                <Button
                  type="button"
                  disabled={uploading}
                  onClick={() => void removeAvatar()}
                  variant="outline"
                  className="admin-press h-10 rounded-xl border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  Remove
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
        <form
          onSubmit={(event) => void saveProfile(event)}
          className="admin-panel overflow-hidden"
        >
          <div className="flex items-start gap-3 border-b border-black/5 px-5 py-4 sm:px-6">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#eef2f9] text-[#00206F]">
              <UserRoundIcon className="size-4" aria-hidden />
            </span>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-[#001752]">
                Profile details
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Keep your contact info current across TechUp.
              </p>
            </div>
          </div>

          <div className="space-y-4 p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name">
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className={fieldClass}
                  required
                />
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={fieldClass}
                  required
                />
              </Field>
              <Field label="WhatsApp" className="sm:col-span-2">
                <Input
                  value={whatsapp}
                  onChange={(event) => setWhatsapp(event.target.value)}
                  placeholder="+234…"
                  className={fieldClass}
                />
              </Field>

              {(role === "tutor" || role === "admin") && (
                <Field label="Bio" className="sm:col-span-2">
                  <textarea
                    value={bio}
                    onChange={(event) => setBio(event.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-black/8 bg-[#f7f8fb] px-3.5 py-3 text-[15px] text-[#001752] shadow-none outline-none transition-[border-color,background-color,box-shadow] duration-150 ease-[var(--ease-out)] placeholder:text-muted-foreground/70 focus-visible:border-[#00206F]/35 focus-visible:bg-white focus-visible:ring-3 focus-visible:ring-[#00206F]/12"
                    placeholder="A short intro students will see"
                  />
                </Field>
              )}

              {role === "student" ? (
                <>
                  <Field label="Age">
                    <Input
                      type="number"
                      min={10}
                      max={100}
                      value={age}
                      onChange={(event) => setAge(event.target.value)}
                      className={fieldClass}
                    />
                  </Field>
                  <Field label="Gender">
                    <Select
                      value={gender || genderOptions[2].value}
                      onValueChange={setGender}
                      options={genderOptions}
                    />
                  </Field>
                  <Field label="Education">
                    <Select
                      value={education || educationOptions[1].value}
                      onValueChange={setEducation}
                      options={educationOptions}
                    />
                  </Field>
                  <Field label="Laptop">
                    <Select
                      value={laptop || "yes"}
                      onValueChange={setLaptop}
                      options={laptopOptions}
                    />
                  </Field>
                </>
              ) : null}
            </div>

            <div className="flex justify-end border-t border-black/5 pt-4">
              <Button
                type="submit"
                disabled={savingProfile}
                className="admin-press h-11 gap-2 rounded-xl bg-[#00206F] px-5 text-white hover:bg-[#001752]"
              >
                {savingProfile ? (
                  <LoaderCircleIcon className="size-4 animate-spin" />
                ) : (
                  <CheckIcon className="size-4" aria-hidden />
                )}
                {savingProfile ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </div>
        </form>

        <form
          onSubmit={(event) => void savePassword(event)}
          className="admin-panel overflow-hidden"
        >
          <div className="flex items-start gap-3 border-b border-black/5 bg-[#fbfcfe] px-5 py-4 sm:px-6">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#fff1e6] text-[#FB7801]">
              <ShieldCheckIcon className="size-4" aria-hidden />
            </span>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-[#001752]">
                Security
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Update your password anytime. Min 8 characters.
              </p>
            </div>
          </div>

          <div className="space-y-4 p-5 sm:p-6">
            <Field label="Current password">
              <Input
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className={fieldClass}
                required
              />
            </Field>
            <Field label="New password">
              <Input
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className={fieldClass}
                required
                minLength={8}
              />
            </Field>
            <Field label="Confirm new password">
              <Input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className={fieldClass}
                required
                minLength={8}
              />
            </Field>

            <Button
              type="submit"
              disabled={savingPassword}
              className="admin-press h-11 w-full gap-2 rounded-xl bg-[#001752] px-5 text-white hover:bg-[#00133f]"
            >
              {savingPassword ? (
                <LoaderCircleIcon className="size-4 animate-spin" />
              ) : (
                <KeyRoundIcon className="size-4" aria-hidden />
              )}
              {savingPassword ? "Updating…" : "Update password"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <span className="text-sm font-medium text-[#001752]">{label}</span>
      {children}
    </div>
  )
}
