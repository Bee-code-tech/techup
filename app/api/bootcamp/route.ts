import { NextResponse } from "next/server";
import { Resend } from "resend";
import { parseBootcampApplication } from "@/lib/bootcamp";
import { adminAlertEmail, studentWelcomeEmail } from "@/lib/bootcamp-email";
import { site } from "@/lib/site";

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
    process.env.RESEND_FROM || "TechUp Academy <onboarding@resend.dev>";
  const studentMail = studentWelcomeEmail(application);
  const adminMail = adminAlertEmail(application);
  const resend = new Resend(apiKey);

  const [adminResult, studentResult] = await Promise.all([
    resend.emails.send({
      from,
      to: adminEmail,
      replyTo: application.email,
      subject: adminMail.subject,
      html: adminMail.html,
    }),
    resend.emails.send({
      from,
      to: application.email,
      subject: studentMail.subject,
      html: studentMail.html,
    }),
  ]);

  if (adminResult.error || studentResult.error) {
    return NextResponse.json(
      {
        error:
          "We could not send confirmation emails. Please check your details and try again.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
