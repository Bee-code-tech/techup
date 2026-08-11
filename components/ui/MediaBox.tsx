import { cn } from "@/lib/cn";

type MediaBoxProps = {
  className?: string;
  label?: string;
  aspect?: "video" | "square" | "portrait" | "wide" | "auto";
};

const aspectClass = {
  video: "aspect-video",
  square: "aspect-square",
  portrait: "aspect-portrait",
  wide: "aspect-wide",
  auto: "",
} as const;

export function MediaBox({
  className,
  label = "Image",
  aspect = "auto",
}: MediaBoxProps) {
  return (
    <div
      className={cn(
        "relative flex w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-surface-blue text-sm font-medium text-muted",
        aspectClass[aspect],
        className,
      )}
      aria-label={`${label} placeholder`}
    >
      <span className="px-3 text-center">{label}</span>
    </div>
  );
}
