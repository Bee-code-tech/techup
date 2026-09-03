import Image from "next/image";
import { Button } from "@/components/marketing/site-button";
import { cn } from "@/lib/cn";
import { site } from "@/lib/site";

type CourseCardProps = {
  title: string;
  description: string;
  duration: string;
  price: string;
  originalPrice?: string;
  category?: string;
  image: string;
  className?: string;
};

function ClockIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0 text-orange"
    >
      <circle cx="9" cy="9" r="7.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M9 5.5V9L11.5 10.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0 text-orange"
    >
      <rect
        x="2.25"
        y="4.5"
        width="13.5"
        height="10.5"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M2.25 7.5H15.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="12.75" cy="11.25" r="0.9" fill="currentColor" />
    </svg>
  );
}

export function CourseCard({
  title,
  description,
  duration,
  price,
  originalPrice,
  category,
  image,
  className,
}: CourseCardProps) {
  return (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-white shadow-card",
        className,
      )}
    >
      <div className="relative">
        <Image
          src={image}
          alt={`${title} course preview`}
          width={1400}
          height={900}
          className="aspect-wide w-full object-cover"
        />
        {category ? (
          <span className="absolute top-3 left-3 rounded-full bg-orange px-3 py-1 text-2xs font-bold tracking-wide text-white uppercase">
            {category}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="font-display text-lg font-bold text-navy sm:text-xl">
          {title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>

        <div className="mt-5 space-y-2.5 border-t border-border pt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ClockIcon />
            <span>
              Duration: <span className="font-medium text-navy">{duration}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <WalletIcon />
            <span className="text-muted-foreground">Tuition:</span>
            <span className="ml-auto inline-flex items-baseline gap-2.5">
              {originalPrice ? (
                <span className="text-xs font-medium text-muted-foreground/80 line-through decoration-muted">
                  {originalPrice}
                </span>
              ) : null}
              <span className="text-base font-bold text-orange">{price}</span>
            </span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-2">
          <Button
            href={site.scholarshipFormUrl}
            target="_blank"
            rel="noopener noreferrer"
            size="sm"
            className="w-full rounded-xl"
          >
            Apply For Scholarship
          </Button>
          <Button
            href="/contact"
            variant="ghost"
            size="sm"
            className="w-full rounded-xl"
          >
            Enroll Now
          </Button>
        </div>
      </div>
    </article>
  );
}
