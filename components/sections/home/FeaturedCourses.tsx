import { Section } from "@/components/layout/Section";
import { Stagger } from "@/components/motion/Stagger";
import { CourseCard } from "@/components/marketing/CourseCard";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { courses } from "@/lib/site";

export function FeaturedCourses() {
  const featuredCourses = courses.slice(0, 3);

  return (
    <Section>
      <SectionHeading
        title="Our Featured Courses"
        subtitle="Deep dive into specialized tracks designed to make you industry-ready in record time."
      />
      <Stagger className="mt-8 grid gap-5 sm:mt-12 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {featuredCourses.map((course) => (
          <div key={course.title} data-reveal>
            <CourseCard {...course} />
          </div>
        ))}
      </Stagger>
    </Section>
  );
}
