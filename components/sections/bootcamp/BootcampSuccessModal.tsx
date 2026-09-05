"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import confetti from "canvas-confetti";
import { Button } from "@/components/marketing/site-button";

type BootcampSuccessModalProps = {
  open: boolean;
  name: string;
  trackLabel: string;
  whatsappGroupUrl: string;
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
    zIndex: 90,
  });

  window.setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.55 },
      colors,
      zIndex: 90,
    });
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.55 },
      colors,
      zIndex: 90,
    });
  }, 180);
}

export function BootcampSuccessModal({
  open,
  name,
  trackLabel,
  whatsappGroupUrl,
  onClose,
}: BootcampSuccessModalProps) {
  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timeout = window.setTimeout(fireConfetti, 80);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previous;
      window.clearTimeout(timeout);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  const firstName = name.split(" ")[0] || "there";

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 z-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bootcamp-success-title"
        className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-border bg-white shadow-card"
      >
        <div className="bg-navy px-6 pb-8 pt-8 text-white sm:px-8">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-orange">
            <svg
              width="26"
              height="26"
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
          <p className="mt-5 text-center text-xs font-bold tracking-[0.18em] text-orange uppercase">
            Registration confirmed
          </p>
          <h2
            id="bootcamp-success-title"
            className="mt-2 text-center font-display text-3xl font-bold"
          >
            You&apos;re in, {firstName}!
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-center text-sm leading-6 text-white/80">
            A confirmation email is on its way. Join the {trackLabel} WhatsApp
            group for onboarding updates and session links.
          </p>
        </div>

        <div className="space-y-3 px-6 py-6 sm:px-8">
          <Button
            href={whatsappGroupUrl}
            variant="orange"
            size="lg"
            className="w-full rounded-xl"
          >
            Join {trackLabel} WhatsApp
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
    </div>,
    document.body,
  );
}
