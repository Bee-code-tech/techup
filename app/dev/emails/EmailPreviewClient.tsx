"use client";

import Link from "next/link";

type EmailPreviewClientProps = {
  type: "student" | "admin";
  subject: string;
  html: string;
  text: string;
};

export function EmailPreviewClient({
  type,
  subject,
  html,
  text,
}: EmailPreviewClientProps) {
  return (
    <div className="min-h-screen bg-[#F4F7FC] text-navy">
      <div className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-wider text-orange uppercase">
              Dev preview
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold">
              Bootcamp emails
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Subject: <span className="font-medium text-navy">{subject}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/dev/emails?type=student"
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                type === "student"
                  ? "bg-navy text-white"
                  : "border border-border bg-white text-navy"
              }`}
            >
              Student email
            </Link>
            <Link
              href="/dev/emails?type=admin"
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                type === "admin"
                  ? "bg-navy text-white"
                  : "border border-border bg-white text-navy"
              }`}
            >
              Admin email
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="border-b border-border px-4 py-3 text-sm font-semibold">
            HTML preview
          </div>
          <iframe
            title="Email HTML preview"
            srcDoc={html}
            className="h-[780px] w-full bg-[#F4F7FC]"
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="border-b border-border px-4 py-3 text-sm font-semibold">
            Plain text version
          </div>
          <pre className="overflow-auto p-4 text-xs leading-6 whitespace-pre-wrap text-muted-foreground">
            {text}
          </pre>
        </div>
      </div>
    </div>
  );
}
