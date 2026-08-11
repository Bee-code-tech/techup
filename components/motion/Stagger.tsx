"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/cn";
import { gsap, prefersReducedMotion, registerGsap } from "@/lib/gsap";

type StaggerProps = {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  y?: number;
  delay?: number;
  duration?: number;
  start?: string;
  selector?: string;
};

export function Stagger({
  children,
  className,
  stagger = 0.1,
  y = 28,
  delay = 0,
  duration = 0.7,
  start = "top 85%",
  selector = "[data-reveal]",
}: StaggerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const root = ref.current;
      if (!root) return;

      const items = root.querySelectorAll(selector);
      if (!items.length) return;

      if (prefersReducedMotion()) {
        gsap.set(items, { clearProps: "all", opacity: 1 });
        return;
      }

      gsap.fromTo(
        items,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration,
          delay,
          stagger,
          ease: "power3.out",
          scrollTrigger: {
            trigger: root,
            start,
            toggleActions: "play none none none",
          },
        },
      );
    },
    { dependencies: [stagger, y, delay, duration, start, selector] },
  );

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
