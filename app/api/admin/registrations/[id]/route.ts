import { NextResponse } from "next/server";
import {
  bootcampTracks,
  laptopLabels,
  type BootcampApplication,
} from "@/lib/bootcamp";
import { studentTrackChangeEmail } from "@/lib/bootcamp-email";
import { db } from "@/lib/db";
import { getResendConfig, resendErrorMessage } from "@/lib/resend-client";
import { getWhatsappGroupUrlForTrack } from "@/lib/site-settings";

type UpdateBody = {
  fullName?: string;
  email?: string;
  age?: number | string;
  gender?: string;
  whatsapp?: string;
  education?: string;
  laptop?: string;
  track?: string;
};

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Missing student id." }, { status: 400 });
  }

  const existing = await db.bootcampRegistration.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Student not found." }, { status: 404 });
  }

  const body = (await request.json()) as UpdateBody;
  const fullName = String(body.fullName ?? existing.fullName).trim();
  const email = String(body.email ?? existing.email).trim().toLowerCase();
  const ageRaw = body.age ?? existing.age;
  const age = Number(ageRaw);
  const gender = String(body.gender ?? existing.gender).trim();
  const whatsapp = String(body.whatsapp ?? existing.whatsapp).trim();
  const education = String(body.education ?? existing.education).trim();
  const laptop = String(body.laptop ?? existing.laptop).trim();
  const track = String(body.track ?? existing.track).trim();

  if (fullName.length < 2) {
    return NextResponse.json(
      { error: "Please enter a valid full name." },
      { status: 400 },
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }
  if (Number.isNaN(age) || age < 13 || age > 80) {
    return NextResponse.json(
      { error: "Please enter a valid age." },
      { status: 400 },
    );
  }
  if (!gender) {
    return NextResponse.json(
      { error: "Please select a gender." },
      { status: 400 },
    );
  }
  if (whatsapp.length < 8) {
    return NextResponse.json(
      { error: "Please enter a valid WhatsApp number." },
      { status: 400 },
    );
  }
  if (!education) {
    return NextResponse.json(
      { error: "Please select an education level." },
      { status: 400 },
    );
  }
  if (!laptop || !laptopLabels[laptop]) {
    return NextResponse.json(
      { error: "Please select laptop access." },
      { status: 400 },
    );
  }
  if (!track || !bootcampTracks[track]) {
    return NextResponse.json(
      { error: "Please select a valid bootcamp track." },
      { status: 400 },
    );
  }

  if (email !== existing.email) {
    const clash = await db.bootcampRegistration.findUnique({
      where: { email },
    });
    if (clash && clash.id !== id) {
      return NextResponse.json(
        { error: "Another student already uses this email address." },
        { status: 409 },
      );
    }
  }

  const trackChanged = track !== existing.track;

  let updated;
  try {
    updated = await db.bootcampRegistration.update({
      where: { id },
      data: {
        fullName,
        email,
        age,
        gender,
        whatsapp,
        education,
        laptop,
        track,
      },
    });
  } catch (error) {
    console.error("Failed to update student", error);
    return NextResponse.json(
      { error: "Could not save student changes." },
      { status: 500 },
    );
  }

  let emailSent = false;
  let emailError: string | undefined;

  if (trackChanged) {
    const emailConfig = getResendConfig();
    if (!emailConfig.ok) {
      emailError = emailConfig.error;
    } else {
      const { whatsappGroupUrl } = await getWhatsappGroupUrlForTrack(track);
      const application: BootcampApplication = {
        fullName: updated.fullName,
        email: updated.email,
        age: String(updated.age),
        gender: updated.gender,
        whatsapp: updated.whatsapp,
        education: updated.education,
        laptop: updated.laptop,
        track: updated.track,
      };
      const mail = studentTrackChangeEmail({
        application,
        previousTrack: existing.track,
        whatsappGroupUrl,
      });

      const result = await emailConfig.resend.emails.send({
        from: emailConfig.from,
        to: updated.email,
        replyTo: emailConfig.adminEmail,
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
      });

      if (result.error) {
        emailError = resendErrorMessage(result.error);
        console.error("Track change email failed", result.error);
      } else {
        emailSent = true;
      }
    }
  }

  return NextResponse.json({
    ok: true,
    trackChanged,
    emailSent,
    emailError,
    student: {
      id: updated.id,
      fullName: updated.fullName,
      email: updated.email,
      age: updated.age,
      gender: updated.gender,
      whatsapp: updated.whatsapp,
      education: updated.education,
      laptop: updated.laptop,
      track: updated.track,
      trackLabel: bootcampTracks[updated.track] ?? updated.track,
      createdAt: updated.createdAt.toISOString(),
    },
  });
}
