import { requireRole, requireSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function requireAdmin() {
  try {
    return await requireRole(["admin"]);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}

export async function requireTutorOrAdmin() {
  try {
    return await requireRole(["tutor", "admin"]);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}

export async function requireStudent() {
  try {
    return await requireRole(["student"]);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}

export async function requireAnyAuth() {
  try {
    return await requireSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export function isNextResponse(
  value: unknown,
): value is NextResponse {
  return value instanceof NextResponse;
}
