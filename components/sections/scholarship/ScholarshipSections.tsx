import Image from "next/image";
import { Section } from "@/components/layout/Section";
import { HeroIntro } from "@/components/motion/HeroIntro";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger } from "@/components/motion/Stagger";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { site } from "@/lib/site";

const criteria = [
  {
    title: "Nationality & Residency",
    body: "Open to applicants from Nigeria and other countries.",
  },
  {
    title: "Age Requirement",
    body: "Applicants must be 15 years or older.",
  },
  {
    title: "Educational Background",
    body: "Minimum of SSCE/O'Level is preferred, but not strictly required.",
  },
  {
    title: "Interest in Technology",
    body: "Applicants must have a genuine interest in learning and building skills in technology.",
  },
  {
    title: "Commitment to Learning",
    body: "Applicants must be willing to commit to the programme and actively participate throughout the training.",
  },
] as const;

const selectionSteps = [
  "Apply Online",
  "Application Review",
  "Scholarship Offer",
  "Secure Your Slot & Start Learning",
] as const;

const timelineItems = [
  {
    label: "Registration Starts",
    value: "SEPTEMBER 16",
    highlight: true,
  },
  {
    label: "Application Deadline",
    value: "September 28",
    highlight: false,
  },
  {
    label: "Review Period",
    value: "September 29 - 30",
    highlight: false,
  },
  {
    label: "Classes Commencement",
    value: "October 6",
    highlight: false,
  },
] as const;

function TuitionIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="48" height="48" rx="12" fill="#00206F" fillOpacity="0.08" />
      <path
        d="M16 32.5V17.5C16 16.95 16.1958 16.4792 16.5875 16.0875C16.9792 15.6958 17.45 15.5 18 15.5H30C30.55 15.5 31.0208 15.6958 31.4125 16.0875C31.8042 16.4792 32 16.95 32 17.5V32.5L24 29.5L16 32.5ZM18 29.85L24 27.6L30 29.85V17.5H18V29.85Z"
        fill="#00206F"
      />
    </svg>
  );
}

function ToolsIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="48" height="48" rx="12" fill="#FFDBC8" />
      <path
        d="M15.5 31.5V18.5C15.5 17.95 15.6958 17.4792 16.0875 17.0875C16.4792 16.6958 16.95 16.5 17.5 16.5H30.5C31.05 16.5 31.5208 16.6958 31.9125 17.0875C32.3042 17.4792 32.5 17.95 32.5 18.5V31.5C32.5 32.05 32.3042 32.5208 31.9125 32.9125C31.5208 33.3042 31.05 33.5 30.5 33.5H17.5C16.95 33.5 16.4792 33.3042 16.0875 32.9125C15.6958 32.5208 15.5 32.05 15.5 31.5ZM17.5 29.5H30.5V21.5H17.5V29.5ZM17.5 19.5H30.5V18.5H17.5V19.5Z"
        fill="#994700"
      />
    </svg>
  );
}

function MentorshipIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="48" height="48" rx="12" fill="#00464F" fillOpacity="0.08" />
      <path
        d="M15.5 33V31.5C15.5 30.75 15.8625 30.1458 16.5875 29.6875C17.3125 29.2292 18.2833 29 19.5 29C19.6833 29 19.8583 29.0042 20.025 29.0125C20.1917 29.0208 20.35 29.0417 20.5 29.075C20.2833 29.4417 20.1208 29.8333 20.0125 30.25C19.9042 30.6667 19.85 31.1083 19.85 31.575V33H15.5ZM22 33V31.575C22 30.6417 22.4333 29.8958 23.3 29.3375C24.1667 28.7792 25.3 28.5 26.7 28.5C28.1167 28.5 29.2542 28.7792 30.1125 29.3375C30.9708 29.8958 31.4 30.6417 31.4 31.575V33H22ZM33.15 33V31.575C33.15 31.1083 33.1 30.6667 33 30.25C32.9 29.8333 32.75 29.4417 32.55 29.075C32.7 29.0417 32.8542 29.0208 33.0125 29.0125C33.1708 29.0042 33.3333 29 33.5 29C34.7333 29 35.7083 29.2292 36.425 29.6875C37.1417 30.1458 37.5 30.75 37.5 31.5V33H33.15ZM19.5 27.5C18.8667 27.5 18.3333 27.2792 17.9 26.8375C17.4667 26.3958 17.25 25.8667 17.25 25.25C17.25 24.6333 17.4667 24.1042 17.9 23.6625C18.3333 23.2208 18.8667 23 19.5 23C20.15 23 20.6875 23.2208 21.1125 23.6625C21.5375 24.1042 21.75 24.6333 21.75 25.25C21.75 25.8667 21.5375 26.3958 21.1125 26.8375C20.6875 27.2792 20.15 27.5 19.5 27.5ZM33.5 27.5C32.85 27.5 32.3125 27.2792 31.8875 26.8375C31.4625 26.3958 31.25 25.8667 31.25 25.25C31.25 24.6333 31.4625 24.1042 31.8875 23.6625C32.3125 23.2208 32.85 23 33.5 23C34.1333 23 34.6667 23.2208 35.1 23.6625C35.5333 24.1042 35.75 24.6333 35.75 25.25C35.75 25.8667 35.5333 26.3958 35.1 26.8375C34.6667 27.2792 34.1333 27.5 33.5 27.5ZM26.5 26.5C25.7 26.5 25.0208 26.2208 24.4625 25.6625C23.9042 25.1042 23.625 24.4333 23.625 23.65C23.625 22.85 23.9042 22.1708 24.4625 21.6125C25.0208 21.0542 25.7 20.775 26.5 20.775C27.3167 20.775 28.0042 21.0542 28.5625 21.6125C29.1208 22.1708 29.4 22.85 29.4 23.65C29.4 24.4333 29.1208 25.1042 28.5625 25.6625C28.0042 26.2208 27.3167 26.5 26.5 26.5Z"
        fill="#00464F"
      />
    </svg>
  );
}

function PlacementIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="48" height="48" rx="12" fill="#00206F" fillOpacity="0.08" />
      <path
        d="M15.5 33.5V18.5C15.5 17.95 15.6958 17.4792 16.0875 17.0875C16.4792 16.6958 16.95 16.5 17.5 16.5H20.5V15.5C20.5 14.95 20.6958 14.4792 21.0875 14.0875C21.4792 13.6958 21.95 13.5 22.5 13.5H25.5C26.05 13.5 26.5208 13.6958 26.9125 14.0875C27.3042 14.4792 27.5 14.95 27.5 15.5V16.5H30.5C31.05 16.5 31.5208 16.6958 31.9125 17.0875C32.3042 17.4792 32.5 17.95 32.5 18.5V33.5C32.5 34.05 32.3042 34.5208 31.9125 34.9125C31.5208 35.3042 31.05 35.5 30.5 35.5H17.5C16.95 35.5 16.4792 35.3042 16.0875 34.9125C15.6958 34.5208 15.5 34.05 15.5 33.5ZM17.5 33.5H30.5V20.5H17.5V33.5ZM22.5 16.5H25.5V15.5H22.5V16.5Z"
        fill="#00206F"
      />
    </svg>
  );
}

function InclusivityIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M8 28V26.2C8 25.3667 8.41667 24.6875 9.25 24.1625C10.0833 23.6375 11.1667 23.375 12.5 23.375C12.7167 23.375 12.925 23.3833 13.125 23.4C13.325 23.4167 13.5167 23.4417 13.7 23.475C13.4333 23.875 13.2333 24.3 13.1 24.75C12.9667 25.2 12.9 25.675 12.9 26.175V28H8ZM16 28V26.175C16 25.225 16.5583 24.4583 17.675 23.875C18.7917 23.2917 20.2167 23 21.95 23C23.7 23 25.1333 23.2917 26.25 23.875C27.3667 24.4583 27.925 25.225 27.925 26.175V28H16ZM30.1 28V26.175C30.1 25.675 30.0417 25.2 29.925 24.75C29.8083 24.3 29.625 23.875 29.375 23.475C29.5583 23.4417 29.7458 23.4167 29.9375 23.4C30.1292 23.3833 30.3167 23.375 30.5 23.375C31.85 23.375 32.9375 23.6375 33.7625 24.1625C34.5875 24.6875 35 25.3667 35 26.2V28H30.1ZM12.5 21.75C11.7167 21.75 11.0625 21.4875 10.5375 20.9625C10.0125 20.4375 9.75 19.7833 9.75 19C9.75 18.2167 10.0125 17.5625 10.5375 17.0375C11.0625 16.5125 11.7167 16.25 12.5 16.25C13.3 16.25 13.9583 16.5125 14.475 17.0375C14.9917 17.5625 15.25 18.2167 15.25 19C15.25 19.7833 14.9917 20.4375 14.475 20.9625C13.9583 21.4875 13.3 21.75 12.5 21.75ZM30.5 21.75C29.7 21.75 29.0417 21.4875 28.525 20.9625C28.0083 20.4375 27.75 19.7833 27.75 19C27.75 18.2167 28.0083 17.5625 28.525 17.0375C29.0417 16.5125 29.7 16.25 30.5 16.25C31.2833 16.25 31.9375 16.5125 32.4625 17.0375C32.9875 17.5625 33.25 18.2167 33.25 19C33.25 19.7833 32.9875 20.4375 32.4625 20.9625C31.9375 21.4875 31.2833 21.75 30.5 21.75ZM21.75 20.5C20.7833 20.5 19.9688 20.1625 19.3062 19.4875C18.6437 18.8125 18.3125 18 18.3125 17.05C18.3125 16.0833 18.6437 15.2604 19.3062 14.5812C19.9688 13.9021 20.7833 13.5625 21.75 13.5625C22.7333 13.5625 23.5521 13.9021 24.2062 14.5812C24.8604 15.2604 25.1875 16.0833 25.1875 17.05C25.1875 18 24.8604 18.8125 24.2062 19.4875C23.5521 20.1625 22.7333 20.5 21.75 20.5Z"
        fill="white"
      />
    </svg>
  );
}

