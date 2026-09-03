import { Section } from "@/components/layout/Section";
import { HeroIntro } from "@/components/motion/HeroIntro";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger } from "@/components/motion/Stagger";
import { ContactForm } from "@/components/sections/contact/ContactForm";
import { Button } from "@/components/marketing/site-button";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { SocialLinks } from "@/components/marketing/SocialLinks";
import { site } from "@/lib/site";

export function ContactHero() {
  return (
    <Section className="bg-surface-blue pb-6 text-center sm:pb-8 md:pb-10">
      <HeroIntro className="relative">
        <div className="pointer-events-none absolute top-4 left-8 hidden rounded-2xl bg-white/50 p-4 blur-[1px] md:block">
          <div className="h-24 w-20 rounded-xl border border-white/70 bg-white/70" />
        </div>
        <div className="pointer-events-none absolute top-4 right-8 hidden rounded-2xl bg-white/50 p-4 blur-[1px] md:block">
          <div className="h-24 w-20 rounded-xl border border-white/70 bg-white/70" />
        </div>
        <h1
          data-hero
          className="font-display text-hero font-bold tracking-tight text-navy sm:text-5xl"
        >
          Get in Touch
        </h1>
        <p
          data-hero
          className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base md:text-lg"
        >
          Have questions about our programs, scholarships, or partnerships?
          We&apos;re here to help you navigate your digital ascent.
        </p>
      </HeroIntro>
    </Section>
  );
}

export function ContactBody() {
  return (
    <>
      <Section className="bg-surface-blue pt-0">
        <div className="grid gap-5 lg:grid-cols-contact lg:gap-6">
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <article
              data-reveal
              className="rounded-[1.75rem] border border-border bg-white p-6"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-surface-blue text-navy">
                ◐
              </div>
              <h3 className="mt-3 font-semibold text-navy">Chat with Us</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Fastest response time for quick inquiries.
              </p>
              <a
                href={site.whatsappChatUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-orange"
              >
                Message on WhatsApp →
              </a>
            </article>
            <article
              data-reveal
              className="rounded-[1.75rem] border border-border bg-white p-6"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-surface-blue text-navy">
                ✉
              </div>
              <h3 className="mt-3 font-semibold text-navy">Email Us</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                For detailed inquiries and support.
              </p>
              <a
                href={`mailto:${site.email}`}
                className="mt-3 inline-block break-all text-sm font-semibold text-navy"
              >
                {site.email}
              </a>
            </article>
            <article
              data-reveal
              className="rounded-[1.75rem] border border-border bg-white p-6 sm:col-span-2 lg:col-span-1"
            >
              <h3 className="font-semibold text-navy">Follow our journey:</h3>
              <SocialLinks className="mt-3" />
            </article>
          </Stagger>

          <Reveal delay={0.1}>
            <ContactForm />
          </Reveal>
        </div>
      </Section>

      <Section>
        <SectionHeading
          title="Looking for quick answers?"
          subtitle="Check out our frequently asked questions for immediate information about our programs, application process, and technical requirements."
        />
        <Reveal className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:justify-center">
          <Button
            href="/bootcamp"
            variant="ghost"
            className="w-full rounded-xl sm:w-auto"
          >
            Bootcamp FAQs
          </Button>
          <Button
            href="/scholarship"
            variant="ghost"
            className="w-full rounded-xl sm:w-auto"
          >
            Scholarship FAQs
          </Button>
        </Reveal>
      </Section>
    </>
  );
}
