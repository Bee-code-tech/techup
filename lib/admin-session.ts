import { cookies } from "next/headers";
import {
  COOKIE_NAME,
  MAX_AGE_SECONDS,
  createSessionToken,
  parseSessionToken,
  verifyAdminSession,
} from "@/lib/admin-auth-token";

export async function setSessionCookie(userId: string, role: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, await createSessionToken(userId, role), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession() {
  const cookieStore = await cookies();
  return parseSessionToken(cookieStore.get(COOKIE_NAME)?.value);
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  return verifyAdminSession(cookieStore.get(COOKIE_NAME)?.value);
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export { COOKIE_NAME, verifyAdminSession };
