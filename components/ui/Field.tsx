import { cn } from "@/lib/cn";

type FieldProps = {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
};

export function Field({ label, hint, className, children }: FieldProps) {
  return (
    <div className={cn("block space-y-2", className)}>
      <span className="flex items-center justify-between gap-3 text-xs font-semibold tracking-wider text-muted uppercase">
        {label}
        {hint ? (
          <span className="normal-case tracking-normal">{hint}</span>
        ) : null}
      </span>
      {children}
    </div>
  );
}

const controlClass =
  "flex h-11 w-full rounded-md border border-border bg-white px-3 text-sm text-foreground shadow-xs outline-none transition placeholder:text-muted/70 focus-visible:border-navy/40 focus-visible:ring-2 focus-visible:ring-navy/15 disabled:cursor-not-allowed disabled:opacity-50";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlClass, className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        controlClass,
        "h-auto min-h-28 resize-y py-2.5",
        className,
      )}
      {...props}
    />
  );
}
