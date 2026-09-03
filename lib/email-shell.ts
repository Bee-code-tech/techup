import { site } from "@/lib/site";

export const emailColors = {
  navy: "#00206F",
  navyDeep: "#001752",
  orange: "#FB7801",
  orangeSoft: "#FFF4EB",
  muted: "#5B6475",
  border: "#E4E9F2",
  surface: "#F4F7FC",
} as const;

const { navy, navyDeep, orange, orangeSoft, muted, border, surface } =
  emailColors;

export const emailLogoUrl = `${site.url}/logo.png`;

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function escapeHtmlWithBreaks(value: string) {
  return escapeHtml(value).replaceAll("\n", "<br />");
}

export function emailPrimaryButton(href: string, label: string) {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:18px 0 8px;">
      <tr>
        <td align="center" style="background:${orange};border-radius:12px;">
          <a href="${escapeHtml(href)}" style="display:block;padding:15px 22px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;">
            ${escapeHtml(label)}
          </a>
        </td>
      </tr>
    </table>
  `;
}

export function emailShell(options: {
  title: string;
  eyebrow: string;
  heading?: string;
  subheading?: string;
  body: string;
  showEyebrowPill?: boolean;
}) {
  const showPill = options.showEyebrowPill !== false;
  const heading = options.heading?.trim();
  const subheading = options.subheading?.trim();

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(options.title)}</title>
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
                      <a href="${site.url}" style="text-decoration:none;">
                        <img
                          src="${emailLogoUrl}"
                          alt="TechUp Academy"
                          width="44"
                          height="44"
                          style="display:block;width:44px;height:44px;border:0;border-radius:999px;"
                        />
                      </a>
                    </td>
                    <td valign="middle" style="padding-left:14px;">
                      <p style="margin:0;font-size:17px;font-weight:700;color:#ffffff;line-height:1.2;">
                        TechUp Academy
                      </p>
                      <p style="margin:5px 0 0;font-size:12px;color:rgba(255,255,255,0.7);letter-spacing:0.04em;">
                        ${escapeHtml(options.eyebrow)}
                      </p>
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
                ${
                  showPill
                    ? `<p style="margin:0 0 10px;display:inline-block;background:${orangeSoft};color:${orange};font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:7px 12px;border-radius:999px;">
                  ${escapeHtml(options.eyebrow)}
                </p>`
                    : ""
                }
                ${
                  heading
                    ? `<h1 style="margin:0 0 10px;font-size:26px;line-height:1.25;font-weight:700;color:${navy};">
                  ${escapeHtml(heading)}
                </h1>`
                    : ""
                }
                ${
                  subheading
                    ? `<p style="margin:0 0 22px;font-size:15px;line-height:1.7;color:${muted};">
                  ${escapeHtml(subheading)}
                </p>`
                    : ""
                }
                ${options.body}
              </td>
            </tr>
            <tr>
              <td style="padding:8px 28px 28px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${surface};border-radius:14px;border:1px solid ${border};">
                  <tr>
                    <td style="padding:18px 20px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td valign="middle" style="width:36px;">
                            <img
                              src="${emailLogoUrl}"
                              alt=""
                              width="32"
                              height="32"
                              style="display:block;width:32px;height:32px;border:0;border-radius:999px;"
                            />
                          </td>
                          <td valign="middle" style="padding-left:12px;">
                            <p style="margin:0;font-size:13px;font-weight:700;color:${navy};">
                              TechUp Academy
                            </p>
                            <p style="margin:3px 0 0;font-size:12px;line-height:1.5;color:${muted};">
                              <a href="mailto:${site.email}" style="color:${muted};text-decoration:none;">${site.email}</a>
                              &nbsp;·&nbsp;
                              <a href="${site.url}" style="color:${muted};text-decoration:none;">${site.url.replace(/^https?:\/\//, "")}</a>
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
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
