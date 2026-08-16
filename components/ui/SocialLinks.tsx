import { cn } from "@/lib/cn";
import { socialLinks } from "@/lib/site";

type SocialLinksProps = {
  tone?: "light" | "dark";
  className?: string;
};

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4 fill-current">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.829L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4 fill-current">
      <path d="M12 7.2A4.8 4.8 0 1 0 12 16.8 4.8 4.8 0 0 0 12 7.2zm0 7.92A3.12 3.12 0 1 1 12 8.88a3.12 3.12 0 0 1 0 6.24zM17.52 6.96a1.12 1.12 0 1 1-2.24 0 1.12 1.12 0 0 1 2.24 0zM12 2.4c-2.61 0-2.94.01-3.96.06-1.02.05-1.71.21-2.32.45a4.68 4.68 0 0 0-1.7 1.1 4.68 4.68 0 0 0-1.1 1.7c-.24.61-.4 1.3-.45 2.32C2.41 9.06 2.4 9.39 2.4 12s.01 2.94.06 3.96c.05 1.02.21 1.71.45 2.32a4.68 4.68 0 0 0 1.1 1.7 4.68 4.68 0 0 0 1.7 1.1c.61.24 1.3.4 2.32.45 1.02.05 1.35.06 3.96.06s2.94-.01 3.96-.06c1.02-.05 1.71-.21 2.32-.45a4.68 4.68 0 0 0 1.7-1.1 4.68 4.68 0 0 0 1.1-1.7c.24-.61.4-1.3.45-2.32.05-1.02.06-1.35.06-3.96s-.01-2.94-.06-3.96c-.05-1.02-.21-1.71-.45-2.32a4.68 4.68 0 0 0-1.1-1.7 4.68 4.68 0 0 0-1.7-1.1c-.61-.24-1.3-.4-2.32-.45C14.94 2.41 14.61 2.4 12 2.4zm0 1.68c2.56 0 2.87.01 3.88.06.94.04 1.45.2 1.79.33.45.17.77.38 1.1.71.33.33.54.65.71 1.1.13.34.29.85.33 1.79.05 1.01.06 1.32.06 3.88s-.01 2.87-.06 3.88c-.04.94-.2 1.45-.33 1.79-.17.45-.38.77-.71 1.1-.33.33-.65.54-1.1.71-.34.13-.85.29-1.79.33-1.01.05-1.32.06-3.88.06s-2.87-.01-3.88-.06c-.94-.04-1.45-.2-1.79-.33a2.96 2.96 0 0 1-1.1-.71 2.96 2.96 0 0 1-.71-1.1c-.13-.34-.29-.85-.33-1.79-.05-1.01-.06-1.32-.06-3.88s.01-2.87.06-3.88c.04-.94.2-1.45.33-1.79.17-.45.38-.77.71-1.1.33-.33.65-.54 1.1-.71.34-.13.85-.29 1.79-.33 1.01-.05 1.32-.06 3.88-.06z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4 fill-current">
      <path d="M13.5 21v-7.2h2.42l.36-2.8H13.5V9.22c0-.81.22-1.36 1.39-1.36H16.4V5.36A18.7 18.7 0 0 0 14.05 5C11.7 5 10.1 6.43 10.1 9v1.99H7.5v2.8h2.6V21h3.4z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4 fill-current">
      <path d="M6.54 8.75H3.77V20.1h2.77V8.75zM5.15 4C4.2 4 3.4 4.8 3.4 5.76c0 .95.8 1.73 1.76 1.73h.02c.97 0 1.76-.78 1.76-1.73C6.92 4.8 6.14 4 5.15 4zM20.23 13.37c0-3.23-1.72-4.73-4.02-4.73-1.85 0-2.68 1.02-3.14 1.73V8.75H10.3c.04.78 0 11.35 0 11.35h2.77v-6.34c0-.34.02-.68.12-.92.27-.68.89-1.38 1.93-1.38 1.36 0 1.9 1.04 1.9 2.56v6.08h2.77v-6.37z" />
    </svg>
  );
}

const icons = {
  X: XIcon,
  Instagram: InstagramIcon,
  Facebook: FacebookIcon,
  LinkedIn: LinkedInIcon,
} as const;

export function SocialLinks({ tone = "light", className }: SocialLinksProps) {
  return (
    <div className={cn("flex gap-2", className)}>
      {socialLinks.map((link) => {
        const Icon = icons[link.name];
        return (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.name}
            className={cn(
              "flex size-9 items-center justify-center rounded-full transition",
              tone === "dark"
                ? "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
                : "bg-surface text-navy hover:bg-orange-soft hover:text-orange",
            )}
          >
            <Icon />
          </a>
        );
      })}
    </div>
  );
}
