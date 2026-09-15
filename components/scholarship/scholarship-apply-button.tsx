"use client"

import { useState } from "react"

import { ScholarshipApplyModal } from "@/components/scholarship/scholarship-apply-modal"
import { Button } from "@/components/marketing/site-button"
import { cn } from "@/lib/cn"

type ButtonVariant = "primary" | "secondary" | "orange" | "ghost" | "outline"
type ButtonSize = "sm" | "md" | "lg"

export function ScholarshipApplyButton({
  children = "Apply Now",
  variant = "primary",
  size = "lg",
  className,
  onClick,
}: {
  children?: React.ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  onClick?: () => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={cn(className)}
        onClick={() => {
          onClick?.()
          setOpen(true)
        }}
      >
        {children}
      </Button>
      <ScholarshipApplyModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
