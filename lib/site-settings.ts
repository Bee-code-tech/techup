import { bootcampTracks } from "@/lib/bootcamp";
import { db } from "@/lib/db";
import { site } from "@/lib/site";

const SETTINGS_KEY = "default";

export type WhatsappGroupUrls = Partial<Record<string, string>>;

export function isWhatsappGroupUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      (url.hostname === "chat.whatsapp.com" ||
        url.hostname === "www.chat.whatsapp.com") &&
      url.pathname.length > 1
    );
  } catch {
    return false;
  }
}

function parseStoredUrls(value: unknown): WhatsappGroupUrls {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const urls: WhatsappGroupUrls = {};
  for (const [track, url] of Object.entries(value as Record<string, unknown>)) {
    if (typeof url === "string" && url.trim()) {
      urls[track] = url.trim();
    }
  }
  return urls;
}

export async function getWhatsappGroupUrls(): Promise<WhatsappGroupUrls> {
  const settings = await db.siteSettings.findUnique({
    where: { key: SETTINGS_KEY },
  });

  const urls = parseStoredUrls(settings?.whatsappGroupUrls);
  const legacy = settings?.whatsappGroupUrl?.trim();

  // Seed empty tracks with the legacy single link (or site default) so older
  // installs keep working until the admin fills each track.
  const fallback = legacy || site.whatsappGroupUrl;
  const result: WhatsappGroupUrls = {};

  for (const track of Object.keys(bootcampTracks)) {
    result[track] = urls[track] || fallback;
  }

  return result;
}

export async function getWhatsappGroupUrlForTrack(track: string) {
  const urls = await getWhatsappGroupUrls();
  const trackLabel = bootcampTracks[track] || track;
  return {
    track,
    trackLabel,
    whatsappGroupUrl: urls[track] || site.whatsappGroupUrl,
  };
}

/** @deprecated Prefer getWhatsappGroupUrlForTrack / getWhatsappGroupUrls */
export async function getWhatsappGroupUrl() {
  const urls = await getWhatsappGroupUrls();
  return urls.frontend || site.whatsappGroupUrl;
}

export async function setWhatsappGroupUrls(whatsappGroupUrls: WhatsappGroupUrls) {
  const cleaned: WhatsappGroupUrls = {};
  for (const track of Object.keys(bootcampTracks)) {
    const value = whatsappGroupUrls[track]?.trim();
    if (value) cleaned[track] = value;
  }

  return db.siteSettings.upsert({
    where: { key: SETTINGS_KEY },
    create: {
      key: SETTINGS_KEY,
      whatsappGroupUrls: cleaned,
    },
    update: {
      whatsappGroupUrls: cleaned,
    },
  });
}