export function ScholarshipHero() {
  return (
    <Section className="py-10 sm:py-14 md:py-20">
      <HeroIntro className="grid items-center gap-8 lg:grid-cols-2 lg:gap-10">
        <div className="order-2 lg:order-1">
          <div data-hero>
            <Badge tone="orange">2026 Scholarship Cohort</Badge>
          </div>
          <h1
            data-hero
            className="mt-5 font-display text-hero leading-hero font-bold tracking-tight text-navy sm:mt-6 sm:text-5xl"
          >
            Scholarships for the Next Generation of Tech Leaders
          </h1>
          <p
            data-hero
            className="mt-4 max-w-xl text-sm leading-relaxed text-muted sm:mt-5 sm:text-base md:text-lg"
          >
            We are removing financial barriers to empower Nigeria&apos;s
            brightest minds. Gain world-class tech education and accelerate your
            career with 100% funded training.
          </p>
          <div
            data-hero
            className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap"
          >
            <Button
              href={site.scholarshipFormUrl}
              target="_blank"
              rel="noopener noreferrer"
              size="lg"
              className="w-full sm:w-auto"
            >
              Apply Now
            </Button>
            <Button
              href="#eligibility"
              variant="ghost"
              size="lg"
              className="w-full rounded-xl sm:w-auto"
            >
              View Eligibility
            </Button>
          </div>
        </div>
        <div
          data-hero-media
          className="order-1 mx-auto w-full max-w-md lg:order-2 lg:max-w-none"
        >
          <Image
            src="/scholarship.png"
            alt="Scholarship applicant holding a laptop"
            width={803}
            height={1003}
            className="w-full rounded-sm border-4 border-white object-cover shadow-card"
            priority
          />
        </div>
      </HeroIntro>
    </Section>
  );
}

