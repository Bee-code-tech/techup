import { NextResponse } from "next/server";
import { isNextResponse, requireAnyAuth } from "@/lib/api-auth";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const auth = await requireAnyAuth();
  if (isNextResponse(auth)) return auth;

  const body = (await request.json().catch(() => ({}))) as {
    currentPassword?: string;
    newPassword?: string;
  };

  const currentPassword = String(body.currentPassword || "");
  const newPassword = String(body.newPassword || "");

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: "Current and new passwords are required." },
      { status: 400 },
    );
  }
  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "New password must be at least 8 characters." },
      { status: 400 },
    );
  }
  if (newPassword === currentPassword) {
    return NextResponse.json(
      { error: "New password must be different from your current password." },
      { status: 400 },
    );
  }

  const user = await db.user.findUnique({
    where: { id: auth.userId },
    select: { passwordHash: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) {
    return NextResponse.json(
      { error: "Current password is incorrect." },
      { status: 400 },
    );
  }

  await db.user.update({
    where: { id: auth.userId },
    data: {
      passwordHash: await hashPassword(newPassword),
      mustChangePassword: false,
    },
  });

  return NextResponse.json({ ok: true });
}
