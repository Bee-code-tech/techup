import {
  bootcampTracks,
  laptopLabels,
  type BootcampApplication,
} from "@/lib/bootcamp";
import {
  emailColors,
  emailPrimaryButton,
  emailShell,
  escapeHtml,
} from "@/lib/email-shell";
import { site } from "@/lib/site";

const { navy, orange, orangeSoft, muted, border } = emailColors;

function firstName(fullName: string) {
  return fullName.split(" ")[0] || fullName;
}

function infoCard(rows: Array<[string, string]>) {
  const items = rows
    .map(([label, value], index) => {
      const isLast = index === rows.length - 1;
      return `
        <tr>
          <td style="padding:${isLast ? "14px 0 0" : "14px 0"};border-bottom:${isLast ? "0" : `1px solid ${border}`};width:34%;font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:${muted};">
            ${label}
          </td>
          <td style="padding:${isLast ? "14px 0 0" : "14px 0"};border-bottom:${isLast ? "0" : `1px solid ${border}`};font-size:15px;font-weight:700;color:${navy};text-align:right;">
            ${value}
          </td>
        </tr>
      `;
    })
    .join("");

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 22px;border:1px solid ${border};border-radius:16px;background:#ffffff;">
      <tr>
        <td style="padding:6px 20px 12px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            ${items}
          </table>
        </td>
      </tr>
    </table>
  `;
}


function nextStep(number: string, title: string, copy: string) {
  return `
    <tr>
      <td valign="top" style="padding:0 12px 14px 0;width:34px;">
        <div style="width:28px;height:28px;border-radius:999px;background:${navy};color:#ffffff;font-size:13px;font-weight:700;line-height:28px;text-align:center;">
          ${number}
        </div>
      </td>
      <td valign="top" style="padding:0 0 14px;">
        <p style="margin:0 0 3px;font-size:15px;font-weight:700;color:${navy};">${title}</p>
        <p style="margin:0;font-size:13px;line-height:1.6;color:${muted};">${copy}</p>
      </td>
    </tr>
  `;
}

export function studentWelcomeEmail(
  application: BootcampApplication,
  whatsappGroupUrl: string = site.whatsappGroupUrl,
) {
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
    `Join the WhatsApp group for onboarding and session updates: ${whatsappGroupUrl}`,
    "",
    "If you have any questions, reply to this email.",
    "",
    "TechUp Academy",
    site.email,
    site.url,
  ].join("\n");

  const body = `
    ${infoCard([
      ["Track", track],
      ["Cohort", "Free Bootcamp · October 2026"],
      ["Status", "Confirmed"],
    ])}
    <p style="margin:0 0 14px;font-size:16px;font-weight:700;color:${navy};">
      What to do next
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 8px;">
      ${nextStep("1", "Join the WhatsApp group", "Onboarding notes and session links are shared there first.")}
      ${nextStep("2", "Keep this confirmation", "Save this email for your registration details.")}
      ${nextStep("3", "Reply if you need help", "Our team will respond if anything is unclear.")}
    </table>
    ${emailPrimaryButton(whatsappGroupUrl, "Join WhatsApp Group")}
    <p style="margin:0;font-size:13px;line-height:1.7;color:${muted};">
      Questions? Reply to this email and the TechUp team will assist you.
    </p>
  `;

  return {
    subject: "TechUp Academy bootcamp registration confirmation",
    text,
    html: emailShell({
      title: "Bootcamp registration confirmation",
      eyebrow: "Registration confirmed",
      heading: `Welcome, ${name}`,
      subheading:
        "Your TechUp Academy free bootcamp registration has been received successfully.",
      body,
    }),
  };
}

export function adminAlertEmail(application: BootcampApplication) {
  const track = bootcampTracks[application.track];
  const laptop = laptopLabels[application.laptop] ?? application.laptop;
  const name = escapeHtml(application.fullName);
  const shortName = escapeHtml(
    application.fullName.split(" ")[0] || application.fullName,
  );

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
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 18px;background:${orangeSoft};border-radius:14px;">
      <tr>
        <td style="padding:14px 16px;">
          <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${orange};">
            Selected track
          </p>
          <p style="margin:6px 0 0;font-size:18px;font-weight:700;color:${navy};">
            ${track}
          </p>
        </td>
      </tr>
    </table>
    ${infoCard([
      ["Name", name],
      ["Email", escapeHtml(application.email)],
      ["WhatsApp", escapeHtml(application.whatsapp)],
      ["Age", escapeHtml(application.age)],
      ["Gender", escapeHtml(application.gender)],
      ["Education", escapeHtml(application.education)],
      ["Laptop", escapeHtml(laptop)],
      ["Track", track],
    ])}
    <p style="margin:0;font-size:14px;line-height:1.7;color:${muted};">
      Reply to this email to reach ${shortName} directly.
    </p>
  `;

  return {
    subject: `New bootcamp registration: ${application.fullName}`,
    text,
    html: emailShell({
      title: "New bootcamp registration",
      eyebrow: "New registration",
      heading: "A new applicant just registered",
      subheading:
        "A confirmation email has been sent to the student. Review their details below.",
      body,
    }),
  };
}
