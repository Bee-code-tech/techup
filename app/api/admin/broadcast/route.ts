import { NextResponse } from "next/server";
import { broadcastEmail } from "@/lib/broadcast-email";
import { db } from "@/lib/db";
import { getResendConfig, resendErrorMessage } from "@/lib/resend-client";

type BroadcastBody = {
  subject?: string;
  heading?: string;
  message?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  recipientIds?: string[];
  tracks?: string[];
};

/** Resend batch endpoint accepts up to 100 emails per API call (1 request). */
const BATCH_SIZE = 100;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: Request) {
  const body = (await request.json()) as BroadcastBody;
  const subject = String(body.subject ?? "").trim();
  const heading = String(body.heading ?? "").trim();
  const message = String(body.message ?? "").trim();
  const ctaLabel = String(body.ctaLabel ?? "").trim();
  const ctaUrl = String(body.ctaUrl ?? "").trim();
  const recipientIds = Array.isArray(body.recipientIds)
    ? body.recipientIds.filter((id) => typeof id === "string" && id.length > 0)
    : [];
  const tracks = Array.isArray(body.tracks)
    ? body.tracks.filter((track) => typeof track === "string" && track.length > 0)
    : [];

  if (subject.length < 3) {
    return NextResponse.json(
      { error: "Please enter a subject with at least 3 characters." },
      { status: 400 },
    );
  }
  if (message.length < 10) {
    return NextResponse.json(
      { error: "Please enter a message with at least 10 characters." },
      { status: 400 },
    );
  }

  const emailConfig = getResendConfig();
  if (!emailConfig.ok) {
    return NextResponse.json({ error: emailConfig.error }, { status: 500 });
  }

  const recipients =
    recipientIds.length > 0
      ? await db.bootcampRegistration.findMany({
          where: { id: { in: recipientIds } },
        })
      : tracks.length > 0
        ? await db.bootcampRegistration.findMany({
            where: { track: { in: tracks } },
            orderBy: { createdAt: "desc" },
          })
        : await db.bootcampRegistration.findMany({
            orderBy: { createdAt: "desc" },
          });

  if (recipients.length === 0) {
    return NextResponse.json(
      { error: "No recipients found for this broadcast." },
      { status: 400 },
    );
  }

  const { resend, from, adminEmail } = emailConfig;
  let sent = 0;
  const failures: string[] = [];

  for (let index = 0; index < recipients.length; index += BATCH_SIZE) {
    if (index > 0) {
      // Stay under Resend's default 10 requests/second team limit.
      await sleep(200);
    }

    const batch = recipients.slice(index, index + BATCH_SIZE);
    const payload = batch.map((recipient) => {
      const mail = broadcastEmail({
        subject,
        heading,
        message,
        ctaLabel,
        ctaUrl,
        recipientName: recipient.fullName,
      });

      return {
        from,
        to: recipient.email,
        replyTo: adminEmail,
        subject,
        text: mail.text,
        html: mail.html,
      };
    });

    const result = await resend.batch.send(payload);

    if (result.error) {
      const reason = resendErrorMessage(result.error);
      for (const recipient of batch) {
        failures.push(`${recipient.email}: ${reason}`);
      }
      continue;
    }

    // Strict batch mode: no error means the whole chunk was accepted.
    sent += batch.length;
  }

  if (sent === 0) {
    return NextResponse.json(
      {
        error: "Broadcast failed. No emails were sent.",
        details: failures.slice(0, 5),
      },
      { status: 502 },
    );
  }

  await db.broadcast.create({
    data: {
      subject,
      body: message,
      recipientCount: sent,
    },
  });

  return NextResponse.json({
    ok: true,
    sent,
    failed: failures.length,
    details: failures.slice(0, 5),
  });
}
