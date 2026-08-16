import {
  bootcampTracks,
  laptopLabels,
  type BootcampApplication,
} from "@/lib/bootcamp";
import { site } from "@/lib/site";

const navy = "#00206F";
const navyDeep = "#001752";
const orange = "#FB7801";
const muted = "#5B6475";
const surface = "#F4F7FC";
const border = "#E4E9F2";

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
  preheader: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  body: string;
}) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${options.title}</title>
  </head>
  <body style="margin:0;padding:0;background:${surface};font-family:'Montserrat',Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      ${options.preheader}
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${surface};padding:28px 12px 40px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;">
            <tr>
              <td style="padding:8px 8px 18px;">
                <p style="margin:0;font-size:13px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:${navy};">TechUp Academy</p>
              </td>
            </tr>
            <tr>
              <td style="background:${navyDeep};border-radius:28px 28px 0 0;padding:36px 32px 28px;">
                <p style="margin:0;display:inline-block;background:rgba(251,120,1,0.16);color:${orange};font-size:11px;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;padding:7px 12px;border-radius:999px;">${options.eyebrow}</p>
                <h1 style="margin:18px 0 10px;color:#ffffff;font-size:32px;line-height:1.15;font-weight:800;">${options.title}</h1>
                <p style="margin:0;color:rgba(255,255,255,0.78);font-size:15px;line-height:1.7;max-width:460px;">${options.subtitle}</p>
              </td>
            </tr>
            <tr>
              <td style="height:6px;background:linear-gradient(90deg, ${orange} 0%, #ffb067 50%, ${orange} 100%);font-size:0;line-height:0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="background:#ffffff;padding:32px 28px 12px;">
                ${options.body}
              </td>
            </tr>
            <tr>
              <td style="background:#ffffff;border-radius:0 0 28px 28px;padding:8px 28px 28px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${surface};border-radius:18px;">
                  <tr>
                    <td style="padding:18px 20px;">
                      <p style="margin:0 0 4px;color:${navy};font-size:13px;font-weight:800;">TechUp Academy</p>
                      <p style="margin:0;color:${muted};font-size:12px;line-height:1.6;">Empowering Nigeria’s tech talent with skills that matter in the global digital economy.</p>
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

function detailRow(label: string, value: string, last = false) {
  return `
    <tr>
      <td style="padding:${last ? "12px 0 0" : "12px 0"};border-bottom:${last ? "0" : `1px solid ${border}`};width:38%;color:${muted};font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;">${label}</td>
      <td style="padding:${last ? "12px 0 0" : "12px 0"};border-bottom:${last ? "0" : `1px solid ${border}`};color:${navy};font-size:15px;font-weight:700;text-align:right;">${value}</td>
    </tr>
  `;
}

function step(number: string, title: string, copy: string) {
  return `
    <tr>
      <td valign="top" style="padding:0 12px 16px 0;width:36px;">
        <div style="width:28px;height:28px;border-radius:999px;background:${navy};color:#ffffff;font-size:13px;font-weight:800;line-height:28px;text-align:center;">${number}</div>
      </td>
      <td valign="top" style="padding:0 0 16px;">
        <p style="margin:0 0 4px;color:${navy};font-size:15px;font-weight:800;">${title}</p>
        <p style="margin:0;color:${muted};font-size:13px;line-height:1.6;">${copy}</p>
      </td>
    </tr>
  `;
}

