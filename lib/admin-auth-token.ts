export type SessionPayload = {
  userId: string;
  role: string;
  expiresAt: number;
};

const COOKIE_NAME = "techup_admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const ADMIN_ROLE = "admin";

function sessionSecret() {
  const secret =
    process.env.ADMIN_SESSION_SECRET || process.env.MONGODB_URI;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET or MONGODB_URI must be set.");
  }
  return secret;
}

async function sign(payload: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(sessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload),
  );
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function encodePayload(payload: SessionPayload) {
  return `${payload.userId}:${payload.role}:${payload.expiresAt}`;
}

function decodePayload(raw: string): SessionPayload | null {
  const parts = raw.split(":");
  if (parts.length !== 3) return null;

  const [userId, role, expiresRaw] = parts;
  const expiresAt = Number(expiresRaw);
  if (!userId || !role || !expiresRaw || Number.isNaN(expiresAt)) {
    return null;
  }

  return { userId, role, expiresAt };
}

export async function createSessionToken(userId: string, role: string) {
  const payload: SessionPayload = {
    userId,
    role,
    expiresAt: Date.now() + MAX_AGE_SECONDS * 1000,
  };
  const encoded = encodePayload(payload);
  return `${encoded}.${await sign(encoded)}`;
}

export async function parseSessionToken(
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token) return null;

  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const expected = await sign(encoded);
  if (signature.length !== expected.length) return null;

  let mismatch = 0;
  for (let index = 0; index < signature.length; index += 1) {
    mismatch |= signature.charCodeAt(index) ^ expected.charCodeAt(index);
  }
  if (mismatch !== 0) return null;

  const payload = decodePayload(encoded);
  if (!payload || Date.now() > payload.expiresAt) {
    return null;
  }

  return payload;
}

export async function verifyAdminSession(token: string | undefined) {
  const payload = await parseSessionToken(token);
  if (!payload || payload.role !== ADMIN_ROLE) {
    return null;
  }
  return payload;
}

export { ADMIN_ROLE, COOKIE_NAME, MAX_AGE_SECONDS };
