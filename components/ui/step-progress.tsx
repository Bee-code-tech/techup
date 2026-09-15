"use client"

import { SolarIcon } from "@/components/icons/solar-icon"
import { cn } from "@/lib/utils"

export type StepProgressItem = {
  id: number
  label: string
  /** Solar base name, e.g. `"user"` → `solar:user-bold-duotone` */
  icon: string
}

export function StepProgress({
  step,
  steps,
}: {
  step: number
  steps: StepProgressItem[]
}) {
  const progress =
    steps.length <= 1
      ? 100
      : ((Math.max(1, Math.min(step, steps.length)) - 1) / (steps.length - 1)) *
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
        {steps.map((item) => {
          const active = step === item.id
          const done = step > item.id

          return (
            <div key={item.id} className="flex flex-col items-center">
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
                  <SolarIcon name="check-read" className="size-4 text-white" />
                ) : (
                  <SolarIcon
                    name={item.icon}
                    className={cn(
                      "size-4",
                      active ? "text-white" : "text-current",
                    )} />
                )}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
