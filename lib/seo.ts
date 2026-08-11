import type { Metadata } from "next";
import { site } from "@/lib/site";

type PageSeoInput = {
  title: string;
  description: string;
  path: string;
  /** Absolute title for the home page (skips the `%s · Site` template). */
  absoluteTitle?: string;
};

export const ogImage = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  alt: site.name,
  type: "image/png",
} as const;

export function absoluteUrl(path = "/") {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${site.url}${normalized === "/" ? "" : normalized}`;
}

export function createPageMetadata({
  title,
  description,
  path,
  absoluteTitle,
}: PageSeoInput): Metadata {
  const url = absoluteUrl(path);
  const resolvedTitle = absoluteTitle
    ? { absolute: absoluteTitle }
    : title;
  const socialTitle = absoluteTitle ?? `${title} · ${site.name}`;

  return {
    title: resolvedTitle,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: socialTitle,
      description,
      url,
      siteName: site.name,
      locale: site.locale,
      type: "website",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [ogImage.url],
    },
  };
}
