import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  createPasswordResetForUser,
  sendPasswordResetEmail,
} from "@/lib/password-reset";

type Body = { email?: string };

export async function POST(request: Request) {
  const body = (await request.json()) as Body;
  const email = String(body.email ?? "").trim().toLowerCase();

  if (!email) {
    return NextResponse.json(
      { error: "Please enter your email address." },
      { status: 400 },
    );
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json(
      {
        error:
          "No account found with that email. Check the address or create an account.",
        code: "not_found",
      },
      { status: 404 },
    );
  }

  const origin =
    request.headers.get("origin") ||
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    undefined;

  try {
    const token = await createPasswordResetForUser(user.id);
    const sent = await sendPasswordResetEmail(user.email, token, { origin });
    if (!sent.ok) {
      console.error("Password reset email failed", sent.error);
      return NextResponse.json(
        {
          error:
            sent.error ||
            "We found your account, but could not send the reset email. Try again shortly.",
        },
        { status: 502 },
      );
    }
  } catch (error) {
    console.error("Password reset create failed", error);
    return NextResponse.json(
      { error: "Could not start password reset. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: `Reset link sent to ${user.email}. Check your inbox (and spam).`,
  });
}
