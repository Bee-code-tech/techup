import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type CourseCardProps = {
  title: string;
  description: string;
  duration: string;
  price: string;
  category?: string;
  className?: string;
};

export function CourseCard({
  title,
  description,
  duration,
  price,
  category,
  className,
}: CourseCardProps) {
  return (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white",
        className,
      )}
    >
      <div className="relative">
        <Image
          src="/courses.png"
          alt={`${title} course preview`}
          width={791}
          height={400}
          className="aspect-wide w-full border-b border-border object-cover"
        />
        {category ? (
          <span className="absolute top-3 left-3 rounded-full bg-orange px-3 py-1 text-2xs font-bold tracking-wide text-white uppercase">
            {category}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl font-bold text-navy">{title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
          {description}
        </p>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="inline-flex items-center gap-1.5 text-muted">
            <span className="size-2 rounded-full bg-orange" />
            {duration}
          </span>
          <span className="font-bold text-navy">{price}</span>
        </div>
        <Button
          href="/courses"
          variant="ghost"
          className="mt-5 w-full rounded-xl"
        >
          Explore Course
        </Button>
      </div>
    </article>
  );
}
