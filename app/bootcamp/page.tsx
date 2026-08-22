import type { Metadata } from "next";
import { TikTokPixel } from "@/components/analytics/TikTokPixel";
import { BootcampBody } from "@/components/sections/bootcamp/BootcampBody";
import { BootcampHero } from "@/components/sections/bootcamp/BootcampHero";
import { JsonLd } from "@/components/seo/JsonLd";
import { createPageMetadata } from "@/lib/seo";
import { pageSeo, site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata(pageSeo.bootcamp);

export default function BootcampPage() {
  return (
    <>
      <TikTokPixel />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Course",
          name: "TechUp Free Bootcamp",
          description: pageSeo.bootcamp.description,
          provider: {
            "@type": "EducationalOrganization",
            name: site.name,
            url: site.url,
          },
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "NGN",
            category: "Free",
          },
          educationalLevel: "Beginner",
        }}
      />
      <BootcampHero />
      <BootcampBody />
    </>
  );
}
