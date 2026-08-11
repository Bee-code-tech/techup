import Image from "next/image";
import { Section } from "@/components/layout/Section";
import { HeroIntro } from "@/components/motion/HeroIntro";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger } from "@/components/motion/Stagger";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CourseCard } from "@/components/ui/CourseCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { comingSoonCourses, courses } from "@/lib/site";

export function CoursesHero() {
  return (
    <Section className="pb-8 text-left sm:pb-10 md:pb-12">
      <HeroIntro className="max-w-3xl">
        <div data-hero>
          <Badge>Digital Skills</Badge>
        </div>
        <h1
          data-hero
          className="mt-5 font-display text-hero font-bold tracking-tight text-navy sm:mt-6 sm:text-5xl"
        >
          Our <span className="text-orange">Programs</span>
        </h1>
        <p
          data-hero
          className="mt-4 max-w-2xl text-sm text-muted sm:text-base md:text-lg"
        >
          Industry-focused training designed to bridge the gap between Nigerian
          talent and global tech opportunities. Master the skills that matter.
        </p>
      </HeroIntro>
    </Section>
  );
}

export function CoursesCatalog() {
  return (
    <>
      <Section className="bg-surface-blue pt-0">
        <SectionHeading
          title="Our Featured Courses"
          subtitle="Deep dive into specialized tracks designed to make you industry-ready in record time."
        />
        <Stagger className="mt-8 grid gap-5 sm:mt-12 sm:gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {courses.map((course) => (
            <div key={course.title} data-reveal>
              <CourseCard {...course} />
            </div>
          ))}
        </Stagger>

        <div className="mt-14 grid items-start gap-8 sm:mt-16 lg:mt-20 lg:grid-cols-content lg:gap-10">
          <Reveal>
            <h2 className="font-display text-2xl font-bold text-navy sm:text-3xl md:text-4xl">
              What You&apos;ll Learn
            </h2>
            <p className="mt-3 max-w-xl text-sm text-muted sm:mt-4 sm:text-base">
              Curriculum shaped with industry partners so every module maps to
              real workplace outcomes.
            </p>
            <div className="mt-6 space-y-3 sm:mt-8">
              {[
                {
                  title: "Project Based Learning",
                  body: "Build a professional portfolio as you learn.",
                },
                {
                  title: "Modern Software",
                  body: "VS Code, SQL Server, Power BI, Adobe, and more.",
                },
                {
                  title: "Career Support",
                  body: "Mock interviews and placement support with partners.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-border bg-white px-4 py-4 sm:px-5"
                >
                  <h3 className="font-semibold text-navy">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted">{item.body}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <aside className="rounded-2xl border border-border bg-white p-5 shadow-card sm:rounded-3xl sm:p-6 md:p-8">
              <h3 className="text-lg font-bold text-foreground">
                Payment Options
              </h3>
              <div className="mt-5 space-y-3">
                {[
                  {
                    title: "Lump Sum Payment",
                    body: "Save 15% on tuition.",
                    mark: "✓",
                  },
                  {
                    title: "Installment Payment",
                    body: "Pay in 2 manageable parts.",
                    mark: "◷",
                  },
                  {
                    title: "Scholarship Scheme",
                    body: "Up to 100% off for merit students.",
                    mark: "🎓",
                  },
                ].map((option) => (
                  <div
                    key={option.title}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border px-3 py-3 sm:px-4"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-navy">{option.title}</p>
                      <p className="text-sm text-muted">{option.body}</p>
                    </div>
                    <span className="shrink-0 text-orange">{option.mark}</span>
                  </div>
                ))}
              </div>
              <Button
                href="/contact"
                className="mt-6 w-full rounded-xl"
                size="lg"
              >
                Enroll Now
              </Button>
            </aside>
          </Reveal>
        </div>
      </Section>

      <Section className="bg-navy text-white">
        <SectionHeading
          light
          title="Expanding Horizons"
          subtitle="We are constantly evolving our curriculum to meet the demands of the digital economy."
        />
        <Stagger className="mt-8 grid gap-4 sm:mt-10 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {comingSoonCourses.map((course) => (
            <article
              key={course.title}
              data-reveal
              className="relative flex min-h-72 flex-col items-center justify-center overflow-hidden rounded-3xl p-6 text-center sm:min-h-80"
            >
              <Image
                src="/courses.png"
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-navy/80" />
              <div className="relative z-10 flex max-w-xs flex-col items-center">
                <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-2xs font-semibold tracking-wide text-white uppercase backdrop-blur-sm">
                  Coming Soon
                </span>
                <h3 className="mt-4 font-display text-xl font-bold text-white sm:text-2xl">
                  {course.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/80">
                  {course.topics}
                </p>
                <Button
                  variant="orange"
                  size="sm"
                  className="mt-5 rounded-full px-5 uppercase"
                >
                  Notify Me
                </Button>
              </div>
            </article>
          ))}
        </Stagger>
      </Section>
    </>
  );
}
