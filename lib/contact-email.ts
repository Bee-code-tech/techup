import type { ContactMessage } from "@/lib/contact";
import { site } from "@/lib/site";

const navy = "#00206F";
const navyDeep = "#001752";
const orange = "#FB7801";
const orangeSoft = "#FFF4EB";
const muted = "#5B6475";
const border = "#E4E9F2";
const surface = "#F4F7FC";

const logoUrl = `${site.url}/logo.png`;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("\n", "<br />");
}

function escapeHtmlInline(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function contactAdminEmail(message: ContactMessage) {
  const name = escapeHtmlInline(message.fullName);
  const email = escapeHtmlInline(message.email);
  const subject = escapeHtmlInline(message.subject);
  const body = escapeHtml(message.message);
  const shortName = escapeHtmlInline(
    message.fullName.split(" ")[0] || message.fullName,
  );

  const text = [
    "New TechUp Academy contact message",
    "",
    `Name: ${message.fullName}`,
    `Email: ${message.email}`,
    `Subject: ${message.subject}`,
    "",
    "Message:",
    message.message,
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>New contact message</title>
  </head>
  <body style="margin:0;padding:0;background:${surface};font-family:Arial,Helvetica,sans-serif;color:${navy};">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${surface};padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="580" cellspacing="0" cellpadding="0" style="max-width:580px;width:100%;background:#ffffff;border:1px solid ${border};border-radius:20px;overflow:hidden;">
            <tr>
              <td style="background:${navyDeep};padding:26px 28px 22px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td valign="middle" style="width:52px;">
                      <img src="${logoUrl}" alt="TechUp Academy" width="44" height="44" style="display:block;width:44px;height:44px;border:0;border-radius:999px;" />
                    </td>
                    <td valign="middle" style="padding-left:14px;">
                      <p style="margin:0;font-size:17px;font-weight:700;color:#ffffff;line-height:1.2;">TechUp Academy</p>
                      <p style="margin:5px 0 0;font-size:12px;color:rgba(255,255,255,0.7);letter-spacing:0.04em;">Contact form</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="height:5px;background:${orange};font-size:0;line-height:0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="padding:30px 28px 8px;">
                <p style="margin:0 0 10px;display:inline-block;background:${orangeSoft};color:${orange};font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:7px 12px;border-radius:999px;">
                  New message
                </p>
                <h1 style="margin:0 0 10px;font-size:26px;line-height:1.25;font-weight:700;color:${navy};">
                  Someone reached out
                </h1>
                <p style="margin:0 0 22px;font-size:15px;line-height:1.7;color:${muted};">
                  A new message arrived through the website contact form.
                </p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 18px;background:${orangeSoft};border-radius:14px;">
                  <tr>
                    <td style="padding:14px 16px;">
                      <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${orange};">Subject</p>
                      <p style="margin:6px 0 0;font-size:18px;font-weight:700;color:${navy};">${subject}</p>
                    </td>
                  </tr>
                </table>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 22px;border:1px solid ${border};border-radius:16px;background:#ffffff;">
                  <tr>
                    <td style="padding:6px 20px 12px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="padding:14px 0;border-bottom:1px solid ${border};width:34%;font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:${muted};">Name</td>
                          <td style="padding:14px 0;border-bottom:1px solid ${border};font-size:15px;font-weight:700;color:${navy};text-align:right;">${name}</td>
                        </tr>
                        <tr>
                          <td style="padding:14px 0 0;width:34%;font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:${muted};">Email</td>
                          <td style="padding:14px 0 0;font-size:15px;font-weight:700;color:${navy};text-align:right;">${email}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:${muted};">Message</p>
                <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:${navy};">${body}</p>
                <p style="margin:0;font-size:14px;line-height:1.7;color:${muted};">
                  Reply to this email to reach ${shortName} directly.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 28px 28px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${surface};border-radius:14px;border:1px solid ${border};">
                  <tr>
                    <td style="padding:18px 20px;">
                      <p style="margin:0;font-size:13px;font-weight:700;color:${navy};">TechUp Academy</p>
                      <p style="margin:3px 0 0;font-size:12px;line-height:1.5;color:${muted};">
                        <a href="mailto:${site.email}" style="color:${muted};text-decoration:none;">${site.email}</a>
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

  return {
    subject: `Contact: ${message.subject} — ${message.fullName}`,
    text,
    html,
  };
}
