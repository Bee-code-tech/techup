import Image from "next/image";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { Section } from "@/components/layout/Section";
import { HeroIntro } from "@/components/motion/HeroIntro";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger } from "@/components/motion/Stagger";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { experts } from "@/lib/site";

const tinlabHighlights = [
  "Project Incubation",
  "Industry Partnerships",
  "Career Acceleration",
] as const;

function VisionAesthetic() {
  return (
    <svg
      width="182"
      height="150"
      viewBox="0 0 182 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="pointer-events-none absolute -top-2 -right-2 h-auto w-36 sm:w-44"
    >
      <g opacity="0.2">
        <path
          d="M90.6667 96C97.3333 96 103 93.6667 107.667 89C112.333 84.3333 114.667 78.6667 114.667 72C114.667 65.3333 112.333 59.6667 107.667 55C103 50.3333 97.3333 48 90.6667 48C84 48 78.3333 50.3333 73.6667 55C69 59.6667 66.6667 65.3333 66.6667 72C66.6667 78.6667 69 84.3333 73.6667 89C78.3333 93.6667 84 96 90.6667 96ZM90.6667 86.4C86.6667 86.4 83.2667 85 80.4667 82.2C77.6667 79.4 76.2667 76 76.2667 72C76.2667 68 77.6667 64.6 80.4667 61.8C83.2667 59 86.6667 57.6 90.6667 57.6C94.6667 57.6 98.0667 59 100.867 61.8C103.667 64.6 105.067 68 105.067 72C105.067 76 103.667 79.4 100.867 82.2C98.0667 85 94.6667 86.4 90.6667 86.4ZM90.6667 112C77.6889 112 65.8667 108.378 55.2 101.133C44.5333 93.8889 36.8 84.1778 32 72C36.8 59.8222 44.5333 50.1111 55.2 42.8667C65.8667 35.6222 77.6889 32 90.6667 32C103.644 32 115.467 35.6222 126.133 42.8667C136.8 50.1111 144.533 59.8222 149.333 72C144.533 84.1778 136.8 93.8889 126.133 101.133C115.467 108.378 103.644 112 90.6667 112ZM90.6667 101.333C100.711 101.333 109.933 98.6889 118.333 93.4C126.733 88.1111 133.156 80.9778 137.6 72C133.156 63.0222 126.733 55.8889 118.333 50.6C109.933 45.3111 100.711 42.6667 90.6667 42.6667C80.6222 42.6667 71.4 45.3111 63 50.6C54.6 55.8889 48.1778 63.0222 43.7333 72C48.1778 80.9778 54.6 88.1111 63 93.4C71.4 98.6889 80.6222 101.333 90.6667 101.333Z"
          fill="#8EA6FF"
        />
      </g>
    </svg>
  );
}

