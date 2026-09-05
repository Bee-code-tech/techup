import type { BootcampRegistration } from "@prisma/client";
import { NextResponse } from "next/server";
import { broadcastEmail } from "@/lib/broadcast-email";
import {
  getAudience,
  getCampaignAudienceStats,
  getSentEmailsForCampaign,
  normalizeCampaignKey,
  recordBroadcastDeliveries,
  slugifyCampaignKey,
} from "@/lib/broadcast-campaign";
import { db } from "@/lib/db";
import { getResendConfig, resendErrorMessage } from "@/lib/resend-client";

type BroadcastBody = {
  subject?: string;
  heading?: string;
  message?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  campaignKey?: string;
  skipAlreadySent?: boolean;
  recipientIds?: string[];
  tracks?: string[];
};

const BATCH_SIZE = 100;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignKey = normalizeCampaignKey(
      String(searchParams.get("campaignKey") ?? ""),
    );
    const tracks = String(searchParams.get("tracks") ?? "")
      .split(",")
      .map((track) => track.trim())
      .filter(Boolean);

    if (!campaignKey) {
      const audience = await getAudience({ tracks });
      return NextResponse.json({
        campaignKey: "",
        eligible: audience.length,
        alreadyReceived: 0,
        willSend: audience.length,
      });
    }

    const stats = await getCampaignAudienceStats({ campaignKey, tracks });
    return NextResponse.json({
      campaignKey: stats.campaignKey,
      eligible: stats.eligible,
      alreadyReceived: stats.alreadyReceived,
      willSend: stats.willSend,
    });
  } catch (error) {
    console.error("Failed to preview broadcast audience", error);
    return NextResponse.json(
      { error: "Could not preview audience." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as BroadcastBody;
  const subject = String(body.subject ?? "").trim();
  const heading = String(body.heading ?? "").trim();
  const message = String(body.message ?? "").trim();
  const ctaLabel = String(body.ctaLabel ?? "").trim();
  const ctaUrl = String(body.ctaUrl ?? "").trim();
  const skipAlreadySent = body.skipAlreadySent !== false;
  const recipientIds = Array.isArray(body.recipientIds)
    ? body.recipientIds.filter((id) => typeof id === "string" && id.length > 0)
    : [];
  const tracks = Array.isArray(body.tracks)
    ? body.tracks.filter((track) => typeof track === "string" && track.length > 0)
    : [];

  let campaignKey = normalizeCampaignKey(String(body.campaignKey ?? ""));
  if (!campaignKey) {
    campaignKey = slugifyCampaignKey(subject);
  }

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
  if (!campaignKey) {
    return NextResponse.json(
      { error: "Please enter a campaign name for this broadcast." },
      { status: 400 },
    );
  }

  const emailConfig = getResendConfig();
  if (!emailConfig.ok) {
    return NextResponse.json({ error: emailConfig.error }, { status: 500 });
  }

  const audience = await getAudience({ tracks, recipientIds });
  if (audience.length === 0) {
    return NextResponse.json(
      { error: "No recipients found for this broadcast." },
      { status: 400 },
    );
  }

  const sentEmails = skipAlreadySent
    ? await getSentEmailsForCampaign(campaignKey)
    : new Set<string>();

  const recipients = skipAlreadySent
    ? audience.filter((row) => !sentEmails.has(row.email.toLowerCase()))
    : audience;

  const skippedCount = audience.length - recipients.length;

  if (recipients.length === 0) {
    return NextResponse.json(
      {
        error:
          "Everyone in this audience already received this campaign. Turn off skip to resend, or wait for new registrations.",
        eligible: audience.length,
        alreadyReceived: skippedCount,
        willSend: 0,
        skipped: skippedCount,
      },
      { status: 400 },
    );
  }

  const { resend, from, adminEmail } = emailConfig;
  let sent = 0;
  const failures: string[] = [];
  const delivered: BootcampRegistration[] = [];

  for (let index = 0; index < recipients.length; index += BATCH_SIZE) {
    if (index > 0) {
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

    sent += batch.length;
    delivered.push(...batch);
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

  const broadcast = await db.broadcast.create({
    data: {
      campaignKey,
      subject,
      heading,
      body: message,
      ctaLabel,
      ctaUrl,
      tracks,
      recipientCount: sent,
      skippedCount,
    },
  });

  if (delivered.length > 0) {
    await recordBroadcastDeliveries({
      broadcastId: broadcast.id,
      campaignKey,
      recipients: delivered,
    });
  }

  return NextResponse.json({
    ok: true,
    sent,
    failed: failures.length,
    skipped: skippedCount,
    eligible: audience.length,
    campaignKey,
    details: failures.slice(0, 5),
  });
}
