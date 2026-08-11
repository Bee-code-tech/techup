"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

type ButtonVariant = "primary" | "secondary" | "orange" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-navy text-white hover:bg-navy-deep shadow-brand",
  secondary:
    "bg-white text-navy border border-navy/20 hover:border-navy/40 hover:bg-surface-blue",
  orange: "bg-orange text-white hover:brightness-105 shadow-orange",
  ghost:
    "bg-transparent text-navy border border-navy hover:bg-navy hover:text-white",
  outline:
    "bg-transparent text-navy border border-navy/25 hover:border-navy hover:bg-surface-blue",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-11 px-5 text-sm sm:h-12 sm:px-6 sm:text-base",
};

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsButton = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = CommonProps & {
  href: string;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

function bindHover(el: HTMLElement | null) {
  if (!el || prefersReducedMotion()) return;
  gsap.to(el, { scale: 1.035, duration: 0.25, ease: "power2.out" });
}

function bindLeave(el: HTMLElement | null) {
  if (!el || prefersReducedMotion()) return;
  gsap.to(el, { scale: 1, duration: 0.25, ease: "power2.out" });
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonAsButton | ButtonAsLink) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold will-change-transform active:scale-98",
    variants[variant],
    sizes[size],
    className,
  );

  if ("href" in props && props.href) {
    const { href, onMouseEnter, onMouseLeave, ...rest } = props;
    return (
      <Link
        href={href}
        className={classes}
        onMouseEnter={(e) => {
          onMouseEnter?.(e);
          bindHover(e.currentTarget);
        }}
        onMouseLeave={(e) => {
          onMouseLeave?.(e);
          bindLeave(e.currentTarget);
        }}
        {...rest}
      >
        {children}
      </Link>
    );
  }

  const buttonProps = props as ButtonAsButton;
  const { onMouseEnter, onMouseLeave, ...rest } = buttonProps;

  return (
    <button
      className={classes}
      onMouseEnter={(e) => {
        onMouseEnter?.(e);
        bindHover(e.currentTarget);
      }}
      onMouseLeave={(e) => {
        onMouseLeave?.(e);
        bindLeave(e.currentTarget);
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
