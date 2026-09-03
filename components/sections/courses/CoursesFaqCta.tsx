"use client";

import { useState } from "react";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/marketing/site-button";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { cn } from "@/lib/cn";
import { coursesFaqs } from "@/lib/site";

export function CoursesFaqCta() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section className="bg-white">
      <div className="grid gap-8 lg:grid-cols-content lg:gap-10">
        <div>
          <SectionHeading
            align="left"
            className="text-left"
            title="Frequently Asked Questions"
            subtitle="Quick answers about courses, enrollment, and what to expect."
          />
          <div className="mt-6 space-y-3 sm:mt-8">
            {coursesFaqs.map((item, index) => {
              const isOpen = open === index;
              return (
                <div
                  key={item.q}
                  className="rounded-2xl border border-border bg-surface-blue/60"
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
                        "shrink-0 text-muted-foreground transition",
                        isOpen && "rotate-180",
                      )}
                    >
                      ▾
                    </span>
                  </button>
                  {isOpen ? (
                    <p className="border-t border-border px-4 py-4 text-sm leading-relaxed text-muted-foreground sm:px-5">
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
              Ready to start building career-ready tech skills?
            </p>
            <p className="mt-3 text-sm text-white/75">
              Choose a program and begin your journey with mentorship, projects,
              and practical training.
            </p>
            <Button
              href="/contact"
              variant="orange"
              size="lg"
              className="mt-6 w-full sm:mt-8 sm:w-auto"
            >
              Enroll Now
            </Button>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
