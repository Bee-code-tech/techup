"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { Container } from "@/components/layout/Container";
import { gsap, prefersReducedMotion, registerGsap } from "@/lib/gsap";
import { disciplines } from "@/lib/site";

export function DisciplineStrip() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const root = ref.current;
      if (!root || prefersReducedMotion()) return;

      gsap.fromTo(
        root.querySelectorAll("[data-strip]"),
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.06,
          ease: "power2.out",
          scrollTrigger: {
            trigger: root,
            start: "top 95%",
            toggleActions: "play none none none",
          },
        },
      );
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className="bg-navy">
      <Container className="py-3 sm:py-4">
        <div className="-mx-4 flex gap-6 overflow-x-auto px-4 pb-1 text-sm font-medium whitespace-nowrap text-white/90 scrollbar-none sm:mx-0 sm:flex-wrap sm:justify-between sm:gap-x-6 sm:gap-y-3 sm:overflow-visible sm:px-0 sm:pb-0 sm:whitespace-normal md:text-sm-plus">
          {disciplines.map((item) => (
            <span
              key={item}
              data-strip
              className="shrink-0 sm:min-w-28 sm:text-center"
            >
              {item}
            </span>
          ))}
        </div>
      </Container>
    </div>
  );
}
