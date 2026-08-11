import type { Metadata } from "next";
import {
  ContactBody,
  ContactHero,
} from "@/components/sections/contact/ContactSections";
import { createPageMetadata } from "@/lib/seo";
import { pageSeo } from "@/lib/site";

export const metadata: Metadata = createPageMetadata(pageSeo.contact);

export default function ContactPage() {
  return (
    <>
      <ContactHero />
      <ContactBody />
    </>
  );
}
