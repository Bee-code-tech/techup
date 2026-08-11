import { JsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl } from "@/lib/seo";
import { site } from "@/lib/site";

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        name: site.name,
        url: site.url,
        email: site.email,
        description: site.description,
        logo: absoluteUrl("/favicon.ico"),
        address: {
          "@type": "PostalAddress",
          addressCountry: "NG",
        },
        areaServed: {
          "@type": "Country",
          name: "Nigeria",
        },
      }}
    />
  );
}
