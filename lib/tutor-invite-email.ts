import { randomBytes } from "crypto";
import { site } from "@/lib/site";
import { getResendConfig } from "@/lib/resend-client";
import {
  emailColors,
  emailPrimaryButton,
  emailShell,
} from "@/lib/email-shell";
import { bootcampTracks } from "@/lib/bootcamp";

export function generateTempPassword() {
  return randomBytes(4).toString("hex") + "A1!";
}

export async function sendTutorInviteEmail(options: {
  name: string;
  email: string;
  tempPassword: string;
  tracks: string[];
}) {
  const config = getResendConfig();
  if (!config.ok) {
    return { ok: false as const, error: config.error };
  }

  const loginUrl = `${site.url}/auth`;
  const trackLabels = options.tracks
    .map((track) => bootcampTracks[track] || track)
    .join(", ");
  const { navy, muted } = emailColors;

  const result = await config.resend.emails.send({
    from: config.from,
    to: options.email,
    replyTo: config.adminEmail,
    subject: "You're invited as a TechUp Academy tutor",
    text: [
      `Hi ${options.name.split(" ")[0] || options.name},`,
      "",
      "You've been invited to teach on TechUp Academy.",
      `Tracks: ${trackLabels || "To be assigned"}`,
      "",
      `Login: ${loginUrl}`,
      `Email: ${options.email}`,
      `Temporary password: ${options.tempPassword}`,
      "",
      "Please log in and change your password after first sign-in.",
    ].join("\n"),
    html: emailShell({
      title: "Tutor invite",
      eyebrow: "Welcome tutor",
      heading: `You're invited, ${options.name.split(" ")[0] || options.name}`,
      subheading: "Sign in with the temporary password below, then change it.",
      body: `
        <p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:${muted};">
          Tracks assigned: <strong style="color:${navy};">${trackLabels || "Pending"}</strong>
        </p>
        <p style="margin:0 0 8px;font-size:14px;color:${muted};">Email: <strong style="color:${navy};">${options.email}</strong></p>
        <p style="margin:0 0 16px;font-size:14px;color:${muted};">Temporary password: <strong style="color:${navy};">${options.tempPassword}</strong></p>
        ${emailPrimaryButton(loginUrl, "Open tutor login")}
      `,
    }),
  });

  if (result.error) {
    return { ok: false as const, error: "Could not send invite email." };
  }
  return { ok: true as const };
}
