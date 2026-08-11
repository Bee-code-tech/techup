import { cn } from "@/lib/cn";

type FieldProps = {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
};

export function Field({ label, hint, className, children }: FieldProps) {
  return (
    <label className={cn("block space-y-2", className)}>
      <span className="flex items-center justify-between gap-3 text-xs font-semibold tracking-wider text-muted uppercase">
        {label}
        {hint ? (
          <span className="normal-case tracking-normal">{hint}</span>
        ) : null}
      </span>
      {children}
    </label>
  );
}

const controlClass =
  "w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-navy/40 focus:ring-4 focus:ring-navy/10 placeholder:text-muted/70";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlClass, props.className)} {...props} />;
}

export function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      className={cn(controlClass, "min-h-28 resize-y", props.className)}
      {...props}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(controlClass, props.className)} {...props}>
      {props.children}
    </select>
  );
}
