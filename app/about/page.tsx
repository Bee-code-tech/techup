import type { Metadata } from "next";
import { AboutFaqCta } from "@/components/sections/about/AboutFaqCta";
import {
  AboutBody,
  AboutHero,
} from "@/components/sections/about/AboutSections";
import { FaqJsonLd } from "@/components/seo/FaqJsonLd";
import { createPageMetadata } from "@/lib/seo";
import { aboutFaqs, pageSeo } from "@/lib/site";

export const metadata: Metadata = createPageMetadata(pageSeo.about);

export default function AboutPage() {
  return (
    <>
      <FaqJsonLd faqs={aboutFaqs} />
      <AboutHero />
      <AboutBody />
      <AboutFaqCta />
    </>
  );
}