function MissionAesthetic() {
  return (
    <svg
      width="182"
      height="188"
      viewBox="0 0 182 188"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="pointer-events-none absolute -top-4 -right-2 h-auto w-36 sm:w-44"
    >
      <g opacity="0.2">
        <path
          d="M134.455 53.5622C134.346 51.7767 133.588 50.0927 132.323 48.8279C131.058 47.5631 129.374 46.8049 127.589 46.6964C121.831 46.3531 107.115 46.8795 94.9034 59.0868L92.7292 61.2884H66.0305C65.0651 61.283 64.1082 61.4696 63.2156 61.8373C62.3229 62.2051 61.5123 62.7467 60.8309 63.4306L45.1311 79.1394C44.1683 80.1016 43.4927 81.3131 43.1801 82.6379C42.8675 83.9626 42.9303 85.3483 43.3615 86.6394C43.7926 87.9305 44.5751 89.0759 45.621 89.947C46.6669 90.8181 47.9349 91.3805 49.2826 91.5711L66.891 94.029L87.1268 114.265L89.5847 131.882C89.7737 133.23 90.336 134.498 91.2079 135.543C92.0798 136.588 93.2267 137.369 94.5189 137.796C95.2715 138.047 96.0598 138.176 96.8533 138.176C97.8141 138.178 98.7657 137.989 99.6534 137.622C100.541 137.254 101.347 136.714 102.025 136.034L117.734 120.334C118.418 119.653 118.96 118.842 119.328 117.949C119.695 117.057 119.882 116.1 119.876 115.134V88.4357L122.06 86.2524C134.272 74.0405 134.798 59.3248 134.455 53.5622ZM66.0305 68.6119H85.4057L67.3121 86.7009L50.3033 84.33L66.0305 68.6119ZM100.089 64.2865C103.608 60.7462 107.841 57.9975 112.507 56.2239C117.173 54.4503 122.163 53.6926 127.145 54.0016C127.466 58.986 126.716 63.9814 124.946 68.652C123.176 73.3227 120.427 77.5603 116.883 81.0802L90.5825 107.371L73.7934 90.5824L100.089 64.2865ZM112.553 115.134L96.8395 130.862L94.464 113.848L112.553 95.7592V115.134ZM78.6086 119.483C76.5489 123.996 69.6602 134.523 50.3033 134.523C49.3322 134.523 48.4008 134.138 47.7141 133.451C47.0274 132.764 46.6416 131.833 46.6416 130.862C46.6416 111.505 57.1691 104.616 61.6822 102.552C62.1198 102.352 62.5924 102.241 63.0731 102.224C63.5537 102.207 64.033 102.285 64.4835 102.453C64.934 102.621 65.347 102.877 65.6988 103.205C66.0507 103.533 66.3345 103.927 66.534 104.364C66.7336 104.802 66.845 105.274 66.8619 105.755C66.8788 106.236 66.8009 106.715 66.6326 107.166C66.4643 107.616 66.2089 108.029 65.881 108.381C65.5531 108.733 65.1591 109.017 64.7215 109.216C61.7783 110.557 55.2833 114.873 54.139 127.026C66.2914 125.882 70.6169 119.387 71.9488 116.443C72.1484 116.006 72.4322 115.612 72.784 115.284C73.1358 114.956 73.5488 114.701 73.9993 114.532C74.4499 114.364 74.9291 114.286 75.4098 114.303C75.8904 114.32 76.363 114.431 76.8006 114.631C77.2382 114.83 77.6322 115.114 77.9601 115.466C78.288 115.818 78.5434 116.231 78.7118 116.681C78.8801 117.132 78.958 117.611 78.9411 118.092C78.9242 118.573 78.8128 119.045 78.6132 119.483H78.6086Z"
          fill="#8EA6FF"
        />
      </g>
    </svg>
  );
}

function RegisteredEntityIcon() {
  return (
    <svg
      width="64"
      height="72"
      viewBox="0 0 64 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="64" height="64" rx="32" fill="#E0E3E5" />
      <path
        d="M27.75 45.125L25.375 41.125L20.875 40.125L21.3125 35.5L18.25 32L21.3125 28.5L20.875 23.875L25.375 22.875L27.75 18.875L32 20.6875L36.25 18.875L38.625 22.875L43.125 23.875L42.6875 28.5L45.75 32L42.6875 35.5L43.125 40.125L38.625 41.125L36.25 45.125L32 43.3125L27.75 45.125ZM28.8125 41.9375L32 40.5625L35.25 41.9375L37 38.9375L40.4375 38.125L40.125 34.625L42.4375 32L40.125 29.3125L40.4375 25.8125L37 25.0625L35.1875 22.0625L32 23.4375L28.75 22.0625L27 25.0625L23.5625 25.8125L23.875 29.3125L21.5625 32L23.875 34.625L23.5625 38.1875L27 38.9375L28.8125 41.9375ZM30.6875 36.4375L37.75 29.375L36 27.5625L30.6875 32.875L28 30.25L26.25 32L30.6875 36.4375Z"
        fill="#00206F"
      />
    </svg>
  );
}

