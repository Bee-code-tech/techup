"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/cn";
import { gsap, prefersReducedMotion, registerGsap } from "@/lib/gsap";

type FloatProps = {
  children: React.ReactNode;
  className?: string;
  amplitude?: number;
  duration?: number;
};

export function Float({
  children,
  className,
  amplitude = 10,
  duration = 4.5,
}: FloatProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;

      gsap.to(el, {
        y: -amplitude,
        duration,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    },
    { dependencies: [amplitude, duration] },
  );

  return (
    <div ref={ref} className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}
