"use client";

import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger } from "@/components/motion/Stagger";
import { SectionHeading } from "@/components/ui/SectionHeading";

function CalendarIcon() {
  return (
    <svg
      width="80"
      height="88"
      viewBox="0 0 80 88"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="1"
        y="1"
        width="78"
        height="78"
        rx="39"
        stroke="white"
        strokeOpacity="0.2"
        strokeWidth="2"
      />
      <path
        d="M29.5 55C28.675 55 27.9688 54.7062 27.3813 54.1187C26.7938 53.5312 26.5 52.825 26.5 52V31C26.5 30.175 26.7938 29.4688 27.3813 28.8812C27.9688 28.2937 28.675 28 29.5 28H31V25H34V28H46V25H49V28H50.5C51.325 28 52.0312 28.2937 52.6187 28.8812C53.2062 29.4688 53.5 30.175 53.5 31V52C53.5 52.825 53.2062 53.5312 52.6187 54.1187C52.0312 54.7062 51.325 55 50.5 55H29.5ZM29.5 52H50.5V37H29.5V52ZM29.5 34H50.5V31H29.5V34ZM29.5 34V31V34ZM40 43C39.575 43 39.2188 42.8563 38.9312 42.5688C38.6437 42.2812 38.5 41.925 38.5 41.5C38.5 41.075 38.6437 40.7188 38.9312 40.4312C39.2188 40.1437 39.575 40 40 40C40.425 40 40.7812 40.1437 41.0688 40.4312C41.3563 40.7188 41.5 41.075 41.5 41.5C41.5 41.925 41.3563 42.2812 41.0688 42.5688C40.7812 42.8563 40.425 43 40 43ZM34 43C33.575 43 33.2188 42.8563 32.9313 42.5688C32.6438 42.2812 32.5 41.925 32.5 41.5C32.5 41.075 32.6438 40.7188 32.9313 40.4312C33.2188 40.1437 33.575 40 34 40C34.425 40 34.7812 40.1437 35.0688 40.4312C35.3563 40.7188 35.5 41.075 35.5 41.5C35.5 41.925 35.3563 42.2812 35.0688 42.5688C34.7812 42.8563 34.425 43 34 43ZM46 43C45.575 43 45.2188 42.8563 44.9312 42.5688C44.6437 42.2812 44.5 41.925 44.5 41.5C44.5 41.075 44.6437 40.7188 44.9312 40.4312C45.2188 40.1437 45.575 40 46 40C46.425 40 46.7812 40.1437 47.0688 40.4312C47.3563 40.7188 47.5 41.075 47.5 41.5C47.5 41.925 47.3563 42.2812 47.0688 42.5688C46.7812 42.8563 46.425 43 46 43ZM40 49C39.575 49 39.2188 48.8563 38.9312 48.5688C38.6437 48.2812 38.5 47.925 38.5 47.5C38.5 47.075 38.6437 46.7188 38.9312 46.4312C39.2188 46.1437 39.575 46 40 46C40.425 46 40.7812 46.1437 41.0688 46.4312C41.3563 46.7188 41.5 47.075 41.5 47.5C41.5 47.925 41.3563 48.2812 41.0688 48.5688C40.7812 48.8563 40.425 49 40 49ZM34 49C33.575 49 33.2188 48.8563 32.9313 48.5688C32.6438 48.2812 32.5 47.925 32.5 47.5C32.5 47.075 32.6438 46.7188 32.9313 46.4312C33.2188 46.1437 33.575 46 34 46C34.425 46 34.7812 46.1437 35.0688 46.4312C35.3563 46.7188 35.5 47.075 35.5 47.5C35.5 47.925 35.3563 48.2812 35.0688 48.5688C34.7812 48.8563 34.425 49 34 49ZM46 49C45.575 49 45.2188 48.8563 44.9312 48.5688C44.6437 48.2812 44.5 47.925 44.5 47.5C44.5 47.075 44.6437 46.7188 44.9312 46.4312C45.2188 46.1437 45.575 46 46 46C46.425 46 46.7812 46.1437 47.0688 46.4312C47.3563 46.7188 47.5 47.075 47.5 47.5C47.5 47.925 47.3563 48.2812 47.0688 48.5688C46.7812 48.8563 46.425 49 46 49Z"
        fill="white"
      />
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="1"
        y="1"
        width="78"
        height="78"
        rx="39"
        stroke="white"
        strokeOpacity="0.2"
        strokeWidth="2"
      />
      <path
        d="M25 52.75C24.175 52.75 23.4688 52.4562 22.8813 51.8687C22.2938 51.2812 22 50.575 22 49.75H28C27.175 49.75 26.4688 49.4562 25.8812 48.8687C25.2937 48.2812 25 47.575 25 46.75V30.25C25 29.425 25.2937 28.7188 25.8812 28.1313C26.4688 27.5438 27.175 27.25 28 27.25H52C52.825 27.25 53.5313 27.5438 54.1188 28.1313C54.7063 28.7188 55 29.425 55 30.25V46.75C55 47.575 54.7063 48.2812 54.1188 48.8687C53.5313 49.4562 52.825 49.75 52 49.75H58C58 50.575 57.7063 51.2812 57.1188 51.8687C56.5312 52.4562 55.825 52.75 55 52.75H25ZM40 51.25C40.425 51.25 40.7812 51.1063 41.0688 50.8188C41.3563 50.5312 41.5 50.175 41.5 49.75C41.5 49.325 41.3563 48.9688 41.0688 48.6812C40.7812 48.3937 40.425 48.25 40 48.25C39.575 48.25 39.2188 48.3937 38.9312 48.6812C38.6437 48.9688 38.5 49.325 38.5 49.75C38.5 50.175 38.6437 50.5312 38.9312 50.8188C39.2188 51.1063 39.575 51.25 40 51.25ZM28 46.75H52V30.25H28V46.75ZM28 46.75V30.25V46.75Z"
        fill="white"
      />
    </svg>
  );
}

