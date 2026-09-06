import { NextResponse } from "next/server";
import { isNextResponse, requireStudent } from "@/lib/api-auth";
import { bootcampTracks } from "@/lib/bootcamp";
import { studentTrackChangeEmail } from "@/lib/bootcamp-email";
import { db } from "@/lib/db";
import { getResendConfig, resendErrorMessage } from "@/lib/resend-client";
import { getWhatsappGroupUrlForTrack } from "@/lib/site-settings";

type Body = { track?: string; confirm?: boolean };

export async function POST(request: Request) {
  const auth = await requireStudent();
  if (isNextResponse(auth)) return auth;

  const body = (await request.json()) as Body;
  const track = String(body.track ?? "").trim();
  if (!track || !(track in bootcampTracks)) {
    return NextResponse.json({ error: "Select a valid track." }, { status: 400 });
  }
  if (!body.confirm) {
    return NextResponse.json(
      {
        error:
          "Confirm that you understand you will lose previous track progress.",
      },
      { status: 400 },
    );
  }

  const user = await db.user.findUnique({ where: { id: auth.userId } });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.track === track) {
    return NextResponse.json({ error: "You are already on this track." }, { status: 400 });
  }

  const previousTrack = user.track;

  // Clear progress for old track modules
  if (previousTrack) {
    const oldModules = await db.module.findMany({
      where: { course: { track: previousTrack } },
      select: { id: true },
    });
    const ids = oldModules.map((row) => row.id);
    if (ids.length) {
      await db.moduleProgress.deleteMany({
        where: { userId: user.id, moduleId: { in: ids } },
      });
      await db.moduleUnlock.deleteMany({
        where: { userId: user.id, moduleId: { in: ids } },
      });
    }
  }

  const updated = await db.user.update({
    where: { id: user.id },
    data: { track },
  });

  await db.bootcampRegistration.upsert({
    where: { email: user.email },
    create: {
      fullName: user.name,
      email: user.email,
      age: user.age ?? 18,
      gender: user.gender ?? "Prefer not to say",
      whatsapp: user.whatsapp ?? "",
      education: user.education ?? "Undergraduate",
      laptop: user.laptop ?? "yes",
      track,
    },
    update: { track, fullName: user.name },
  });

  let emailSent = false;
  const emailConfig = getResendConfig();
  if (emailConfig.ok && previousTrack) {
    const { whatsappGroupUrl } = await getWhatsappGroupUrlForTrack(track);
    const mail = studentTrackChangeEmail({
      application: {
        fullName: updated.name,
        email: updated.email,
        age: String(updated.age ?? ""),
        gender: updated.gender ?? "",
        whatsapp: updated.whatsapp ?? "",
        education: updated.education ?? "",
        laptop: updated.laptop ?? "",
        track,
      },
      previousTrack,
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
      console.error("Track change email failed", resendErrorMessage(result.error));
    } else {
      emailSent = true;
    }
  }

  return NextResponse.json({
    ok: true,
    track,
    trackLabel: bootcampTracks[track],
    emailSent,
  });
}
