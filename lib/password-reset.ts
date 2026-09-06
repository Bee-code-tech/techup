import { createHash, randomBytes } from "crypto";
import { hashPassword } from "@/lib/auth/password";
import { db } from "@/lib/db";
import { site } from "@/lib/site";
import { getResendConfig } from "@/lib/resend-client";
import {
  emailColors,
  emailPrimaryButton,
  emailShell,
} from "@/lib/email-shell";

const RESET_TTL_MS = 1000 * 60 * 60; // 1 hour

export function hashResetToken(token: string) {
  return createHash("sha256").update(token.trim()).digest("hex");
}

export async function createPasswordResetForUser(userId: string) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashResetToken(token);
  const expiresAt = new Date(Date.now() + RESET_TTL_MS);

  // Replace prior tokens for this user (avoid Prisma+Mongo `usedAt: null` filters)
  await db.passwordResetToken.deleteMany({ where: { userId } });

  await db.passwordResetToken.create({
    data: { userId, tokenHash, expiresAt },
  });

  return token;
}

export type ConsumeResetResult =
  | { ok: true; userId: string; id: string }
  | { ok: false; reason: "invalid" | "used" | "expired" };

export async function consumePasswordResetToken(
  rawToken: string,
): Promise<ConsumeResetResult> {
  const token = rawToken.trim();
  if (!token) return { ok: false, reason: "invalid" };

  const tokenHash = hashResetToken(token);

  // Don't filter usedAt/expiresAt in the query — Prisma+Mongo null matching is unreliable.
  const record = await db.passwordResetToken.findFirst({
    where: { tokenHash },
    orderBy: { createdAt: "desc" },
  });

  if (!record) return { ok: false, reason: "invalid" };
  if (record.usedAt) return { ok: false, reason: "used" };
  if (record.expiresAt.getTime() <= Date.now()) {
    return { ok: false, reason: "expired" };
  }

  await db.passwordResetToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  return { ok: true, userId: record.userId, id: record.id };
}

export async function setUserPassword(
  userId: string,
  password: string,
  options?: { clearMustChange?: boolean },
) {
  const data: {
    passwordHash: string;
    mustChangePassword?: boolean;
  } = {
    passwordHash: await hashPassword(password),
  };

  if (options?.clearMustChange !== false) {
    data.mustChangePassword = false;
  }

  try {
    await db.user.update({
      where: { id: userId },
      data,
    });
  } catch (error) {
    // Fallback if a stale client rejects mustChangePassword
    await db.user.update({
      where: { id: userId },
      data: { passwordHash: data.passwordHash },
    });
    console.error("Password update fell back to hash-only", error);
  }
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
  options?: { origin?: string },
) {
  const config = getResendConfig();
  if (!config.ok) {
    return { ok: false as const, error: config.error };
  }

  const baseUrl = (options?.origin || site.url).replace(/\/$/, "");
  const resetUrl = `${baseUrl}/auth?mode=reset&token=${encodeURIComponent(token)}`;
  const { navy, muted } = emailColors;

  const result = await config.resend.emails.send({
    from: config.from,
    to: email,
    replyTo: config.adminEmail,
    subject: "Reset your TechUp Academy password",
    text: [
      "Reset your TechUp Academy password",
      "",
      `Open this link to choose a new password (expires in 1 hour):`,
      resetUrl,
      "",
      "If you did not request this, you can ignore this email.",
    ].join("\n"),
    html: emailShell({
      title: "Reset password",
      eyebrow: "Account security",
      heading: "Choose a new password",
      subheading: "This link expires in one hour.",
      body: `
        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:${muted};">
          Click the button below to reset the password for <strong style="color:${navy};">${email}</strong>.
        </p>
        ${emailPrimaryButton(resetUrl, "Reset password")}
        <p style="margin:16px 0 0;font-size:13px;line-height:1.7;color:${muted};">
          If you did not request a reset, you can ignore this email.
        </p>
      `,
    }),
  });

  if (result.error) {
    return { ok: false as const, error: "Could not send reset email." };
  }
  return { ok: true as const };
}