const proofItems = [
  {
    value: "12 Weeks",
    label: "Intensive Bootcamp",
    icon: <CalendarIcon />,
  },
  {
    value: "Real Projects",
    label: "Build Your Portfolio",
    icon: <MonitorIcon />,
  },
  {
    value: "100% Online",
    label: "Learn From Anywhere",
    icon: <MonitorIcon />,
  },
  {
    value: "Career Support",
    label: "CV • Portfolio • Interview Prep",
    icon: <MonitorIcon />,
  },
] as const;

const testimonials = [
  {
    name: "Student",
    track: "Data Analytics",
    initials: "S",
    quote:
      "Before I came across TechUp Academy, I was learning Excel on YouTube without a structured roadmap, and I often felt frustrated. Joining TechUp Academy gave me hands-on experience and mentorship, and today I can confidently work with data.",
  },
  {
    name: "Mercy Akpubor",
    track: "Data Analytics",
    initials: "MA",
    quote:
      "My experience with TechUp Academy has been both engaging and rewarding. The data analytics training is practical, easy to follow, and focused on building real world skills. I have gained hands on experience with Excel and I know before the cohort ends I would be a pro in both POWER BI AND SQL, and the support from the instructors has made learning enjoyable. I am grateful to be part of a community that is committed to helping people grow in tech, and I highly recommend TechUp Academy to anyone looking to build valuable digital skills.",
  },
] as const;

export function HomeProofStrip() {
  return (
    <section className="bg-navy text-white">
      <div className="mx-auto grid w-full max-w-6xl gap-0 px-5 sm:px-6 md:grid-cols-2 md:px-8 lg:grid-cols-4">
        {proofItems.map((item, index) => (
          <Reveal
            key={item.value}
            delay={index * 0.06}
            className="border-white/15 px-6 py-10 text-center md:border-l first:md:border-l-0 lg:min-h-64"
          >
            <div className="mx-auto flex h-22 w-20 items-center justify-center text-white/90">
              {item.icon}
            </div>
            <h3 className="mt-6 font-display text-2xl font-bold leading-tight sm:text-3xl">
              {item.value}
            </h3>
            <p className="mt-3 text-sm text-white/75">{item.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function StudentVoices() {
  return (
    <Section className="bg-surface-blue">
      <div className="flex items-center justify-between gap-4">
        <SectionHeading title="Voices of our Students" className="mx-0 text-left" />
        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            aria-label="Previous testimonial"
            className="flex size-10 items-center justify-center rounded-full border border-navy/20 text-navy transition hover:bg-white"
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Next testimonial"
            className="flex size-10 items-center justify-center rounded-full border border-navy/20 text-navy transition hover:bg-white"
          >
            →
          </button>
        </div>
      </div>

      <Stagger className="mt-8 grid gap-5 sm:mt-12 lg:grid-cols-2">
        {testimonials.map((item) => (
          <article
            key={item.name}
            data-reveal
            className="rounded-[1.75rem] border border-white/70 bg-white/75 p-6 shadow-card backdrop-blur-sm sm:p-7"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-orange/15 font-semibold text-navy">
                {item.initials}
              </div>
              <div>
                <h3 className="font-semibold text-navy">{item.name}</h3>
                <p className="text-sm text-muted">{item.track}</p>
              </div>
            </div>
            <p className="mt-6 text-sm leading-7 text-slate-600 sm:text-base">
              {item.quote}
            </p>
          </article>
        ))}
      </Stagger>
    </Section>
  );
}
