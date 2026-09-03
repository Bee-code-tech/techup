"use client";

import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/cn";

type SectionHeadingProps = {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  light?: boolean;
  underline?: boolean;
  className?: string;
};

export function SectionHeading({
  title,
  subtitle,
  align = "center",
  light = false,
  underline = false,
  className,
}: SectionHeadingProps) {
  return (
    <Reveal
      y={28}
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <h2
        className={cn(
          "font-display text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl",
          light ? "text-white" : "text-navy",
        )}
      >
        {title}
      </h2>
      {underline ? (
        <div
          className={cn(
            "mt-3 h-1 w-14 rounded-full bg-orange",
            align === "center" && "mx-auto",
          )}
        />
      ) : null}
      {subtitle ? (
        <p
          className={cn(
            "mt-3 text-sm leading-relaxed sm:mt-4 sm:text-base md:text-lg",
            light ? "text-white/75" : "text-muted-foreground",
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </Reveal>
  );
}
