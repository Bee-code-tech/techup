import type { BootcampRegistration } from "@prisma/client";
import {
  normalizeCampaignKey,
} from "@/lib/broadcast-campaign-key";
import { db } from "@/lib/db";

export {
  normalizeCampaignKey,
  slugifyCampaignKey,
} from "@/lib/broadcast-campaign-key";

export async function getAudience(options: {
  tracks?: string[];
  recipientIds?: string[];
}): Promise<BootcampRegistration[]> {
  const tracks = options.tracks?.filter(Boolean) ?? [];
  const recipientIds = options.recipientIds?.filter(Boolean) ?? [];

  if (recipientIds.length > 0) {
    return db.bootcampRegistration.findMany({
      where: { id: { in: recipientIds } },
    });
  }

  if (tracks.length > 0) {
    return db.bootcampRegistration.findMany({
      where: { track: { in: tracks } },
      orderBy: { createdAt: "desc" },
    });
  }

  return db.bootcampRegistration.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getSentEmailsForCampaign(campaignKey: string) {
  const rows = await db.broadcastDelivery.findMany({
    where: { campaignKey, status: "sent" },
    select: { email: true },
  });
  return new Set(rows.map((row) => row.email.toLowerCase()));
}

export async function getCampaignAudienceStats(options: {
  campaignKey: string;
  tracks?: string[];
}) {
  const campaignKey = normalizeCampaignKey(options.campaignKey);
  const audience = await getAudience({ tracks: options.tracks });
  const sentEmails = campaignKey
    ? await getSentEmailsForCampaign(campaignKey)
    : new Set<string>();

  const alreadyReceived = audience.filter((row) =>
    sentEmails.has(row.email.toLowerCase()),
  ).length;
  const willSend = audience.length - alreadyReceived;

  return {
    campaignKey,
    eligible: audience.length,
    alreadyReceived,
    willSend,
    audience,
    sentEmails,
  };
}

export async function recordBroadcastDeliveries(options: {
  broadcastId: string;
  campaignKey: string;
  recipients: Array<Pick<BootcampRegistration, "id" | "email">>;
}) {
  const { broadcastId, campaignKey, recipients } = options;

  for (let index = 0; index < recipients.length; index += 50) {
    const chunk = recipients.slice(index, index + 50);
    await Promise.all(
      chunk.map((recipient) =>
        db.broadcastDelivery.upsert({
          where: {
            campaignKey_email: {
              campaignKey,
              email: recipient.email.toLowerCase(),
            },
          },
          create: {
            broadcastId,
            campaignKey,
            registrationId: recipient.id,
            email: recipient.email.toLowerCase(),
            status: "sent",
          },
          update: {
            broadcastId,
            registrationId: recipient.id,
            status: "sent",
          },
        }),
      ),
    );
  }
}
