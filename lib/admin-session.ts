/**
 * Compatibility re-exports — prefer `@/lib/session`.
 */
export {
  setSessionCookie,
  clearAdminSessionCookie,
  clearSessionCookie,
  getSession,
  getAdminSession,
  requireAdminSession,
  requireSession,
  requireRole,
  COOKIE_NAME,
  verifyAdminSession,
} from "@/lib/session";