export function AboutHero() {
  return (
    <Section className="bg-surface-blue py-10 sm:py-14 md:py-20">
      <HeroIntro className="grid items-center gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
        <div className="order-2 lg:order-1">
          <div data-hero>
            <Badge>Our Story</Badge>
          </div>
          <h1
            data-hero
            className="mt-5 max-w-2xl font-display text-hero leading-hero font-bold tracking-tight text-navy sm:mt-6 sm:text-5xl"
          >
            Empowering Nigeria&apos;s Digital Ascent
          </h1>
          <p
            data-hero
            className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:mt-5 sm:text-base md:text-lg"
          >
            TechUp Academy is a Nigerian ed-tech platform dedicated to equipping
            beginners with practical, industry-relevant digital skills,
            mentorship, and community that compounds over a career.
          </p>
        </div>
        <div
          data-hero-media
          className="relative order-1 overflow-hidden rounded-[1.75rem] shadow-card lg:order-2"
        >
          <Image
            src="/team.png"
            alt="TechUp Academy team members"
            width={588}
            height={523}
            className="w-full object-cover"
            priority
          />
          <div className="absolute inset-0 bg-bootcamp-overlay" />
        </div>
      </HeroIntro>
    </Section>
  );
}

export function AboutBody() {
  return (
    <>
      <Section>
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div className="grid gap-6 sm:gap-8">
            <Reveal className="relative overflow-hidden rounded-[2rem] bg-navy p-8 text-white sm:p-10 md:p-12">
              <VisionAesthetic />
              <div className="relative z-10 max-w-xl pr-8 sm:pr-14">
                <h2 className="font-display text-3xl font-bold">Our Vision</h2>
                <p className="mt-5 text-sm leading-8 text-white/80 sm:mt-6 sm:text-base">
                  To be the premier launchpad for Africa&apos;s next generation of
                  tech innovators, creating a thriving ecosystem where talent meets
                  opportunity, and where every motivated individual can forge a
                  successful career in the digital economy.
                </p>
              </div>
            </Reveal>
            <Reveal
              delay={0.08}
              className="relative overflow-hidden rounded-[2rem] bg-navy p-8 text-white sm:p-10 md:p-12"
            >
              <MissionAesthetic />
              <div className="relative z-10 max-w-xl pr-8 sm:pr-14">
                <h2 className="font-display text-3xl font-bold">Our Mission</h2>
                <p className="mt-5 text-sm leading-8 text-white/80 sm:mt-6 sm:text-base">
                  Our vision is to become a leading global online tech school that
                  empowers individuals to transform their lives through technology.
                  We aspire to bridge the digital skills gap by developing
                  world-class talent, fostering innovation, and creating
                  opportunities for learners to excel in the ever-evolving
                  technology industry.
                </p>
              </div>
            </Reveal>
          </div>
          <Reveal
            delay={0.12}
            className="rounded-[2rem] border border-border bg-surface-blue p-8 text-center"
          >
            <div className="mx-auto flex justify-center">
              <RegisteredEntityIcon />
            </div>
            <h3 className="mt-6 font-display text-3xl font-bold text-navy">
              Registered Entity
            </h3>
            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-muted sm:text-base">
              TechUp Academy is a fully registered organization committed to
              transparent and professional operations.
            </p>
            <div className="mx-auto mt-8 inline-flex rounded-xl bg-navy px-5 py-3 text-sm text-white">
              RC Number: 8461981
            </div>
          </Reveal>
        </div>
      </Section>

      <Section className="bg-surface-blue">
        <SectionHeading title="Meet the Team" underline />
        <Reveal className="mt-8 overflow-hidden rounded-4xl bg-white shadow-card sm:mt-12">
          <div className="grid items-center gap-6 p-5 sm:gap-8 sm:p-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10 lg:p-8">
            <div className="mx-auto w-full max-w-xs sm:max-w-sm lg:mx-0 lg:max-w-none">
              <Image
                src="/founder.png"
                alt="Philip Idowu, Founder of TechUp Academy"
                width={682}
                height={858}
                className="h-auto w-full rounded-3xl object-cover"
              />
            </div>
            <div className="flex flex-col justify-center lg:pr-4">
              <h3 className="font-display text-2xl font-bold text-navy sm:text-3xl">
                Philip Idowu
              </h3>
              <p className="mt-2 text-xs font-semibold tracking-wider text-orange uppercase sm:text-sm">
                Founder of TechUp Academy
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted sm:mt-5 sm:text-base">
                Philip is building TechUp Academy to expand access to practical
                tech education across Africa — pairing rigorous training with
                mentorship that helps learners compete on a global stage.
              </p>
              <p className="mt-4 text-sm italic text-muted sm:mt-5">
                &ldquo;We are not just teaching tech... we are building a runway
                for the next generation of Nigerian innovators to take flight on
                the global stage.&rdquo;
              </p>
            </div>
          </div>
        </Reveal>

        <div className="mt-14 sm:mt-16 md:mt-20">
          <SectionHeading
            title="Meet the Experts"
            subtitle="Instructors with industry experience and a bias for hands-on mentorship."
          />
          <Stagger className="mt-8 grid gap-4 sm:mt-12 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {experts.map((expert) => (
              <article
                key={expert.name}
                data-reveal
                className="rounded-2xl border border-border bg-white p-5 text-center sm:p-6"
              >
                <Image
                  src={expert.image}
                  alt={`${expert.name} photo`}
                  width={160}
                  height={160}
                  className="mx-auto size-20 rounded-full object-cover sm:size-24"
                />
                <h3 className="mt-4 font-display text-lg font-bold text-navy">
                  {expert.name}
                </h3>
                <p className="mt-1 text-sm font-medium text-orange">
                  {expert.role}
                </p>
                <p className="mt-3 text-sm text-muted">{expert.bio}</p>
                <Button
                  href={expert.linkedin}
                  variant="outline"
                  size="sm"
                  className="mt-5"
                  aria-label={`${expert.name} on LinkedIn`}
                >
                  <ArrowTopRightOnSquareIcon className="size-4" aria-hidden />
                  LinkedIn
                </Button>
              </article>
            ))}
          </Stagger>
        </div>
      </Section>

      <Section className="bg-[#0133A0] text-white">
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 xl:gap-16">
          <Reveal>
            <Badge tone="soft">Innovation Hub</Badge>
            <h2 className="mt-5 font-display text-3xl font-bold tracking-tight sm:mt-6 sm:text-4xl md:text-5xl">
              Introducing
              <span className="mt-1 block text-orange">TiNLab</span>
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/85 sm:mt-5 sm:text-base sm:leading-8">
              Techup Innovation Lab (TiNLab) is our dedicated innovation and
              research wing. It serves as an incubator for exceptional student
              projects, providing resources, mentorship, and potential funding to
              turn classroom ideas into real-world solutions solving local African
              problems.
            </p>
            <ul className="mt-6 space-y-3.5 sm:mt-8 sm:space-y-4">
              {tinlabHighlights.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-[#0133A0]">
                    ✓
                  </span>
                  <span className="text-sm font-medium sm:text-base">{item}</span>
                </li>
              ))}
            </ul>
            <Button
              href="/contact"
              variant="secondary"
              size="lg"
              className="mt-8 border-0 bg-white text-[#0133A0] hover:bg-white/95 sm:mt-10"
            >
              Explore TiNLab
            </Button>
          </Reveal>

          <Reveal delay={0.1} className="relative">
            <Image
              src="/tinlab.jpg"
              alt="Engineer prototyping in the TechUp Innovation Lab"
              width={1400}
              height={1600}
              className="w-full rounded-3xl object-cover shadow-card sm:rounded-4xl"
              sizes="(max-width: 1024px) 100vw, 45vw"
            />
          </Reveal>
        </div>
      </Section>
    </>
  );
}
