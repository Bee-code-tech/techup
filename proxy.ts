import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  COOKIE_NAME,
  LEGACY_COOKIE_NAME,
  parseSessionToken,
} from "@/lib/auth-token";
import { canAccessPath } from "@/lib/roles";

const PUBLIC_PATHS = [
  "/auth",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/admin/login",
];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin" || pathname === "/admin/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  if (pathname === "/admin/login") {
    const url = new URL("/auth", request.url);
    const next = request.nextUrl.searchParams.get("next");
    if (next) url.searchParams.set("next", next);
    return NextResponse.redirect(url);
  }
  if (pathname.startsWith("/admin/")) {
    const rest = pathname.replace(/^\/admin/, "/dashboard");
    return NextResponse.redirect(new URL(rest, request.url));
  }

  const needsAuth =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/api/tutor") ||
    pathname.startsWith("/api/student") ||
    pathname.startsWith("/api/auth/me") ||
    pathname.startsWith("/api/auth/logout") ||
    pathname.startsWith("/api/auth/profile") ||
    pathname.startsWith("/api/auth/password") ||
    pathname.startsWith("/api/auth/avatar");

  if (!needsAuth || isPublic(pathname)) {
    return NextResponse.next();
  }

  const token =
    request.cookies.get(COOKIE_NAME)?.value ||
    request.cookies.get(LEGACY_COOKIE_NAME)?.value;

  let session = null;
  try {
    session = await parseSessionToken(token);
  } catch {
    session = null;
  }

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/auth", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/api/admin") && session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (
    pathname.startsWith("/api/tutor") &&
    session.role !== "tutor" &&
    session.role !== "admin"
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (pathname.startsWith("/api/student") && session.role !== "student") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (
    pathname.startsWith("/dashboard") &&
    !canAccessPath(session.role, pathname)
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/api/admin/:path*",
    "/api/tutor/:path*",
    "/api/student/:path*",
    "/api/auth/me",
    "/api/auth/logout",
    "/api/auth/profile",
    "/api/auth/password",
    "/api/auth/avatar/:path*",
  ],
};
