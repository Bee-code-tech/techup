"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/Button";
import { site } from "@/lib/site";

type BootcampSuccessModalProps = {
  open: boolean;
  name: string;
  onClose: () => void;
};

function fireConfetti() {
  const colors = ["#00206F", "#FB7801", "#0133A0", "#ffffff", "#FFDBC8"];

  confetti({
    particleCount: 90,
    spread: 70,
    origin: { y: 0.35 },
    colors,
    scalar: 1.05,
  });

  window.setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.55 },
      colors,
    });
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.55 },
      colors,
    });
  }, 180);
}

export function BootcampSuccessModal({
  open,
  name,
  onClose,
}: BootcampSuccessModalProps) {
  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timeout = window.setTimeout(fireConfetti, 80);

    return () => {
      document.body.style.overflow = previous;
      window.clearTimeout(timeout);
    };
  }, [open]);

  if (!open) return null;

  const firstName = name.split(" ")[0] || "there";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-navy/70 backdrop-blur-md"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bootcamp-success-title"
        className="relative w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_80px_rgba(0,32,111,0.28)]"
      >
        <div className="relative overflow-hidden bg-[linear-gradient(135deg,#00206F_0%,#0133A0_55%,#001752_100%)] px-6 pb-10 pt-8 text-white sm:px-8">
          <div className="pointer-events-none absolute -top-10 -right-8 size-40 rounded-full bg-orange/30 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-10 size-36 rounded-full bg-white/10 blur-2xl" />
          <div className="relative mx-auto flex size-16 items-center justify-center rounded-full bg-orange shadow-orange">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M5 12.5L10 17.5L19 7.5"
                stroke="white"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="relative mt-5 text-center text-xs font-bold tracking-[0.2em] text-orange uppercase">
            Spot reserved
          </p>
          <h2
            id="bootcamp-success-title"
            className="relative mt-2 text-center font-display text-3xl font-bold"
          >
            You&apos;re in, {firstName}!
          </h2>
          <p className="relative mx-auto mt-3 max-w-sm text-center text-sm leading-6 text-white/80">
            A confirmation email is on its way. Jump into the community so you
            get onboarding updates, schedules, and mentor notes.
          </p>
        </div>

        <div className="space-y-3 px-6 py-6 sm:px-8">
          <Button
            href={site.whatsappGroupUrl}
            variant="orange"
            size="lg"
            className="w-full rounded-xl"
          >
            Join WhatsApp Group
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full rounded-xl"
            onClick={onClose}
          >
            I&apos;ll do this later
          </Button>
        </div>
      </div>
    </div>
  );
}
