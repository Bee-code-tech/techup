import Image from "next/image";
import { Section } from "@/components/layout/Section";
import { Stagger } from "@/components/motion/Stagger";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { site } from "@/lib/site";

const paths = [
  {
    title: "Foundation Tech Bootcamp",
    description:
      "A high-impact, two-week intensive introduction to tech fundamentals. Perfect for those looking to test the waters before committing to a full career pivot.",
    badge: "BOOTCAMP",
    badgeTone: "orange" as const,
    cta: "Register Now",
    href: "/bootcamp",
    solid: false,
    image: "/journey.png",
  },
  {
    title: "New Cohort",
    description:
      "Our comprehensive 12-week program. Master full-stack development, UI/UX design, or Data Analytics with deep-dive projects and career coaching.",
    badge: "NEW COHORT",
    badgeTone: "navy" as const,
    cta: "Join Cohort",
    href: "/courses",
    solid: true,
    image: "/journey-cohort.jpg",
  },
  {
    title: "Scholarship Program",
    description:
      "Fully-funded 3-month specialized tracks for top-tier talent looking to specialize in Cloud Engineering or AI. Includes job placement support.",
    badge: "SCHOLARSHIP",
    badgeTone: "orange" as const,
    cta: "Apply Now",
    href: site.scholarshipFormUrl,
    solid: false,
    image: "/journey-scholarship.jpg",
  },
];

export function KickstartJourney() {
  return (
    <Section className="bg-surface-blue">
      <SectionHeading
        title="Kickstart Your Journey"
        subtitle="Choose the path that fits your current goals and budget."
      />
      <Stagger className="mt-8 grid gap-5 sm:mt-12 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {paths.map((path) => (
          <article
            key={path.title}
            data-reveal
            className="overflow-hidden rounded-2xl border border-border bg-white md:last:col-span-2 lg:last:col-span-1"
          >
            <div className="relative">
              <Image
                src={path.image}
                alt={`${path.title} preview image`}
                width={1400}
                height={900}
                className="aspect-wide w-full border-b border-border object-cover"
              />
              <span
                className={`absolute top-3 right-3 rounded-full px-3 py-1 text-2xs font-bold tracking-wide text-white uppercase ${
                  path.badgeTone === "orange" ? "bg-orange" : "bg-navy"
                }`}
              >
                {path.badge}
              </span>
            </div>
            <div className="p-5 sm:p-6">
              <h3 className="font-display text-lg font-bold text-navy sm:text-xl">
                {path.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {path.description}
              </p>
              <Button
                href={path.href}
                variant={path.solid ? "primary" : "ghost"}
                className="mt-5 w-full rounded-xl sm:mt-6"
                {...(path.href.startsWith("http")
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {path.cta}
              </Button>
            </div>
          </article>
        ))}
      </Stagger>
    </Section>
  );
}
