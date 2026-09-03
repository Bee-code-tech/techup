import { NextResponse } from "next/server";
import { broadcastEmail } from "@/lib/broadcast-email";
import { db } from "@/lib/db";
import { getResendConfig, resendErrorMessage } from "@/lib/resend-client";

type BroadcastBody = {
  subject?: string;
  message?: string;
  recipientIds?: string[];
};

const BATCH_SIZE = 10;

export async function POST(request: Request) {
  const body = (await request.json()) as BroadcastBody;
  const subject = String(body.subject ?? "").trim();
  const message = String(body.message ?? "").trim();
  const recipientIds = Array.isArray(body.recipientIds)
    ? body.recipientIds.filter((id) => typeof id === "string" && id.length > 0)
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
    const batch = recipients.slice(index, index + BATCH_SIZE);
    const results = await Promise.all(
      batch.map(async (recipient) => {
        const mail = broadcastEmail({
          subject,
          message,
          recipientName: recipient.fullName,
        });

        const result = await resend.emails.send({
          from,
          to: recipient.email,
          replyTo: adminEmail,
          subject,
          text: mail.text,
          html: mail.html,
        });

        return { recipient, result };
      }),
    );

    for (const { recipient, result } of results) {
      if (result.error) {
        failures.push(`${recipient.email}: ${resendErrorMessage(result.error)}`);
      } else {
        sent += 1;
      }
    }
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
