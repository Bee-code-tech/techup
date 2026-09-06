/**
 * Compatibility re-exports — prefer `@/lib/session` and `@/lib/auth-token`.
 */
export {
  COOKIE_NAME,
  MAX_AGE_SECONDS,
  createSessionToken,
  parseSessionToken,
  verifyAdminSession,
} from "@/lib/auth-token";

export type { SessionPayload } from "@/lib/auth-token";
