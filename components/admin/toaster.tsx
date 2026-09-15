"use client"

import type { ReactNode } from "react"
import {
  Toaster,
  ToastBar,
  toast,
  type Toast,
  type ToastType,
} from "react-hot-toast"
import { cn } from "@/lib/utils"

const DEFAULT_DURATION = 3200

const iconClassByType: Record<ToastType, string> = {
  success: "text-emerald-600",
  error: "text-red-600",
  loading: "text-[#FB7801]",
  blank: "text-[#00206F]",
  custom: "text-[#00206F]",
}

/** Inline SVGs — avoid Iconify network fetches inside toasts (can hang the UI). */
function ToastIcon({ type }: { type: ToastType }) {
  const className = cn("size-4 shrink-0", iconClassByType[type])
  switch (type) {
    case "success":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M8 12.5 10.5 15 16 9.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case "error":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M12 8v5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle cx="12" cy="16" r="1" fill="currentColor" />
        </svg>
      )
    case "loading":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={cn(className, "animate-spin")}
          aria-hidden
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeOpacity="0.25"
            strokeWidth="1.8"
          />
          <path
            d="M21 12a9 9 0 0 0-9-9"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M12 11v5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle cx="12" cy="8" r="1" fill="currentColor" />
        </svg>
      )
  }
}

function AppToast({
  t,
  message,
}: {
  t: Toast
  message: ReactNode
}) {
  return (
    <div
      className="toast-card flex w-max max-w-[min(92vw,380px)] items-center gap-2.5 rounded-lg border border-[#e6eaf2] bg-white py-2.5 pr-2 pl-3 shadow-[0_8px_30px_rgba(0,32,111,0.08)]"
      data-visible={t.visible}
      data-toast-type={t.type}
      role="status"
    >
      <ToastIcon type={t.type} />

      <div className="min-w-0 flex-1 text-[13px] font-medium leading-snug text-[#001752] [&_*]:!m-0 [&_*]:!justify-start [&_*]:!p-0 [&_*]:!text-[13px] [&_*]:!font-medium [&_*]:!leading-snug [&_*]:!text-[#001752]">
        {message}
      </div>

      {t.type !== "loading" ? (
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => toast.dismiss(t.id)}
          className="flex size-6 shrink-0 items-center justify-center rounded-md text-[#8b93a7] transition-colors hover:bg-[#f4f6fa] hover:text-[#001752]"
        >
          <svg viewBox="0 0 24 24" fill="none" className="size-3.5" aria-hidden>
            <path
              d="M7 7l10 10M17 7 7 17"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
      ) : null}
    </div>
  )
}

export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      gutter={8}
      reverseOrder={false}
      containerStyle={{
        top: 16,
        zIndex: 9999,
        pointerEvents: "none",
      }}
      toastOptions={{
        duration: DEFAULT_DURATION,
        style: {
          background: "transparent",
          boxShadow: "none",
          padding: 0,
          maxWidth: "none",
          pointerEvents: "auto",
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
            pointerEvents: "auto",
          }}
        >
          {({ message }) => <AppToast t={t} message={message} />}
        </ToastBar>
      )}
    </Toaster>
  )
}
