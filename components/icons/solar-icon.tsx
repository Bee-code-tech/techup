"use client"

import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"

/** Solar Bold Duotone via Iconify — pass the base name only (e.g. `"user"`, `"card"`). */
export function SolarIcon({
  name,
  className,
  size,
  "aria-hidden": ariaHidden = true,
}: {
  name: string
  className?: string
  size?: number | string
  "aria-hidden"?: boolean
}) {
  const icon = name.includes(":")
    ? name
    : `solar:${name}-bold-duotone`

  return (
    <Icon
      icon={icon}
      width={size ?? 16}
      height={size ?? 16}
      aria-hidden={ariaHidden}
      className={cn("inline-block size-4 shrink-0", className)}
    />
  )
}
