import { cookies } from "next/headers";
import {
  COOKIE_NAME,
  LEGACY_COOKIE_NAME,
  MAX_AGE_SECONDS,
  createSessionToken,
  parseSessionToken,
  verifyAdminSession,
  type SessionPayload,
} from "@/lib/auth-token";
import { canAccessPath, type Role } from "@/lib/roles";

export async function setSessionCookie(userId: string, role: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, await createSessionToken(userId, role), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
  // Clear legacy admin cookie if present
  cookieStore.delete(LEGACY_COOKIE_NAME);
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  cookieStore.delete(LEGACY_COOKIE_NAME);
}

/** @deprecated use clearSessionCookie */
export async function clearAdminSessionCookie() {
  return clearSessionCookie();
}

export async function readSessionToken() {
  const cookieStore = await cookies();
  return (
    cookieStore.get(COOKIE_NAME)?.value ||
    cookieStore.get(LEGACY_COOKIE_NAME)?.value
  );
}

export async function getSession(): Promise<SessionPayload | null> {
  return parseSessionToken(await readSessionToken());
}

export async function getAdminSession() {
  return verifyAdminSession(await readSessionToken());
}

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function requireRole(roles: Role[]) {
  const session = await requireSession();
  if (!roles.includes(session.role as Role)) {
    throw new Error("FORBIDDEN");
  }
  return session;
}

export async function assertPathAccess(pathname: string) {
  const session = await getSession();
  if (!session) return { ok: false as const, reason: "UNAUTHORIZED" as const };
  if (!canAccessPath(session.role, pathname)) {
    return { ok: false as const, reason: "FORBIDDEN" as const };
  }
  return { ok: true as const, session };
}

export { COOKIE_NAME, verifyAdminSession };
