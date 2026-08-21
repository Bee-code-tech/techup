import {
  bootcampTracks,
  laptopLabels,
  type BootcampApplication,
} from "@/lib/bootcamp";
import { site } from "@/lib/site";

const navy = "#00206F";
const orange = "#FB7801";
const muted = "#5B6475";
const border = "#E4E9F2";
const surface = "#F7F8FA";

const logoUrl = `${site.url}/logo.png`;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function firstName(fullName: string) {
  return escapeHtml(fullName.split(" ")[0] || fullName);
}

function emailShell(options: {
  title: string;
  eyebrow: string;
  body: string;
}) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${options.title}</title>
  </head>
  <body style="margin:0;padding:0;background:${surface};font-family:Arial,Helvetica,sans-serif;color:${navy};">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${surface};padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="max-width:560px;width:100%;background:#ffffff;border:1px solid ${border};border-radius:16px;overflow:hidden;">
            <tr>
              <td style="background:${navy};padding:22px 24px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td valign="middle" style="width:48px;">
                      <a href="${site.url}" style="text-decoration:none;">
                        <img
                          src="${logoUrl}"
                          alt="TechUp Academy"
                          width="40"
                          height="40"
                          style="display:block;width:40px;height:40px;border:0;border-radius:999px;background:#ffffff;"
                        />
                      </a>
                    </td>
                    <td valign="middle" style="padding-left:12px;">
                      <p style="margin:0;font-size:16px;font-weight:700;color:#ffffff;line-height:1.2;">
                        TechUp Academy
                      </p>
                      <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.72);line-height:1.3;">
                        ${options.eyebrow}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="height:4px;background:${orange};font-size:0;line-height:0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="padding:28px 24px 8px;">
                ${options.body}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px 24px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${surface};border-radius:12px;">
                  <tr>
                    <td style="padding:16px 18px;">
                      <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:${navy};">
                        TechUp Academy
                      </p>
                      <p style="margin:0;font-size:12px;line-height:1.6;color:${muted};">
                        ${site.email}<br />
                        <a href="${site.url}" style="color:${navy};text-decoration:underline;">${site.url.replace(/^https?:\/\//, "")}</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function detailLine(label: string, value: string) {
  return `<p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:${navy};"><strong>${label}:</strong> ${value}</p>`;
}

export function studentWelcomeEmail(application: BootcampApplication) {
  const name = firstName(application.fullName);
  const track = bootcampTracks[application.track];

  const text = [
    `Hi ${application.fullName.split(" ")[0] || application.fullName},`,
    "",
    "Thank you for registering for the TechUp Academy free bootcamp.",
    "",
    `Track: ${track}`,
    "Cohort: Free Bootcamp - October 2026",
    "",
    "Next step:",
    `Join the WhatsApp group for onboarding and session updates: ${site.whatsappGroupUrl}`,
    "",
    "If you have any questions, reply to this email.",
    "",
    "TechUp Academy",
    site.email,
    site.url,
  ].join("\n");

  const body = `
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Hi ${name},</p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:${muted};">
      Thank you for registering for the TechUp Academy free bootcamp. Your registration has been received.
    </p>
    ${detailLine("Track", track)}
    ${detailLine("Cohort", "Free Bootcamp - October 2026")}
    <p style="margin:16px 0;font-size:15px;line-height:1.7;color:${muted};">
      Please join the WhatsApp group for onboarding details and session links:
    </p>
    <p style="margin:0 0 16px;">
      <a href="${site.whatsappGroupUrl}" style="color:${navy};font-weight:700;">Join the WhatsApp group</a>
    </p>
    <p style="margin:0;font-size:14px;line-height:1.7;color:${muted};">
      If you have any questions, reply to this email and our team will help.
    </p>
  `;

  return {
    subject: "TechUp Academy bootcamp registration confirmation",
    text,
    html: emailShell({
      title: "Bootcamp registration confirmation",
      eyebrow: "Bootcamp registration confirmation",
      body,
    }),
  };
}

export function adminAlertEmail(application: BootcampApplication) {
  const track = bootcampTracks[application.track];
  const laptop = laptopLabels[application.laptop] ?? application.laptop;
  const name = escapeHtml(application.fullName);

  const text = [
    "New TechUp Academy bootcamp registration",
    "",
    `Name: ${application.fullName}`,
    `Email: ${application.email}`,
    `WhatsApp: ${application.whatsapp}`,
    `Age: ${application.age}`,
    `Gender: ${application.gender}`,
    `Education: ${application.education}`,
    `Laptop: ${laptop}`,
    `Track: ${track}`,
    "",
    "Reply to this email to contact the applicant.",
  ].join("\n");

  const body = `
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">
      New bootcamp registration received.
    </p>
    ${detailLine("Name", name)}
    ${detailLine("Email", escapeHtml(application.email))}
    ${detailLine("WhatsApp", escapeHtml(application.whatsapp))}
    ${detailLine("Age", escapeHtml(application.age))}
    ${detailLine("Gender", escapeHtml(application.gender))}
    ${detailLine("Education", escapeHtml(application.education))}
    ${detailLine("Laptop", escapeHtml(laptop))}
    ${detailLine("Track", track)}
    <p style="margin:16px 0 0;font-size:14px;line-height:1.7;color:${muted};">
      Reply to this email to contact the applicant.
    </p>
  `;

  return {
    subject: `New bootcamp registration: ${application.fullName}`,
    text,
    html: emailShell({
      title: "New bootcamp registration",
      eyebrow: "New bootcamp registration",
      body,
    }),
  };
}
