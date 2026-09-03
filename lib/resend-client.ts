import { Resend } from "resend";
import { site } from "@/lib/site";

export function resendErrorMessage(error: unknown) {
  if (!error || typeof error !== "object") return "Unknown email error";
  if ("message" in error && typeof error.message === "string") {
    return error.message;
  }
  return JSON.stringify(error);
}

export function getResendConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false as const, error: "Email is not configured yet." };
  }

  const from =
    process.env.RESEND_FROM ||
    "TechUp Academy <noreply@techupacademyng.com>";

  if (from.includes("@resend.dev")) {
    return {
      ok: false as const,
      error:
        "Email sender is still on Resend's test domain. Set RESEND_FROM to your verified domain.",
    };
  }

  return {
    ok: true as const,
    resend: new Resend(apiKey),
    from,
    adminEmail: process.env.ADMIN_EMAIL || site.adminEmail,
  };
}
