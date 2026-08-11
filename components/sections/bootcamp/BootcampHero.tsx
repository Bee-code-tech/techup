import { Section } from "@/components/layout/Section";
import { HeroIntro } from "@/components/motion/HeroIntro";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";

export function BootcampHero() {
  return (
    <Section className="bg-hero-fade-soft py-10 sm:py-14 md:py-20">
      <HeroIntro className="grid items-start gap-8 lg:grid-cols-hero-form lg:gap-10">
        <div>
          <div data-hero>
            <Badge tone="orange">Next Cohort: Oct 2026</Badge>
          </div>
          <h1
            data-hero
            className="mt-5 font-display text-hero leading-hero font-bold tracking-tight text-navy sm:mt-6 sm:text-5xl lg:text-6xl"
          >
            Start Your <span className="text-orange">Tech Journey</span> For
            Free
          </h1>
          <p
            data-hero
            className="mt-4 max-w-xl text-sm leading-relaxed text-muted sm:mt-5 sm:text-base md:text-lg"
          >
            Launch your career with Nigeria&apos;s most intensive 2-week coding
            experience. Zero tuition, 100% industry-focused, and designed for
            high-energy talent ready to scale.
          </p>
        </div>

        <form
          data-hero-media
          className="w-full space-y-4 rounded-2xl border border-border bg-white p-5 shadow-card sm:rounded-3xl sm:p-6 md:p-8"
        >
          <h2 className="font-display text-xl font-bold text-navy sm:text-2xl">
            Reserve Your Spot
          </h2>
          <Field label="Full Name">
            <Input placeholder="John Doe" name="fullName" />
          </Field>
          <Field label="Email Address">
            <Input type="email" placeholder="john@example.com" name="email" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Age">
              <Input type="number" placeholder="22" name="age" />
            </Field>
            <Field label="Gender">
              <Select name="gender" defaultValue="">
                <option value="" disabled>
                  Select gender
                </option>
                <option>Female</option>
                <option>Male</option>
                <option>Prefer not to say</option>
              </Select>
            </Field>
          </div>
          <Field label="WhatsApp Number" hint="*required">
            <Input placeholder="+234..." name="whatsapp" />
          </Field>
          <Field label="Educational Level">
            <Select name="education" defaultValue="Undergraduate">
              <option>SSCE / O&apos;Level</option>
              <option>Undergraduate</option>
              <option>Graduate</option>
            </Select>
          </Field>
          <Field label="Laptop Access">
            <Select name="laptop" defaultValue="yes">
              <option value="yes">Yes, I have my own laptop</option>
              <option value="no">No, I need support</option>
            </Select>
          </Field>
          <Field label="Bootcamp Track">
            <Select name="track" defaultValue="uiux">
              <option value="uiux">UI/UX Design</option>
              <option value="web">Web Development</option>
              <option value="data">Data Analytics</option>
            </Select>
          </Field>
          <Button type="submit" className="w-full rounded-xl" size="lg">
            Join Free Bootcamp
          </Button>
          <p className="text-center text-xs text-muted">
            By clicking, you agree to our Terms of Service and Privacy Policy.
          </p>
        </form>
      </HeroIntro>
    </Section>
  );
}
