import { DisciplineStrip } from "@/components/sections/home/DisciplineStrip";
import { FeaturedCourses } from "@/components/sections/home/FeaturedCourses";
import { HomeFaqCta } from "@/components/sections/home/HomeFaqCta";
import { HomeHero } from "@/components/sections/home/HomeHero";
import {
  HomeProofStrip,
  StudentVoices,
} from "@/components/sections/home/HomeProofSections";
import { KickstartJourney } from "@/components/sections/home/KickstartJourney";
import { WhyTechUp } from "@/components/sections/home/WhyTechUp";
import { FaqJsonLd } from "@/components/seo/FaqJsonLd";
import { createPageMetadata } from "@/lib/seo";
import { homeFaqs, pageSeo } from "@/lib/site";

export const metadata = createPageMetadata({
  ...pageSeo.home,
  absoluteTitle: pageSeo.home.title,
});

export default function HomePage() {
  return (
    <>
      <FaqJsonLd faqs={homeFaqs} />
      <HomeHero />
      <DisciplineStrip />
      <WhyTechUp />
      <KickstartJourney />
      <FeaturedCourses />
      <HomeProofStrip />
      <StudentVoices />
      <HomeFaqCta />
    </>
  );
}
