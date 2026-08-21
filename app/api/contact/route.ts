import { NextResponse } from "next/server";
import { Resend } from "resend";
import { parseContactMessage } from "@/lib/contact";
import { contactAdminEmail } from "@/lib/contact-email";
import { site } from "@/lib/site";

function resendErrorMessage(error: unknown) {
  if (!error || typeof error !== "object") return "Unknown email error";
  if ("message" in error && typeof error.message === "string") {
    return error.message;
  }
  return JSON.stringify(error);
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Email is not configured yet. Please try again later." },
      { status: 500 },
    );
  }

  const formData = await request.formData();
  const parsed = parseContactMessage(Object.fromEntries(formData.entries()));

  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const message = parsed.value;
  const adminEmail = process.env.ADMIN_EMAIL || site.adminEmail;
  const from =
    process.env.RESEND_FROM ||
    "TechUp Academy <noreply@techupacademyng.com>";

  if (from.includes("@resend.dev")) {
    return NextResponse.json(
      {
        error:
          "Email sender is still on Resend's test domain. Set RESEND_FROM to an address on your verified domain.",
      },
      { status: 500 },
    );
  }

  const adminMail = contactAdminEmail(message);
  const resend = new Resend(apiKey);

  const result = await resend.emails.send({
    from,
    to: adminEmail,
    replyTo: message.email,
    subject: adminMail.subject,
    text: adminMail.text,
    html: adminMail.html,
  });

  if (result.error) {
    console.error("Contact email send failed", {
      from,
      adminEmail,
      error: result.error,
    });

    return NextResponse.json(
      {
        error:
          "We could not send your message. Please try again or email us directly.",
        details: resendErrorMessage(result.error),
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
