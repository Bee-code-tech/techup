"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/marketing/site-button";
import { cn } from "@/lib/cn";
import { gsap, prefersReducedMotion, registerGsap } from "@/lib/gsap";
import { navLinks, site } from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const ctaHref =
    pathname === "/scholarship" ? site.scholarshipFormUrl : "/bootcamp";
  const ctaLabel =
    pathname === "/scholarship"
      ? "Apply for Scholarship"
      : "Join Free Bootcamp";
  const ctaIsExternal = ctaHref.startsWith("http");

  const closeMenu = () => setOpen(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useGSAP(
    () => {
      registerGsap();
      const root = headerRef.current;
      if (!root || prefersReducedMotion()) return;

      const items = root.querySelectorAll("[data-nav]");
      gsap.fromTo(
        items,
        { opacity: 0, y: -12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.06,
          ease: "power2.out",
          delay: 0.05,
        },
      );
    },
    { scope: headerRef },
  );

  useGSAP(
    () => {
      if (!open || prefersReducedMotion()) return;
      const menu = headerRef.current?.querySelector("[data-mobile-menu]");
      if (!menu) return;
      gsap.fromTo(
        menu.querySelectorAll("a, [data-mobile-cta]"),
        { opacity: 0, x: -12 },
        { opacity: 1, x: 0, duration: 0.35, stagger: 0.05, ease: "power2.out" },
      );
    },
    { dependencies: [open] },
  );

  return (
    <header
      ref={headerRef}
      className={cn(
        "sticky top-0 z-50 border-b backdrop-blur-md transition-all duration-300",
        scrolled
          ? "border-border bg-white/95 shadow-header"
          : "border-border/70 bg-white/90 shadow-none",
      )}
    >
      <Container className="flex h-14 items-center justify-between gap-3 sm:h-16 md:h-18">
        <Link
          href="/"
          data-nav
          className="flex min-w-0 items-center gap-2 sm:gap-2.5"
        >
          <Image
            src="/favicon.ico"
            alt=""
            width={80}
            height={80}
            className="size-8 shrink-0 rounded-full sm:size-9"
            priority
          />
          <span className="truncate font-display text-sm font-bold text-navy sm:text-base md:text-lg">
            {site.name}
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-5 xl:gap-7 lg:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                data-nav
                className={cn(
                  "relative text-sm font-medium transition-colors",
                  active ? "text-orange" : "text-muted-foreground hover:text-navy",
                )}
              >
                {link.label}
                {active ? (
                  <span className="absolute -bottom-1 left-0 h-0.5 w-full rounded-full bg-orange" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:block" data-nav>
          <Button
            href={ctaHref}
            size="sm"
            {...(ctaIsExternal
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
          >
            {ctaLabel}
          </Button>
        </div>

        <button
          type="button"
          data-nav
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border text-navy lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menu</span>
          <div className="space-y-1.5">
            <span
              className={cn(
                "block h-0.5 w-4 bg-current transition",
                open && "translate-y-2 rotate-45",
              )}
            />
            <span
              className={cn(
                "block h-0.5 w-4 bg-current transition",
                open && "opacity-0",
              )}
            />
            <span
              className={cn(
                "block h-0.5 w-4 bg-current transition",
                open && "-translate-y-2 -rotate-45",
              )}
            />
          </div>
        </button>
      </Container>

      {open ? (
        <nav
          data-mobile-menu
          aria-label="Mobile"
          className="max-h-mobile-nav overflow-y-auto border-t border-border bg-white lg:hidden"
        >
          <Container className="flex flex-col gap-1 py-4 pb-6">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className={cn(
                    "rounded-xl px-3 py-3 text-sm font-medium",
                    active ? "bg-orange-soft text-orange" : "text-navy",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <div data-mobile-cta>
              <Button
                href={ctaHref}
                className="mt-2 w-full"
                onClick={closeMenu}
                {...(ctaIsExternal
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {ctaLabel}
              </Button>
            </div>
          </Container>
        </nav>
      ) : null}
    </header>
  );
}
