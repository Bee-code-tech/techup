import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Admin session lookup failed", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
