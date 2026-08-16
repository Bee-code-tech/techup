import Image from "next/image";
import { Section } from "@/components/layout/Section";
import { Float } from "@/components/motion/Float";
import { HeroIntro } from "@/components/motion/HeroIntro";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MediaBox } from "@/components/ui/MediaBox";
import { site } from "@/lib/site";

function SuccessStoryIcon() {
  return (
    <svg
      width="34"
      height="47"
      viewBox="0 0 34 47"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="1.57046"
        width="32"
        height="44.9994"
        rx="8"
        transform="rotate(2 1.57046 0)"
        fill="#FB7800"
      />
      <path
        d="M14.5153 21.1605L15.4892 18.3427L13.2552 16.4136L16.1035 16.5131L17.1006 13.7462L17.9024 16.5759L20.7506 16.6753L18.3625 18.4431L19.1375 21.3219L16.9008 19.4677L14.5153 21.1605ZM10.518 30.3265L10.7876 22.6062C10.1791 21.8846 9.71562 21.0679 9.39725 20.1562C9.07887 19.2446 8.93742 18.2807 8.9729 17.2647C9.05084 15.0327 9.89139 13.1692 11.4945 11.6743C13.0977 10.1793 15.0153 9.47079 17.2472 9.54873C19.4792 9.62667 21.3427 10.4672 22.8376 12.0704C24.3326 13.6735 25.0411 15.5911 24.9632 17.8231C24.9277 18.8391 24.7193 19.7907 24.3381 20.678C23.9569 21.5652 23.4377 22.3476 22.7803 23.025L22.5107 30.7453L16.5841 28.5372L10.518 30.3265ZM16.7586 23.5402C18.4243 23.5984 19.8604 23.0648 21.0671 21.9396C22.2738 20.8143 22.9062 19.4189 22.9644 17.7533C23.0225 16.0876 22.489 14.6514 21.3638 13.4448C20.2385 12.2381 18.8431 11.6057 17.1774 11.5475C15.5118 11.4893 14.0756 12.0229 12.8689 13.1481C11.6623 14.2734 11.0298 15.6688 10.9717 17.3345C10.9135 19.0001 11.4471 20.4363 12.5723 21.6429C13.6975 22.8496 15.093 23.482 16.7586 23.5402Z"
        fill="white"
      />
    </svg>
  );
}

export function HomeHero() {
  return (
    <Section className="overflow-hidden bg-hero-fade py-10 sm:py-14 md:py-20">
      <HeroIntro className="grid items-center gap-10 md:gap-12 lg:grid-cols-hero">
        <div className="order-2 lg:order-1">
          <div data-hero>
            <Badge>Now Enrolling for September Cohort</Badge>
          </div>
          <h1
            data-hero
            className="mt-5 font-display text-hero leading-hero font-bold tracking-tight text-navy sm:mt-6 sm:text-5xl lg:text-6xl"
          >
            Master Tech Skills,
            <span className="mt-1 block text-orange">Build Your Future</span>
          </h1>
          <p
            data-hero
            className="mt-4 max-w-xl text-sm leading-relaxed text-muted sm:mt-5 sm:text-base md:text-lg"
          >
            Equipping the next generation of African tech talent with
            industry-standard practical skills, world-class mentorship, and a
            thriving community.
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
              Apply For Scholarship
            </Button>
            <Button
              href="/courses"
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
            >
              Enroll Now
            </Button>
          </div>
          <div data-hero className="mt-8 flex items-center gap-3 sm:mt-10">
            <div className="flex shrink-0 -space-x-3">
              {[1, 2, 3].map((i) => (
                <MediaBox
                  key={i}
                  label=""
                  className="size-9 rounded-full border-2 border-white sm:size-10"
                />
              ))}
              <span className="flex size-9 items-center justify-center rounded-full border-2 border-white bg-orange text-2xs font-bold text-white sm:size-10">
                100+
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-navy">
                100+ Students Registered
              </p>
              <p className="text-xs text-muted">Across Nigeria & Africa</p>
            </div>
          </div>
        </div>

        <div className="relative order-1 mx-auto w-full max-w-sm sm:max-w-md lg:order-2 lg:max-w-none">
          <div
            className="pointer-events-none absolute -top-10 -right-12 z-0 size-64 rounded-full bg-orange/10"
            style={{ filter: "blur(32px)" }}
            aria-hidden="true"
          />
          <div data-hero-media>
            <Float className="relative z-10 md:rotate-2">
              <div className="overflow-hidden rounded-2xl border-4 border-white shadow-hero sm:border-8">
                <Image
                  src="/hero.png"
                  alt="TechUp Academy students in the hero section"
                  width={1064}
                  height={1330}
                  className="h-auto w-full object-cover"
                  priority
                />
              </div>
            </Float>
          </div>
          <div
            data-hero
            className="absolute right-3 bottom-4 left-3 z-20 rounded-[1.75rem] border border-white/70 bg-white/55 p-4 shadow-xl backdrop-blur-xl sm:right-auto sm:bottom-6 sm:left-4 sm:w-[20rem] sm:p-5"
          >
            <div className="flex items-start gap-3.5">
              <span className="shrink-0">
                <SuccessStoryIcon />
              </span>
              <div className="min-w-0">
                <p className="text-micro font-bold tracking-wide text-navy uppercase sm:text-xs">
                  Success Story
                </p>
                <p className="mt-1.5 text-sm leading-6 text-slate-700">
                  &ldquo;TechUp changed my life path.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </HeroIntro>
    </Section>
  );
}