export function studentWelcomeEmail(application: BootcampApplication) {
  const name = firstName(application.fullName);
  const track = bootcampTracks[application.track];
  const body = `
    <p style="margin:0 0 18px;color:${navy};font-size:18px;font-weight:800;">Hi ${name}, your runway just opened.</p>
    <p style="margin:0 0 24px;color:${muted};font-size:15px;line-height:1.75;">
      You didn’t just fill a form — you claimed a seat in Nigeria’s most intensive free tech sprint. Mentors, projects, and a community that actually shows up are waiting on the other side.
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${navy};border-radius:22px;margin-bottom:24px;">
      <tr>
        <td style="padding:22px 22px 8px;">
          <p style="margin:0;color:${orange};font-size:11px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;">Your reservation</p>
          <p style="margin:8px 0 0;color:#ffffff;font-size:22px;font-weight:800;">${escapeHtml(application.fullName)}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 22px 22px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="padding:12px 12px 0 0;width:50%;">
                <p style="margin:0;color:rgba(255,255,255,0.55);font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Track</p>
                <p style="margin:6px 0 0;color:#ffffff;font-size:15px;font-weight:700;">${track}</p>
              </td>
              <td style="padding:12px 0 0;">
                <p style="margin:0;color:rgba(255,255,255,0.55);font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Cohort</p>
                <p style="margin:6px 0 0;color:#ffffff;font-size:15px;font-weight:700;">Free Bootcamp · Oct 2026</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 14px;color:${navy};font-size:16px;font-weight:800;">What happens next</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:8px;">
      ${step("1", "Join the WhatsApp circle", "This is HQ. Onboarding, live session links, and mentor drops all happen here.")}
      ${step("2", "Show up ready", "Bring curiosity, a laptop if you have one, and energy. We’ll handle the rest.")}
      ${step("3", "Build something real", "Two weeks. Real projects. A portfolio piece you can actually talk about.")}
    </table>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:8px 0 22px;">
      <tr>
        <td align="center" style="background:${orange};border-radius:999px;">
          <a href="${site.whatsappGroupUrl}" style="display:block;padding:16px 24px;color:#ffffff;text-decoration:none;font-weight:800;font-size:15px;">Join the WhatsApp Group</a>
        </td>
      </tr>
    </table>
    <p style="margin:0;color:${muted};font-size:13px;line-height:1.7;">
      Keep this email. If anything feels unclear, just reply — a human on the TechUp team will see it.
    </p>
  `;

  return {
    subject: `${name}, you're in — your TechUp bootcamp seat is reserved`,
    html: emailShell({
      preheader: `Your ${track} seat is locked. Join the WhatsApp group to get onboarding, schedules, and mentor updates.`,
      eyebrow: "You're officially in",
      title: "The next chapter starts now.",
      subtitle:
        "Your free bootcamp spot is confirmed. One more tap and you’re inside the community.",
      body,
    }),
  };
}

export function adminAlertEmail(application: BootcampApplication) {
  const track = bootcampTracks[application.track];
  const laptop = laptopLabels[application.laptop] ?? application.laptop;
  const name = escapeHtml(application.fullName);
  const body = `
    <p style="margin:0 0 8px;color:${navy};font-size:18px;font-weight:800;">Fresh talent just walked in.</p>
    <p style="margin:0 0 22px;color:${muted};font-size:15px;line-height:1.75;">
      Someone new just reserved a seat in the free bootcamp. They’ve been sent a welcome email and invited into the WhatsApp community.
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:18px;">
      <tr>
        <td style="background:${orange};color:#ffffff;font-size:12px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;padding:8px 12px;border-radius:999px;display:inline-block;">${track}</td>
      </tr>
    </table>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid ${border};border-radius:20px;padding:6px 18px 10px;">
      ${detailRow("Name", name)}
      ${detailRow("Email", escapeHtml(application.email))}
      ${detailRow("WhatsApp", escapeHtml(application.whatsapp))}
      ${detailRow("Age", escapeHtml(application.age))}
      ${detailRow("Gender", escapeHtml(application.gender))}
      ${detailRow("Education", escapeHtml(application.education))}
      ${detailRow("Laptop", escapeHtml(laptop))}
      ${detailRow("Track", track, true)}
    </table>
    <p style="margin:22px 0 0;color:${muted};font-size:13px;line-height:1.7;">
      Reply directly to this email to reach ${name.split(" ")[0]}.
    </p>
  `;

  return {
    subject: `New bootcamp talent: ${application.fullName} · ${track}`,
    html: emailShell({
      preheader: `${application.fullName} just joined the ${track} bootcamp. Open for their details.`,
      eyebrow: "Admin alert",
      title: "A new person just joined the bootcamp.",
      subtitle: "Their confirmation is already in their inbox. Here’s the snapshot.",
      body,
    }),
  };
}
