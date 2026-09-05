import { NextResponse } from "next/server";
import { parseBootcampApplication } from "@/lib/bootcamp";
import { adminAlertEmail, studentWelcomeEmail } from "@/lib/bootcamp-email";
import { db } from "@/lib/db";
import { getResendConfig, resendErrorMessage } from "@/lib/resend-client";
import { getWhatsappGroupUrlForTrack } from "@/lib/site-settings";

export async function POST(request: Request) {
  const emailConfig = getResendConfig();
  if (!emailConfig.ok) {
    return NextResponse.json({ error: emailConfig.error }, { status: 500 });
  }

  const formData = await request.formData();
  const parsed = parseBootcampApplication(
    Object.fromEntries(formData.entries()),
  );

  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const application = parsed.value;

  try {
    const existing = await db.bootcampRegistration.findUnique({
      where: { email: application.email },
    });

    if (existing) {
      return NextResponse.json(
        {
          error:
            "You have already registered for this bootcamp with this email address.",
          code: "duplicate",
        },
        { status: 409 },
      );
    }

    await db.bootcampRegistration.create({
      data: {
        fullName: application.fullName,
        email: application.email,
        age: Number(application.age),
        gender: application.gender,
        whatsapp: application.whatsapp,
        education: application.education,
        laptop: application.laptop,
        track: application.track,
      },
    });
  } catch (error) {
    console.error("Bootcamp registration save failed", error);
    return NextResponse.json(
      { error: "Could not save your registration. Please try again." },
      { status: 500 },
    );
  }

  const { whatsappGroupUrl, trackLabel } = await getWhatsappGroupUrlForTrack(
    application.track,
  );
  const studentMail = studentWelcomeEmail(application, whatsappGroupUrl);
  const adminMail = adminAlertEmail(application);
  const { resend, from, adminEmail } = emailConfig;

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
      parts.push(
        `Admin (${adminEmail}): ${resendErrorMessage(adminResult.error)}`,
      );
    }
    if (studentResult.error) {
      parts.push(
        `Student (${application.email}): ${resendErrorMessage(studentResult.error)}`,
      );
    }

    return NextResponse.json(
      {
        error:
          "Your registration was saved, but we could not send confirmation emails. Our team has your details.",
        details: parts,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, whatsappGroupUrl, trackLabel });
}
