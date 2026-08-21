import { NextResponse } from "next/server";
import { Resend } from "resend";
import { parseBootcampApplication } from "@/lib/bootcamp";
import { adminAlertEmail, studentWelcomeEmail } from "@/lib/bootcamp-email";
import { site } from "@/lib/site";

function resendErrorMessage(error: unknown) {
  if (!error || typeof error !== "object") return "Unknown email error";
  if ("message" in error && typeof error.message === "string") {
    return error.message;
  }
  return JSON.stringify(error);
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Email is not configured yet. Please try again later." },
      { status: 500 },
    );
  }

  const formData = await request.formData();
  const parsed = parseBootcampApplication(
    Object.fromEntries(formData.entries()),
  );

  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const application = parsed.value;
  const adminEmail = process.env.ADMIN_EMAIL || site.adminEmail;
  const from =
    process.env.RESEND_FROM ||
    "TechUp Academy <noreply@techupacademyng.com>";

  if (from.includes("@resend.dev")) {
    return NextResponse.json(
      {
        error:
          "Email sender is still on Resend's test domain. Set RESEND_FROM to an address on your verified domain (e.g. noreply@techupacademyng.com).",
      },
      { status: 500 },
    );
  }

  const studentMail = studentWelcomeEmail(application);
  const adminMail = adminAlertEmail(application);
  const resend = new Resend(apiKey);

  const [adminResult, studentResult] = await Promise.all([
    resend.emails.send({
      from,
      to: adminEmail,
      replyTo: application.email,
      subject: adminMail.subject,
      text: adminMail.text,
      html: adminMail.html,
    }),
    resend.emails.send({
      from,
      to: application.email,
      replyTo: adminEmail,
      subject: studentMail.subject,
      text: studentMail.text,
      html: studentMail.html,
    }),
  ]);

  if (adminResult.error || studentResult.error) {
    console.error("Bootcamp email send failed", {
      from,
      adminEmail,
      studentEmail: application.email,
      admin: adminResult.error,
      student: studentResult.error,
    });

    const parts: string[] = [];
    if (adminResult.error) {
      parts.push(`Admin (${adminEmail}): ${resendErrorMessage(adminResult.error)}`);
    }
    if (studentResult.error) {
      parts.push(
        `Student (${application.email}): ${resendErrorMessage(studentResult.error)}`,
      );
    }

    return NextResponse.json(
      {
        error:
          "We could not send confirmation emails. Please check your details and try again.",
        details: parts,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
