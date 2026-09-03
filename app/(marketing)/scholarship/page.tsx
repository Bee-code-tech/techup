import type { Metadata } from "next";
import {
  ScholarshipBody,
  ScholarshipHero,
} from "@/components/sections/scholarship/ScholarshipSections";
import { createPageMetadata } from "@/lib/seo";
import { pageSeo } from "@/lib/site";

export const metadata: Metadata = createPageMetadata(pageSeo.scholarship);

export default function ScholarshipPage() {
  return (
    <>
      <ScholarshipHero />
      <ScholarshipBody />
    </>
  );
}
