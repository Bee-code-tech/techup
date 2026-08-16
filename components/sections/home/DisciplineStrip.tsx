import { disciplines } from "@/lib/site";

export function DisciplineStrip() {
  const items = [...disciplines, ...disciplines];

  return (
    <div className="overflow-hidden bg-navy">
      <div className="flex w-max animate-marquee py-3.5 hover:[animation-play-state:paused] motion-reduce:w-full motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:justify-center">
        {items.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="flex shrink-0 items-center gap-8 px-8 text-sm font-medium tracking-wide text-white/90 sm:text-sm-plus"
          >
            {item}
            <span className="size-1.5 rounded-full bg-orange" aria-hidden="true" />
          </span>
        ))}
      </div>
    </div>
  );
}
