"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { Container } from "@/components/layout/Container";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { gsap, prefersReducedMotion, registerGsap } from "@/lib/gsap";
import { site } from "@/lib/site";

const columns = [
  {
    title: "Programs",
    links: [
      { href: "/bootcamp", label: "Free Bootcamp" },
      { href: "/scholarship", label: "Scholarships" },
      { href: "/courses", label: "Advanced Courses" },
      { href: "/about", label: "Mentorship Only" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/about", label: "Success Stories" },
      { href: "/contact", label: "Career Blog" },
      { href: "/contact", label: "Hiring Partners" },
      { href: "/contact", label: "FAQ" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/contact", label: "Privacy Policy" },
      { href: "/contact", label: "Terms of Service" },
      { href: "/contact", label: "Contact Support" },
    ],
  },
] as const;

export function SiteFooter() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const root = ref.current;
      if (!root || prefersReducedMotion()) return;

      gsap.fromTo(
        root.querySelectorAll("[data-footer]"),
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: root,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        },
      );
    },
    { scope: ref },
  );

  return (
    <footer ref={ref} className="bg-navy text-white">
      <Container className="grid gap-10 py-12 sm:py-14 md:grid-cols-2 lg:grid-cols-footer">
        <div className="md:col-span-2 lg:col-span-1" data-footer>
          <div className="flex items-center gap-2.5">
            <Image
              src="/favicon.ico"
              alt=""
              width={80}
              height={80}
              className="size-9 shrink-0 rounded-full"
            />
            <span className="font-display text-base font-bold sm:text-lg">
              {site.name}
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
            {site.tagline}
          </p>
          <SocialLinks tone="dark" className="mt-5" />
        </div>

        <nav
          aria-label="Footer"
          className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-2 lg:col-span-3 lg:grid-cols-3"
        >
          {columns.map((column) => (
            <div key={column.title} data-footer>
              <h3 className="text-sm font-semibold tracking-wide uppercase">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/70 transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </Container>
      <div className="border-t border-white/10" data-footer>
        <Container className="flex flex-col gap-2 py-5 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p>Built for Nigeria&apos;s next generation of tech talent.</p>
        </Container>
      </div>
    </footer>
  );
}
