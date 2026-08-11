import { cn } from "@/lib/cn";

type BadgeProps = {
  children: React.ReactNode;
  tone?: "orange" | "soft" | "navy";
  className?: string;
};

export function Badge({ children, tone = "soft", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-2 rounded-full px-3 py-1.5 text-micro font-semibold tracking-wide uppercase sm:px-3.5 sm:text-xs",
        tone === "soft" && "bg-orange-soft text-badge",
        tone === "orange" && "bg-orange text-white",
        tone === "navy" && "bg-navy text-white",
        className,
      )}
    >
      <span className="size-1.5 shrink-0 rounded-full bg-current opacity-80" />
      <span className="truncate">{children}</span>
    </span>
  );
}
