import { NextResponse } from "next/server";
import { isNextResponse, requireTutorOrAdmin } from "@/lib/api-auth";
import { db } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(_request: Request, context: RouteContext) {
  const auth = await requireTutorOrAdmin();
  if (isNextResponse(auth)) return auth;

  const { id } = await context.params;
  const session = await db.liveSession.findUnique({ where: { id } });
  if (!session) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }
  if (auth.role !== "admin" && session.tutorId !== auth.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await db.liveSession.update({
    where: { id },
    data: { isActive: false, endedAt: new Date() },
  });

  return NextResponse.json({ ok: true, session: updated });
}
