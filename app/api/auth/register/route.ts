import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/password";
import {
  parseBootcampApplication,
  type BootcampApplication,
} from "@/lib/bootcamp";
import { adminAlertEmail, studentWelcomeEmail } from "@/lib/bootcamp-email";
import { db } from "@/lib/db";
import { getResendConfig, resendErrorMessage } from "@/lib/resend-client";
import { dashboardHomeForRole } from "@/lib/roles";
import { setSessionCookie } from "@/lib/session";
import { getWhatsappGroupUrlForTrack } from "@/lib/site-settings";

type RegisterBody = BootcampApplication & {
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as RegisterBody;
  const password = String(body.password ?? "");

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }

  const parsed = parseBootcampApplication({
    fullName: body.fullName ?? "",
    email: body.email ?? "",
    age: body.age ?? "",
    gender: body.gender ?? "",
    whatsapp: body.whatsapp ?? "",
    education: body.education ?? "",
    laptop: body.laptop ?? "",
    track: body.track ?? "",
  });

  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const application = parsed.value;

  try {
    const existingUser = await db.user.findUnique({
      where: { email: application.email },
    });
    if (existingUser) {
      return NextResponse.json(
        {
          error:
            "An account with this email already exists. Please log in instead.",
          code: "duplicate",
        },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await db.user.create({
      data: {
        name: application.fullName,
        email: application.email,
        passwordHash,
        role: "student",
        age: Number(application.age),
        gender: application.gender,
        whatsapp: application.whatsapp,
        education: application.education,
        laptop: application.laptop,
        track: application.track,
        accessTier: "free",
        mustChangePassword: false,
      },
    });

    // Keep CRM/broadcast list in sync
    await db.bootcampRegistration.upsert({
      where: { email: application.email },
      create: {
        fullName: application.fullName,
        email: application.email,
        age: Number(application.age),
        gender: application.gender,
        whatsapp: application.whatsapp,
        education: application.education,
        laptop: application.laptop,
        track: application.track,
      },
      update: {
        fullName: application.fullName,
        age: Number(application.age),
        gender: application.gender,
        whatsapp: application.whatsapp,
        education: application.education,
        laptop: application.laptop,
        track: application.track,
      },
    });

    await setSessionCookie(user.id, user.role);

    // Fire-and-forget emails — do not block dashboard entry
    void sendRegistrationEmails(application).catch((error) => {
      console.error("Registration email failed", error);
    });

    return NextResponse.json({
      ok: true,
      redirectTo: dashboardHomeForRole("student"),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        track: user.track,
      },
    });
  } catch (error) {
    console.error("Registration failed", error);
    return NextResponse.json(
      { error: "Could not create your account. Please try again." },
      { status: 500 },
    );
  }
}

async function sendRegistrationEmails(application: BootcampApplication) {
  const emailConfig = getResendConfig();
  if (!emailConfig.ok) {
    console.error("Resend not configured", emailConfig.error);
    return;
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
    console.error("Registration email send failed", {
      admin: adminResult.error
        ? resendErrorMessage(adminResult.error)
        : null,
      student: studentResult.error
        ? resendErrorMessage(studentResult.error)
        : null,
      trackLabel,
    });
  }
}
