import type { Metadata } from "next";
import { site } from "@/lib/site";

type PageSeoInput = {
  title: string;
  description: string;
  path: string;
  /** Absolute title for the home page (skips the `%s · Site` template). */
  absoluteTitle?: string;
};

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

  return {
    title: resolvedTitle,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: absoluteTitle ?? `${title} · ${site.name}`,
      description,
      url,
      siteName: site.name,
      locale: site.locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: absoluteTitle ?? `${title} · ${site.name}`,
      description,
    },
  };
}