export function ScholarshipBody() {
  return (
    <>
      <Section className="bg-surface-blue">
        <div className="grid gap-8 lg:grid-cols-[1.35fr_0.85fr] lg:items-stretch lg:gap-10">
          <Reveal className="flex flex-col justify-center">
            <h2 className="font-display text-3xl font-bold text-navy sm:text-4xl">
              Empowering Dreams through{" "}
              <span className="sm:block">Tech Skills</span>
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-muted sm:leading-8 sm:text-base">
              The TechUp Academy Scholarship Fund is designed to identify and
              support exceptional talent who lack the financial means to access
              premium tech training. Our goal is to train Nigerians over time,
              creating a ripple effect of innovation across the continent.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 sm:gap-8">
              <div className="border-l-4 border-orange pl-4">
                <p className="font-display text-3xl font-bold text-navy sm:text-4xl">
                  ₦2M+
                </p>
                <p className="mt-2 text-sm text-muted">Fund Committed</p>
              </div>
              <div className="border-l-4 border-orange pl-4">
                <p className="font-display text-3xl font-bold text-navy sm:text-4xl">
                  100
                </p>
                <p className="mt-2 text-sm text-muted">Scholars Trained</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="h-full">
            <div className="flex h-full flex-col justify-end rounded-3xl bg-navy p-6 text-white sm:rounded-4xl sm:p-9">
              <InclusivityIcon />
              <h3 className="mt-6 font-display text-2xl font-bold sm:mt-8 sm:text-3xl">
                Inclusivity First
              </h3>
              <p className="mt-3 text-sm leading-7 text-white/75 sm:mt-4">
                We prioritize underrepresented groups in tech, ensuring equitable
                access regardless of background or gender.
              </p>
            </div>
          </Reveal>
        </div>

        <div className="mt-12 sm:mt-16 md:mt-20">
          <SectionHeading
            title="What Sets TechUp Academy Apart"
            subtitle="Everything you need to launch your tech career with confidence."
          />

          <Stagger className="mt-8 grid gap-4 sm:mt-10 sm:gap-5 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2">
            <article
              data-reveal
              className="flex flex-col justify-end rounded-3xl bg-white p-5 shadow-card sm:min-h-80 sm:rounded-4xl sm:p-8 lg:row-span-2"
            >
              <TuitionIcon />
              <h3 className="mt-5 font-display text-xl font-bold text-navy sm:text-2xl">
                Full Tuition Coverage
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted">
                Complete coverage of course fees so exceptional talent can focus
                on learning, not finances.
              </p>
            </article>

            <article
              data-reveal
              className="rounded-3xl bg-white p-5 shadow-card sm:rounded-4xl sm:p-7 lg:col-span-2"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
                <div className="shrink-0">
                  <ToolsIcon />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-navy">
                    Modern Tools & Software
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-muted">
                    Train with Figma, Adobe Creative Cloud, GitHub Pro, and modern
                    analytics stacks used in real product teams.
                  </p>
                </div>
              </div>
            </article>

            <article
              data-reveal
              className="rounded-3xl bg-white p-5 shadow-card sm:rounded-4xl sm:p-7"
            >
              <MentorshipIcon />
              <h3 className="mt-5 font-display text-xl font-bold text-navy">
                1-on-1 Mentorship
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted">
                Weekly sessions with industry leads who review your progress and
                unblock growth.
              </p>
            </article>

            <article
              data-reveal
              className="rounded-3xl bg-white p-5 shadow-card sm:rounded-4xl sm:p-7"
            >
              <PlacementIcon />
              <h3 className="mt-5 font-display text-xl font-bold text-navy">
                Job Placement
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted">
                Direct pathways into internships and full-time roles with partner
                companies.
              </p>
            </article>
          </Stagger>
        </div>
      </Section>

      <Section id="eligibility" className="overflow-x-clip bg-navy text-white">
        <div className="grid items-center gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
          <Reveal className="relative pb-10 sm:pb-8 lg:pb-6">
            <Image
              src="/look.png"
              alt="Scholarship applicants collaborating on a laptop"
              width={750}
              height={625}
              className="w-full rounded-xl object-cover"
            />
            <div className="absolute right-3 bottom-0 max-w-[min(100%-1.5rem,15rem)] translate-y-1/3 rounded-2xl bg-white p-3.5 text-navy shadow-card sm:right-4 sm:max-w-60 sm:p-5 lg:-right-2 lg:bottom-4 lg:translate-y-0">
              <p className="text-sm leading-6 italic">
                &ldquo;The scholarship changed my life.&rdquo;
              </p>
              <p className="mt-2 text-xs font-semibold text-muted">
                — Sarah A., 2024 Scholar
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h2 className="font-display text-2xl font-bold sm:text-3xl md:text-4xl">
              Who are we looking for?
            </h2>
            <ul className="mt-6 space-y-4 sm:mt-8 sm:space-y-5">
              {criteria.map((item) => (
                <li key={item.title} className="flex gap-3">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-navy">
                    ✓
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-base font-bold text-white">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-white/75 sm:leading-7">
                      {item.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Section>

      <Section className="bg-white">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <Reveal>
            <h2 className="font-display text-2xl font-bold text-navy sm:text-3xl md:text-4xl">
              Selection Process
            </h2>
            <p className="mt-3 max-w-md text-sm leading-7 text-muted sm:text-base">
              Our rigorous selection ensures we find the most deserving
              candidates.
            </p>

            <div className="relative mt-8">
              <div className="absolute top-4.5 bottom-4.5 left-4.5 w-0.5 -translate-x-1/2 bg-navy" />
              <div className="space-y-5 sm:space-y-6">
                {selectionSteps.map((step, index) => (
                  <div key={step} className="relative flex items-center gap-3 sm:gap-4">
                    <span className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-white shadow-[0_0_0_5px_#fff,0_4px_14px_rgba(0,32,111,0.28)]">
                      {index + 1}
                    </span>
                    <p className="min-w-0 font-display text-sm font-bold text-navy sm:text-base md:text-lg">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h3 className="font-display text-xl font-bold text-navy sm:text-2xl md:text-3xl">
              Application Timeline
            </h3>
            <div className="mt-6 space-y-5 sm:mt-8 sm:space-y-6">
              {timelineItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-start justify-between gap-3 sm:items-center sm:gap-4"
                >
                  <p className="min-w-0 text-sm font-medium text-muted sm:text-base">
                    {item.label}
                  </p>
                  {item.highlight ? (
                    <span className="shrink-0 rounded-full bg-orange px-2.5 py-1 text-2xs font-semibold tracking-wide text-white uppercase sm:px-3">
                      {item.value}
                    </span>
                  ) : (
                    <span className="shrink-0 text-right text-sm font-semibold text-navy sm:text-base">
                      {item.value}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="mt-10 sm:mt-12">
          <Button
            href={site.scholarshipFormUrl}
            size="lg"
            className="w-full sm:w-auto"
          >
            Apply Now
          </Button>
        </div>
      </Section>
    </>
  );
}
