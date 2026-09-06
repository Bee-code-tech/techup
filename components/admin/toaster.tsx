"use client"

import type { ReactNode } from "react"
import {
  Toaster,
  ToastBar,
  toast,
  type Toast,
  type ToastType,
} from "react-hot-toast"
import {
  AlertCircle,
  CheckCircle2,
  Info,
  Loader2,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

const DEFAULT_DURATION = 4000

const accentByType: Record<ToastType, string> = {
  success: "bg-[var(--success)]",
  error: "bg-red-500",
  loading: "bg-[var(--orange)]",
  blank: "bg-[var(--navy)]",
  custom: "bg-[var(--navy)]",
}

const iconWrapByType: Record<ToastType, string> = {
  success:
    "bg-[color-mix(in_srgb,var(--success)_14%,white)] text-[var(--success)]",
  error: "bg-red-500/12 text-red-600",
  loading:
    "bg-[color-mix(in_srgb,var(--orange)_16%,white)] text-[var(--orange)]",
  blank: "bg-[color-mix(in_srgb,var(--navy)_10%,white)] text-[var(--navy)]",
  custom: "bg-[color-mix(in_srgb,var(--navy)_10%,white)] text-[var(--navy)]",
}

function ToastIcon({ type }: { type: ToastType }) {
  const className = "size-[17px] shrink-0"
  switch (type) {
    case "success":
      return <CheckCircle2 className={className} strokeWidth={2.25} />
    case "error":
      return <AlertCircle className={className} strokeWidth={2.25} />
    case "loading":
      return (
        <Loader2 className={cn(className, "animate-spin")} strokeWidth={2.25} />
      )
    default:
      return <Info className={className} strokeWidth={2.25} />
  }
}

function GlassToast({
  t,
  message,
}: {
  t: Toast
  message: ReactNode
}) {
  const duration =
    typeof t.duration === "number" && Number.isFinite(t.duration)
      ? t.duration
      : null
  const showProgress = duration !== null && t.type !== "loading"

  return (
    <div
      className={cn(
        "toast-glass group relative w-[min(92vw,360px)] overflow-hidden rounded-lg",
        "border border-white/60 bg-white/62 shadow-[0_20px_50px_-20px_rgba(0,32,111,0.42)]",
        "backdrop-blur-2xl backdrop-saturate-150",
        "ring-1 ring-[color-mix(in_srgb,var(--navy)_7%,transparent)]",
      )}
      data-visible={t.visible}
      data-toast-type={t.type}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/75 via-white/20 to-[color-mix(in_srgb,var(--navy)_5%,transparent)]"
      />

      <div className="relative flex items-start gap-3 px-3.5 py-3.5 pr-2.5">
        <span
          className={cn(
            "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md",
            iconWrapByType[t.type],
          )}
        >
          <ToastIcon type={t.type} />
        </span>

        <div className="min-w-0 flex-1 pt-0.5 text-[13.5px] font-medium leading-snug tracking-[-0.01em] text-[var(--navy-deep)] [&_*]:!m-0 [&_*]:!justify-start [&_*]:!p-0 [&_*]:!text-[13.5px] [&_*]:!font-medium [&_*]:!leading-snug [&_*]:!text-[var(--navy-deep)]">
          {message}
        </div>

        {t.type !== "loading" ? (
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => toast.dismiss(t.id)}
            className={cn(
              "admin-press mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg",
              "text-[var(--muted-foreground)]",
              "hover:bg-[color-mix(in_srgb,var(--navy)_7%,white)] hover:text-[var(--navy)]",
            )}
          >
            <X className="size-3.5" strokeWidth={2.25} />
          </button>
        ) : null}
      </div>

      {showProgress ? (
        <div className="toast-progress-track absolute inset-x-0 bottom-0 h-[2.5px] overflow-hidden bg-[color-mix(in_srgb,var(--navy)_7%,transparent)]">
          <div
            className={cn(
              "toast-progress-bar h-full origin-left rounded-full",
              accentByType[t.type],
            )}
            style={{ animationDuration: `${duration}ms` }}
          />
        </div>
      ) : null}
    </div>
  )
}

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      gutter={10}
      reverseOrder={false}
      containerStyle={{
        top: 18,
        right: 18,
        zIndex: 9999,
      }}
      toastOptions={{
        duration: DEFAULT_DURATION,
        style: {
          background: "transparent",
          boxShadow: "none",
          padding: 0,
          maxWidth: "none",
        },
      }}
    >
      {(t) => (
        <ToastBar
          toast={t}
          style={{
            animation: "none",
            background: "transparent",
            boxShadow: "none",
            padding: 0,
            margin: 0,
          }}
        >
          {({ message }) => <GlassToast t={t} message={message} />}
        </ToastBar>
      )}
    </Toaster>
  )
}
