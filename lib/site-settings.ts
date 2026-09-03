import { db } from "@/lib/db";
import { site } from "@/lib/site";

const SETTINGS_KEY = "default";

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

export async function getWhatsappGroupUrl() {
  const settings = await db.siteSettings.findUnique({
    where: { key: SETTINGS_KEY },
  });
  return settings?.whatsappGroupUrl || site.whatsappGroupUrl;
}

export async function setWhatsappGroupUrl(whatsappGroupUrl: string) {
  return db.siteSettings.upsert({
    where: { key: SETTINGS_KEY },
    create: { key: SETTINGS_KEY, whatsappGroupUrl },
    update: { whatsappGroupUrl },
  });
}
