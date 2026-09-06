import { cn } from "@/lib/utils"

/** Shared admin field chrome — quiet, focused, no heavy borders. */
export const adminFieldClass =
  "h-11 w-full rounded-xl border border-black/[0.06] bg-[#f4f6fa] px-3.5 text-[15px] text-[#001752] shadow-none outline-none transition-[border-color,background-color,box-shadow] duration-150 ease-[var(--ease-out)] placeholder:text-muted-foreground/70 focus-visible:border-[#00206F]/30 focus-visible:bg-white focus-visible:ring-3 focus-visible:ring-[#00206F]/10 md:text-[15px]"

export const adminPrimaryBtnClass =
  "admin-press h-11 rounded-lg bg-[#00206F] px-5 text-[15px] font-medium text-white shadow-[0_10px_24px_-16px_rgba(0,32,111,0.65)] hover:bg-[#001752] disabled:opacity-50"

export const adminSecondaryBtnClass =
  "admin-press h-11 rounded-lg border border-black/8 bg-white px-4 text-[15px] font-medium text-[#001752] hover:bg-[#f7f8fb] disabled:opacity-50"

export function AdminPageIntro({
  title,
  description,
  className,
}: {
  title: string
  description?: string
  className?: string
}) {
  return (
    <div className={cn("mb-1", className)}>
      <h2 className="text-[1.35rem] font-semibold tracking-tight text-[#001752]">
        {title}
      </h2>
      {description ? (
        <p className="mt-1 max-w-2xl text-[14.5px] leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  )
}

export function AdminPanel({
  children,
  className,
  padded = true,
}: {
  children: React.ReactNode
  className?: string
  padded?: boolean
}) {
  return (
    <section
      className={cn("admin-panel", padded && "p-5 sm:p-6", className)}
    >
      {children}
    </section>
  )
}

export function AdminPanelHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h3 className="text-[1.05rem] font-semibold tracking-tight text-[#001752]">
          {title}
        </h3>
        {description ? (
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  )
}
