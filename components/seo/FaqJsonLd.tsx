import { JsonLd } from "@/components/seo/JsonLd";

type FaqItem = {
  q: string;
  a: string;
};

export function FaqJsonLd({ faqs }: { faqs: readonly FaqItem[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.a,
          },
        })),
      }}
    />
  );
}
