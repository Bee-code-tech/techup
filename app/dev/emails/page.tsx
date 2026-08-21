import { notFound } from "next/navigation";
import type { BootcampApplication } from "@/lib/bootcamp";
import {
  adminAlertEmail,
  studentWelcomeEmail,
} from "@/lib/bootcamp-email";
import { EmailPreviewClient } from "./EmailPreviewClient";

export const metadata = {
  title: "Email Preview",
  robots: {
    index: false,
    follow: false,
  },
};

const sampleApplication: BootcampApplication = {
  fullName: "Babawale Al-Ameen",
  email: "student@example.com",
  age: "23",
  gender: "Male",
  whatsapp: "+2349030181582",
  education: "Undergraduate",
  laptop: "yes",
  track: "uiux",
};

type PageProps = {
  searchParams: Promise<{ type?: string }>;
};

export default async function EmailPreviewPage({ searchParams }: PageProps) {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ALLOW_EMAIL_PREVIEW !== "true"
  ) {
    notFound();
  }

  const params = await searchParams;
  const type = params.type === "admin" ? "admin" : "student";
  const student = studentWelcomeEmail(sampleApplication);
  const admin = adminAlertEmail(sampleApplication);
  const current = type === "admin" ? admin : student;

  return (
    <EmailPreviewClient
      type={type}
      subject={current.subject}
      html={current.html}
      text={current.text}
    />
  );
}
