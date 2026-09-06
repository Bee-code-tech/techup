import { Section } from "@/components/layout/Section";
import { HeroIntro } from "@/components/motion/HeroIntro";
import { Badge } from "@/components/marketing/Badge";
import { Button } from "@/components/marketing/site-button";

export function BootcampHero() {
  return (
    <Section className="bg-hero-fade-soft py-10 sm:py-14 md:py-20">
      <HeroIntro className="max-w-3xl">
        <div data-hero>
          <Badge tone="orange">Next Cohort: Oct 2026</Badge>
        </div>
        <h1
          data-hero
          className="mt-5 font-display text-hero leading-hero font-bold tracking-tight text-navy sm:mt-6 sm:text-5xl lg:text-6xl"
        >
          Start Your <span className="text-orange">Tech Journey</span> For Free
        </h1>
        <p
          data-hero
          className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:mt-5 sm:text-base md:text-lg"
        >
          Launch your career with Nigeria&apos;s most intensive 2-week coding
          experience. Zero tuition, 100% industry-focused, and designed for
          high-energy talent ready to scale.
        </p>
        <div data-hero className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row">
          <Button href="/auth?mode=register" size="lg" className="w-full sm:w-auto">
            Join Free Bootcamp
          </Button>
          <Button
            href="/auth"
            size="lg"
            variant="secondary"
            className="w-full sm:w-auto"
          >
            Already registered? Log in
          </Button>
        </div>
      </HeroIntro>
    </Section>
  );
}
