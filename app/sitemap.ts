import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { pageSeo } from "@/lib/site";

const routes = Object.values(pageSeo);

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routes.map((page) => ({
    url: absoluteUrl(page.path),
    lastModified,
    changeFrequency: page.path === "/" ? "weekly" : "monthly",
    priority: page.path === "/" ? 1 : 0.8,
  }));
}
