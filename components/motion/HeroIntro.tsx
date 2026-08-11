"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/cn";
import { gsap, prefersReducedMotion, registerGsap } from "@/lib/gsap";

type HeroIntroProps = {
  children: React.ReactNode;
  className?: string;
};

/** Orchestrates a polished hero entrance for [data-hero] children. */
export function HeroIntro({ children, className }: HeroIntroProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const root = ref.current;
      if (!root) return;

      const items = root.querySelectorAll("[data-hero]");
      if (!items.length) return;

      if (prefersReducedMotion()) {
        gsap.set(items, { clearProps: "all", opacity: 1 });
        return;
      }

      const media = root.querySelector("[data-hero-media]");
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        items,
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.75, stagger: 0.1 },
      );

      if (media) {
        tl.fromTo(
          media,
          { opacity: 0, y: 40, scale: 0.96, rotate: 0 },
          { opacity: 1, y: 0, scale: 1, duration: 1, ease: "power3.out" },
          0.15,
        );
      }
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
