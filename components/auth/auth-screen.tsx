"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import toast from "react-hot-toast"
import {
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  GraduationCapIcon,
  UserRoundIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"

import { BrandLogo } from "@/components/admin/brand-logo"
import { Select } from "@/components/marketing/Select"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { bootcampTracks } from "@/lib/bootcamp"
import { cn } from "@/lib/utils"

type Mode = "login" | "register" | "forgot" | "reset"

const REGISTER_STEPS: {
  id: number
  label: string
  icon: LucideIcon
}[] = [
  { id: 1, label: "Account", icon: UserRoundIcon },
  { id: 2, label: "Profile", icon: UsersIcon },
  { id: 3, label: "Track", icon: GraduationCapIcon },
]

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

const laptopOptions = [
  { value: "yes", label: "I have a laptop" },
  { value: "no", label: "I need laptop support" },
]

const trackOptions = Object.entries(bootcampTracks).map(([value, label]) => ({
  value,
  label,
}))

const inputClass =
  "h-10 rounded-lg border border-black/10 bg-transparent px-3 text-sm text-[#001752] shadow-none transition-[border-color,box-shadow] duration-150 ease-out placeholder:text-muted-foreground/70 focus-visible:border-[#00206F]/40 focus-visible:ring-2 focus-visible:ring-[#00206F]/12 md:text-sm"

const primaryBtnClass =
  "h-10 w-full rounded-lg bg-[#00206F] text-sm font-medium text-white transition-transform duration-150 ease-out hover:bg-[#001752] active:scale-[0.98]"

const linkClass =
  "font-medium text-[#001752] underline-offset-4 transition-colors duration-150 hover:underline active:scale-[0.98]"

function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  minLength,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  autoComplete?: string
  required?: boolean
  minLength?: number
}) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <Input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        className={cn(inputClass, "pr-11")}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-black/4 hover:text-[#001752] active:scale-[0.96]"
      >
        {visible ? (
          <EyeOffIcon className="size-4" />
        ) : (
          <EyeIcon className="size-4" />
        )}
      </button>
    </div>
  )
}

function copyForMode(mode: Mode, registerStep: number) {
  if (mode === "register") {
    if (registerStep === 1) {
      return {
        title: "Create your account",
        description: "Start with your name, email, and a password.",
      }
    }
    if (registerStep === 2) {
      return {
        title: "Tell us about you",
        description: "A few details so we can place you in the right cohort.",
      }
    }
    return {
      title: "Choose your track",
      description: "Pick the path you’ll learn first. You can change later.",
    }
  }

  switch (mode) {
    case "forgot":
      return {
        title: "Forgot password?",
        description:
          "Enter the email on your account and we’ll send a reset link.",
      }
    case "reset":
      return {
        title: "Set a new password",
        description: "Choose a new password for your TechUp Academy account.",
      }
    default:
      return {
        title: "Welcome back",
        description: "Sign in to continue to your dashboard.",
      }
  }
}

function AuthItem({
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
      className={cn("auth-item", className)}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {children}
    </div>
  )
}

