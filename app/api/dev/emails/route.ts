import { NextResponse } from "next/server";
import type { BootcampApplication } from "@/lib/bootcamp";
import {
  adminAlertEmail,
  studentWelcomeEmail,
} from "@/lib/bootcamp-email";

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

export async function GET(request: Request) {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ALLOW_EMAIL_PREVIEW !== "true"
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") === "admin" ? "admin" : "student";
  const email =
    type === "admin"
      ? adminAlertEmail(sampleApplication)
      : studentWelcomeEmail(sampleApplication);

  return new NextResponse(email.html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
