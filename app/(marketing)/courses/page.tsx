import type { Metadata } from "next";
import { CoursesFaqCta } from "@/components/sections/courses/CoursesFaqCta";
import {
  CoursesCatalog,
  CoursesHero,
} from "@/components/sections/courses/CoursesSections";
import { FaqJsonLd } from "@/components/seo/FaqJsonLd";
import { JsonLd } from "@/components/seo/JsonLd";
import { createPageMetadata } from "@/lib/seo";
import { courses, coursesFaqs, pageSeo, site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata(pageSeo.courses);

export default function CoursesPage() {
  return (
    <>
      <FaqJsonLd faqs={coursesFaqs} />
      <JsonLd
        data={courses.map((course) => ({
          "@context": "https://schema.org",
          "@type": "Course",
          name: course.title,
          description: course.description,
          provider: {
            "@type": "EducationalOrganization",
            name: site.name,
            url: site.url,
          },
          offers: {
            "@type": "Offer",
            price: course.price.replace(/[^\d.]/g, ""),
            priceCurrency: "NGN",
            category: course.category,
          },
          timeRequired: course.duration,
        }))}
      />
      <CoursesHero />
      <CoursesCatalog />
      <CoursesFaqCta />
    </>
  );
}
