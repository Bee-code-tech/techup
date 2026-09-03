import {
  emailColors,
  emailPrimaryButton,
  emailShell,
  escapeHtml,
  escapeHtmlWithBreaks,
} from "@/lib/email-shell";
import { site } from "@/lib/site";

const { muted, navy } = emailColors;

export type BroadcastContent = {
  subject: string;
  heading?: string;
  message: string;
  ctaLabel?: string;
  ctaUrl?: string;
  recipientName?: string;
};

export function broadcastEmail(options: BroadcastContent) {
  const first =
    options.recipientName?.split(" ")[0] || options.recipientName || "";
  const greeting = first ? `Hi ${first},` : "Hi there,";
  const greetingHtml = first
    ? `Hi ${escapeHtml(first)},`
    : "Hi there,";
  const heading = options.heading?.trim() || options.subject.trim();
  const bodyHtml = escapeHtmlWithBreaks(options.message);
  const ctaLabel = options.ctaLabel?.trim();
  const ctaUrl = options.ctaUrl?.trim();
  const hasCta = Boolean(ctaLabel && ctaUrl && /^https?:\/\//i.test(ctaUrl));

  const body = `
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${navy};">${greetingHtml}</p>
    <p style="margin:0 0 8px;font-size:15px;line-height:1.7;color:${muted};">${bodyHtml}</p>
    ${hasCta ? emailPrimaryButton(ctaUrl!, ctaLabel!) : ""}
  `;

  const html = emailShell({
    title: options.subject,
    eyebrow: "Bootcamp update",
    heading,
    showEyebrowPill: false,
    body,
  });

  const text = [
    greeting,
    "",
    heading,
    "",
    options.message,
    ...(hasCta ? ["", ctaLabel, ctaUrl] : []),
    "",
    "TechUp Academy",
    site.email,
    site.url,
  ].join("\n");

  return { html, text };
}