function StepProgress({ step }: { step: number }) {
  const progress =
    ((Math.max(1, Math.min(step, REGISTER_STEPS.length)) - 1) /
      (REGISTER_STEPS.length - 1)) *
    100

  return (
    <div className="relative mb-6 w-full">
      <div
        aria-hidden
        className="absolute top-[2.5rem] right-[18px] left-[18px] h-[2px] rounded-full bg-black/8"
      >
        <div
          className="h-full rounded-full bg-[#00206F] transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="relative z-10 flex w-full items-start justify-between">
        {REGISTER_STEPS.map((item) => {
          const Icon = item.icon
          const active = step === item.id
          const done = step > item.id

          return (
            <div
              key={item.id}
              className="flex flex-col items-center"
            >
              <span
                className={cn(
                  "mb-2 text-[11px] font-medium transition-colors duration-200 ease-out",
                  active || done ? "text-[#001752]" : "text-muted-foreground",
                )}
              >
                {item.label}
              </span>
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-full border transition-[background-color,border-color,color,transform,box-shadow] duration-200 ease-out",
                  done || active
                    ? "border-[#00206F] bg-[#00206F] text-white shadow-[0_0_0_3px_rgba(0,32,111,0.12)]"
                    : "border-black/10 bg-[#fafafa] text-muted-foreground",
                  active && "scale-105",
                )}
              >
                {done ? (
                  <CheckIcon className="size-4" strokeWidth={2.5} aria-hidden />
                ) : (
                  <Icon className="size-4" strokeWidth={2.25} aria-hidden />
                )}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AuthScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialMode = (searchParams.get("mode") as Mode) || "login"
  const tokenFromUrl = (searchParams.get("token") || "").trim()
  const nextPath = searchParams.get("next")

  const [mode, setMode] = useState<Mode>(
    initialMode === "reset" && tokenFromUrl ? "reset" : initialMode,
  )
  // Keep token in state so URL cleanups can't wipe it mid-submit
  const [resetToken, setResetToken] = useState(tokenFromUrl)
  const [registerStep, setRegisterStep] = useState(1)
  const [stepDirection, setStepDirection] = useState<"forward" | "back">(
    "forward",
  )
  const [mounted, setMounted] = useState(false)
  const [pending, setPending] = useState(false)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [age, setAge] = useState("")
  const [gender, setGender] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [education, setEducation] = useState("Undergraduate")
  const [laptop, setLaptop] = useState("yes")
  const [track, setTrack] = useState("frontend")

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true))
    return () => window.cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    const next =
      initialMode === "reset" && tokenFromUrl ? "reset" : initialMode || "login"
    setMode(next)
    if (tokenFromUrl) setResetToken(tokenFromUrl)
    if (next === "register") setRegisterStep(1)
  }, [initialMode, tokenFromUrl])

  function switchMode(next: Mode) {
    setMode(next)
    if (next === "register") {
      setRegisterStep(1)
      setStepDirection("forward")
    }
    if (next !== "reset") setResetToken("")
    const url = new URL(window.location.href)
    if (next === "login") url.searchParams.delete("mode")
    else url.searchParams.set("mode", next)
    if (next !== "reset") url.searchParams.delete("token")
    if (nextPath) url.searchParams.set("next", nextPath)
    window.history.replaceState({}, "", url.toString())
  }

  function goNextStep() {
    if (registerStep === 1) {
      if (fullName.trim().length < 2) {
        toast.error("Enter your full name.")
        return
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        toast.error("Enter a valid email address.")
        return
      }
      if (password.length < 8) {
        toast.error("Password must be at least 8 characters.")
        return
      }
      if (password !== confirmPassword) {
        toast.error("Passwords do not match.")
        return
      }
    }

    if (registerStep === 2) {
      const ageNumber = Number(age)
      if (!age || Number.isNaN(ageNumber) || ageNumber < 13 || ageNumber > 80) {
        toast.error("Enter a valid age between 13 and 80.")
        return
      }
      if (!gender) {
        toast.error("Select your gender.")
        return
      }
      if (whatsapp.trim().length < 8) {
        toast.error("Enter a valid WhatsApp number.")
        return
      }
      if (!education) {
        toast.error("Select your education level.")
        return
      }
      if (!laptop) {
        toast.error("Select laptop access.")
        return
      }
    }

    setStepDirection("forward")
    setRegisterStep((current) => Math.min(3, current + 1))
  }

  function goBackStep() {
    setStepDirection("back")
    setRegisterStep((current) => Math.max(1, current - 1))
  }

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault()
    setPending(true)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const payload = (await response.json()) as {
        error?: string
        redirectTo?: string
      }
      if (!response.ok) {
        toast.error(payload.error || "Invalid email or password.")
        return
      }
      toast.success("Welcome back")
      router.push(nextPath || payload.redirectTo || "/dashboard")
      router.refresh()
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setPending(false)
    }
  }

  async function handleRegister(event: React.FormEvent) {
    event.preventDefault()
    if (registerStep < 3) {
      goNextStep()
      return
    }
    if (!track) {
      toast.error("Select a bootcamp track.")
      return
    }

    setPending(true)
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          password,
          age,
          gender,
          whatsapp,
          education,
          laptop,
          track,
        }),
      })
      const payload = (await response.json()) as {
        error?: string
        redirectTo?: string
      }
      if (!response.ok) {
        toast.error(payload.error || "Could not create your account.")
        return
      }
      toast.success("Account created — welcome to TechUp")
      router.push(payload.redirectTo || "/dashboard")
      router.refresh()
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setPending(false)
    }
  }

  async function handleForgot(event: React.FormEvent) {
    event.preventDefault()
    setPending(true)
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const payload = (await response.json()) as {
        error?: string
        message?: string
      }
      if (!response.ok) {
        toast.error(payload.error || "Could not send reset email.")
        return
      }
      toast.success(payload.message || "Reset link sent. Check your email.")
      switchMode("login")
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setPending(false)
    }
  }

  async function handleReset(event: React.FormEvent) {
    event.preventDefault()
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.")
      return
    }
    setPending(true)
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, password }),
      })
      const payload = (await response.json()) as {
        error?: string
        message?: string
      }
      if (!response.ok) {
        toast.error(payload.error || "Could not reset password.")
        return
      }
      toast.success(payload.message || "Password updated.")
      switchMode("login")
      setPassword("")
      setConfirmPassword("")
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setPending(false)
    }
  }

  const copy = copyForMode(mode, registerStep)

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-[#fafafa] px-4 py-10 sm:px-6">
      <div
        data-mounted={mounted}
        className={cn(
          "w-full max-w-[400px] transition-[opacity,transform] duration-200 ease-out",
          mounted ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        )}
      >
        <div className="rounded-xl border border-black/10 px-5 py-7 sm:px-6 sm:py-8">
          <div className="mb-6">
            <Link
              href="/"
              className="mb-5 flex w-full items-center justify-center gap-2.5 transition-opacity duration-150 hover:opacity-90 active:scale-[0.98]"
            >
              <BrandLogo size={32} priority />
              <span className="text-sm font-semibold tracking-tight text-[#001752]">
                TechUp Academy
              </span>
            </Link>

            {mode === "register" ? (
              <StepProgress step={registerStep} />
            ) : null}

            <h1
              key={`${mode}-${registerStep}-title`}
              className="auth-item text-xl font-semibold tracking-tight text-[#001752]"
            >
              {copy.title}
            </h1>
            <p
              key={`${mode}-${registerStep}-desc`}
              className="auth-item mt-1.5 text-sm text-muted-foreground"
              style={{ animationDelay: "35ms" }}
            >
              {copy.description}
            </p>
          </div>

          <div>
            {mode === "login" ? (
              <form key="login" onSubmit={handleLogin}>
                <FieldGroup>
                  <AuthItem index={0}>
                    <Field>
                      <FieldLabel htmlFor="email">Email</FieldLabel>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@email.com"
                        required
                        autoComplete="email"
                        className={inputClass}
                      />
                    </Field>
                  </AuthItem>
                  <AuthItem index={1}>
                    <Field>
                      <div className="flex items-center justify-between gap-3">
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        <button
                          type="button"
                          onClick={() => switchMode("forgot")}
                          className="text-xs font-medium text-muted-foreground underline-offset-4 transition-colors duration-150 hover:text-[#001752] hover:underline"
                        >
                          Forgot your password?
                        </button>
                      </div>
                      <PasswordInput
                        id="password"
                        value={password}
                        onChange={setPassword}
                        placeholder="Enter your password"
                        required
                        autoComplete="current-password"
                      />
                    </Field>
                  </AuthItem>
                  <AuthItem index={2}>
                    <Field>
                      <Button
                        type="submit"
                        disabled={pending}
                        className={primaryBtnClass}
                      >
                        {pending ? "Signing in..." : "Sign in"}
                      </Button>
                    </Field>
                  </AuthItem>
                  <AuthItem index={3}>
                    <p className="text-center text-sm text-muted-foreground">
                      Don&apos;t have an account?{" "}
                      <button
                        type="button"
                        onClick={() => switchMode("register")}
                        className={linkClass}
                      >
                        Sign up
                      </button>
                    </p>
                  </AuthItem>
                </FieldGroup>
              </form>
            ) : null}

            {mode === "register" ? (
              <form key="register" onSubmit={handleRegister}>
                <div
                  key={registerStep}
                  data-direction={stepDirection}
                  className="auth-step"
                >
                  {registerStep === 1 ? (
                    <FieldGroup>
                      <AuthItem index={0}>
                        <Field>
                          <FieldLabel htmlFor="fullName">Full name</FieldLabel>
                          <Input
                            id="fullName"
                            value={fullName}
                            onChange={(event) =>
                              setFullName(event.target.value)
                            }
                            placeholder="Ada Lovelace"
                            required
                            autoComplete="name"
                            className={inputClass}
                          />
                        </Field>
                      </AuthItem>
                      <AuthItem index={1}>
                        <Field>
                          <FieldLabel htmlFor="register-email">Email</FieldLabel>
                          <Input
                            id="register-email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="you@email.com"
                            required
                            autoComplete="email"
                            className={inputClass}
                          />
                        </Field>
                      </AuthItem>
                      <AuthItem index={2}>
                        <Field>
                          <FieldLabel htmlFor="register-password">
                            Password
                          </FieldLabel>
                          <PasswordInput
                            id="register-password"
                            value={password}
                            onChange={setPassword}
                            placeholder="At least 8 characters"
                            required
                            minLength={8}
                            autoComplete="new-password"
                          />
                        </Field>
                      </AuthItem>
                      <AuthItem index={3}>
                        <Field>
                          <FieldLabel htmlFor="confirm-password">
                            Confirm password
                          </FieldLabel>
                          <PasswordInput
                            id="confirm-password"
                            value={confirmPassword}
                            onChange={setConfirmPassword}
                            placeholder="Repeat password"
                            required
                            minLength={8}
                            autoComplete="new-password"
                          />
                        </Field>
                      </AuthItem>
                    </FieldGroup>
                  ) : null}

                  {registerStep === 2 ? (
                    <FieldGroup>
                      <AuthItem index={0}>
                        <div className="grid gap-5 sm:grid-cols-2">
                          <Field>
                            <FieldLabel htmlFor="age">Age</FieldLabel>
                            <Input
                              id="age"
                              type="number"
                              min={13}
                              max={80}
                              value={age}
                              onChange={(event) => setAge(event.target.value)}
                              placeholder="22"
                              required
                              className={inputClass}
                            />
                          </Field>
                          <Field>
                            <FieldLabel>Gender</FieldLabel>
                            <Select
                              value={gender || undefined}
                              onValueChange={setGender}
                              required
                              options={genderOptions}
                              placeholder="Select gender"
                            />
                          </Field>
                        </div>
                      </AuthItem>
                      <AuthItem index={1}>
                        <Field>
                          <FieldLabel htmlFor="whatsapp">WhatsApp</FieldLabel>
                          <Input
                            id="whatsapp"
                            value={whatsapp}
                            onChange={(event) =>
                              setWhatsapp(event.target.value)
                            }
                            required
                            placeholder="+234 801 234 5678"
                            className={inputClass}
                          />
                        </Field>
                      </AuthItem>
                      <AuthItem index={2}>
                        <Field>
                          <FieldLabel>Education</FieldLabel>
                          <Select
                            value={education}
                            onValueChange={setEducation}
                            required
                            options={educationOptions}
                            placeholder="Select education level"
                          />
                        </Field>
                      </AuthItem>
                      <AuthItem index={3}>
                        <Field>
                          <FieldLabel>Laptop access</FieldLabel>
                          <Select
                            value={laptop}
                            onValueChange={setLaptop}
                            required
                            options={laptopOptions}
                            placeholder="Do you have a laptop?"
                          />
                        </Field>
                      </AuthItem>
                    </FieldGroup>
                  ) : null}

                  {registerStep === 3 ? (
                    <FieldGroup>
                      <AuthItem index={0}>
                        <Field>
                          <FieldLabel>Bootcamp track</FieldLabel>
                          <Select
                            value={track}
                            onValueChange={setTrack}
                            required
                            options={trackOptions}
                            placeholder="Choose your track"
                          />
                        </Field>
                      </AuthItem>
                      <AuthItem index={1}>
                        <div className="rounded-lg border border-black/10 px-4 py-3 text-sm">
                          <p className="font-medium text-[#001752]">
                            {fullName || "Your name"}
                          </p>
                          <p className="mt-0.5 text-muted-foreground">{email}</p>
                          <p className="mt-2 text-muted-foreground">
                            Track:{" "}
                            <span className="font-medium text-[#001752]">
                              {bootcampTracks[track] || track}
                            </span>
                          </p>
                        </div>
                      </AuthItem>
                    </FieldGroup>
                  ) : null}
                </div>

                <div className="mt-6 flex items-center gap-3">
                  {registerStep > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={goBackStep}
                      className="h-10 flex-1 rounded-lg border-black/10 bg-transparent transition-transform duration-150 ease-out active:scale-[0.98]"
                    >
                      Back
                    </Button>
                  ) : null}
                  <Button
                    type="submit"
                    disabled={pending}
                    className={cn(
                      primaryBtnClass,
                      registerStep > 1 ? "flex-[1.4]" : "w-full",
                    )}
                  >
                    {registerStep < 3
                      ? "Continue"
                      : pending
                        ? "Creating account..."
                        : "Create account"}
                  </Button>
                </div>

                <p className="mt-5 text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className={linkClass}
                  >
                    Sign in
                  </button>
                </p>
              </form>
            ) : null}

            {mode === "forgot" ? (
              <form key="forgot" onSubmit={handleForgot}>
                <FieldGroup>
                  <AuthItem index={0}>
                    <Field>
                      <FieldLabel htmlFor="forgot-email">Email</FieldLabel>
                      <Input
                        id="forgot-email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@email.com"
                        required
                        autoComplete="email"
                        className={inputClass}
                      />
                    </Field>
                  </AuthItem>
                  <AuthItem index={1}>
                    <Field>
                      <Button
                        type="submit"
                        disabled={pending}
                        className={primaryBtnClass}
                      >
                        {pending ? "Sending..." : "Send reset link"}
                      </Button>
                    </Field>
                  </AuthItem>
                  <AuthItem index={2}>
                    <p className="text-center text-sm text-muted-foreground">
                      Remembered it?{" "}
                      <button
                        type="button"
                        onClick={() => switchMode("login")}
                        className={linkClass}
                      >
                        Back to sign in
                      </button>
                    </p>
                  </AuthItem>
                </FieldGroup>
              </form>
            ) : null}

            {mode === "reset" ? (
              <form key="reset" onSubmit={handleReset}>
                <FieldGroup>
                  <AuthItem index={0}>
                    <Field>
                      <FieldLabel htmlFor="new-password">
                        New password
                      </FieldLabel>
                      <PasswordInput
                        id="new-password"
                        value={password}
                        onChange={setPassword}
                        placeholder="At least 8 characters"
                        required
                        minLength={8}
                        autoComplete="new-password"
                      />
                    </Field>
                  </AuthItem>
                  <AuthItem index={1}>
                    <Field>
                      <FieldLabel htmlFor="new-password-confirm">
                        Confirm password
                      </FieldLabel>
                      <PasswordInput
                        id="new-password-confirm"
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        placeholder="Repeat password"
                        required
                        minLength={8}
                        autoComplete="new-password"
                      />
                    </Field>
                  </AuthItem>
                  <AuthItem index={2}>
                    <Field>
                      <Button
                        type="submit"
                        disabled={pending || !resetToken}
                        className={primaryBtnClass}
                      >
                        {pending ? "Updating..." : "Update password"}
                      </Button>
                    </Field>
                  </AuthItem>
                </FieldGroup>
              </form>
            ) : null}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes auth-item-in {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes auth-step-forward {
          from {
            opacity: 0;
            transform: translateX(12px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes auth-step-back {
          from {
            opacity: 0;
            transform: translateX(-12px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .auth-item {
          animation: auth-item-in 260ms cubic-bezier(0.23, 1, 0.32, 1) both;
        }

        .auth-step[data-direction="forward"] {
          animation: auth-step-forward 220ms cubic-bezier(0.23, 1, 0.32, 1) both;
        }

        .auth-step[data-direction="back"] {
          animation: auth-step-back 220ms cubic-bezier(0.23, 1, 0.32, 1) both;
        }

        @media (prefers-reduced-motion: reduce) {
          .auth-item,
          .auth-step[data-direction="forward"],
          .auth-step[data-direction="back"] {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}

export function AuthPageClient() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center bg-[#fafafa] text-sm text-muted-foreground">
          Loading…
        </div>
      }
    >
      <AuthScreen />
    </Suspense>
  )
}
