"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/cn";
import { gsap, prefersReducedMotion, registerGsap } from "@/lib/gsap";
import { homeFaqs } from "@/lib/site";

export function HomeFaqCta() {
  const [open, setOpen] = useState<number | null>(0);
  const listRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const root = listRef.current;
      if (!root || prefersReducedMotion()) return;

      gsap.fromTo(
        root.querySelectorAll("[data-faq]"),
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: root,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        },
      );
    },
    { scope: listRef },
  );

  return (
    <Section className="bg-surface-blue">
      <div className="grid gap-8 lg:grid-cols-content lg:gap-10">
        <div>
          <SectionHeading
            align="left"
            className="text-left"
            title="Frequently Asked Questions"
            subtitle="Quick answers about programs, applications, and how TechUp works."
          />
          <div ref={listRef} className="mt-6 space-y-3 sm:mt-8">
            {homeFaqs.map((item, index) => {
              const isOpen = open === index;
              return (
                <div
                  key={item.q}
                  data-faq
                  className="rounded-2xl border border-border bg-white"
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left sm:gap-4 sm:px-5"
                    onClick={() => setOpen(isOpen ? null : index)}
                  >
                    <span className="text-sm font-semibold text-navy sm:text-base">
                      {item.q}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 text-muted transition",
                        isOpen && "rotate-180",
                      )}
                    >
                      ▾
                    </span>
                  </button>
                  {isOpen ? (
                    <p className="border-t border-border px-4 py-4 text-sm leading-relaxed text-muted sm:px-5">
                      {item.a}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <Reveal y={40} className="flex items-center">
          <div className="w-full rounded-3xl bg-navy p-6 text-center text-white sm:p-8 md:p-10">
            <p className="font-display text-xl leading-snug font-bold sm:text-2xl md:text-3xl">
              Join 5000+ others taking the first step towards a global tech
              career.
            </p>
            <Button
              href="/bootcamp"
              variant="orange"
              size="lg"
              className="mt-6 w-full sm:mt-8 sm:w-auto"
            >
              Join Free Bootcamp
            </Button>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
