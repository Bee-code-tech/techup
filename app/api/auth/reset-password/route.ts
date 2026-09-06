import { NextResponse } from "next/server";
import {
  consumePasswordResetToken,
  setUserPassword,
} from "@/lib/password-reset";

type Body = {
  token?: string;
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as Body;
  const token = String(body.token ?? "").trim();
  const password = String(body.password ?? "");

  if (!token) {
    return NextResponse.json(
      { error: "Reset token is missing. Open the link from your email again." },
      { status: 400 },
    );
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }

  const result = await consumePasswordResetToken(token);
  if (!result.ok) {
    const message =
      result.reason === "expired"
        ? "This reset link has expired. Request a new one."
        : result.reason === "used"
          ? "This reset link was already used. Request a new one if you still need to change your password."
          : "This reset link is invalid. Request a new one from the forgot password page.";

    return NextResponse.json(
      { error: message, code: result.reason },
      { status: 400 },
    );
  }

  try {
    await setUserPassword(result.userId, password);
  } catch (error) {
    console.error("Failed to set password after token consume", error);
    return NextResponse.json(
      { error: "Could not update password. Please request a new reset link." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Password updated. You can log in with your new password.",
  });
}
