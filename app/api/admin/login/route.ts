import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth/password";
import { db } from "@/lib/db";
import { dashboardHomeForRole } from "@/lib/roles";
import { setSessionCookie } from "@/lib/session";

type LoginBody = {
  email?: string;
  password?: string;
};

/** @deprecated Prefer POST /api/auth/login */
export async function POST(request: Request) {
  const body = (await request.json()) as LoginBody;
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 },
    );
  }

  try {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    await setSessionCookie(user.id, user.role);

    return NextResponse.json({
      ok: true,
      redirectTo: dashboardHomeForRole(user.role),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login failed", error);
    return NextResponse.json(
      { error: "Login failed. Check database connection." },
      { status: 500 },
    );
  }
}
