"use client"

import { LoaderCircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export function UploadProgressBar({
  label = "Uploading",
  percent,
  className,
}: {
  label?: string
  percent: number
  className?: string
}) {
  const value = Math.max(0, Math.min(100, Math.round(percent)))

  return (
    <div
      className={cn(
        "space-y-2 rounded-xl border border-[#00206F]/12 bg-[#f4f7fc] px-3 py-3",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label={`${label} ${value}%`}
    >
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="inline-flex items-center gap-1.5 font-medium text-[#001752]">
          <LoaderCircleIcon className="size-3.5 animate-spin text-[#00206F]" />
          {label}
        </span>
        <span className="tabular-nums font-semibold text-[#00206F]">
          {value}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#dde5f5]">
        <div
          className="relative h-full rounded-full bg-[#00206F] transition-[width] duration-200 ease-out"
          style={{ width: `${Math.max(value, value > 0 ? 4 : 0)}%` }}
        >
          <span className="absolute inset-0 animate-pulse bg-linear-to-r from-transparent via-white/25 to-transparent" />
        </div>
      </div>
    </div>
  )
}
