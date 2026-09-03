import { site } from "@/lib/site";

const navy = "#00206F";
const navyDeep = "#001752";
const orange = "#FB7801";
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

export function broadcastEmail(options: {
  subject: string;
  message: string;
  recipientName?: string;
}) {
  const greeting = options.recipientName
    ? `Hi ${escapeHtml(options.recipientName.split(" ")[0] || options.recipientName)},`
    : "Hi there,";
  const bodyHtml = escapeHtml(options.message);

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(options.subject)}</title>
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
                      <p style="margin:5px 0 0;font-size:12px;color:rgba(255,255,255,0.7);letter-spacing:0.04em;">Bootcamp update</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="height:5px;background:${orange};font-size:0;line-height:0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="padding:30px 28px 28px;">
                <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${navy};">${greeting}</p>
                <p style="margin:0 0 22px;font-size:15px;line-height:1.7;color:${muted};">${bodyHtml}</p>
                <p style="margin:0;font-size:13px;line-height:1.6;color:${muted};">
                  TechUp Academy · ${site.email}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    options.recipientName
      ? `Hi ${options.recipientName.split(" ")[0] || options.recipientName},`
      : "Hi there,",
    "",
    options.message,
    "",
    "TechUp Academy",
    site.email,
    site.url,
  ].join("\n");

  return { html, text };
}
