import { NextResponse } from "next/server";
import { isNextResponse, requireAnyAuth } from "@/lib/api-auth";
import { db } from "@/lib/db";

const PROFILE_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  bio: true,
  avatarUrl: true,
  whatsapp: true,
  age: true,
  gender: true,
  education: true,
  laptop: true,
  track: true,
  accessTier: true,
  mustChangePassword: true,
} as const;

export async function GET() {
  const auth = await requireAnyAuth();
  if (isNextResponse(auth)) return auth;

  const user = await db.user.findUnique({
    where: { id: auth.userId },
    select: PROFILE_SELECT,
  });

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ user });
}

export async function PATCH(request: Request) {
  const auth = await requireAnyAuth();
  if (isNextResponse(auth)) return auth;

  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    email?: string;
    bio?: string | null;
    avatarUrl?: string | null;
    whatsapp?: string | null;
    age?: number | string | null;
    gender?: string | null;
    education?: string | null;
    laptop?: string | null;
  };

  const name = typeof body.name === "string" ? body.name.trim() : undefined;
  if (name !== undefined && name.length < 2) {
    return NextResponse.json(
      { error: "Name must be at least 2 characters." },
      { status: 400 },
    );
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : undefined;
  if (email !== undefined) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 },
      );
    }
  }

  const data: {
    name?: string;
    email?: string;
    bio?: string | null;
    avatarUrl?: string | null;
    whatsapp?: string | null;
    age?: number | null;
    gender?: string | null;
    education?: string | null;
    laptop?: string | null;
  } = {};

  if (name !== undefined) data.name = name;
  if (email !== undefined) data.email = email;
  if ("bio" in body) {
    data.bio =
      typeof body.bio === "string" ? body.bio.trim() || null : null;
  }
  if ("avatarUrl" in body) {
    data.avatarUrl =
      typeof body.avatarUrl === "string" && body.avatarUrl.trim()
        ? body.avatarUrl.trim()
        : null;
  }
  if ("whatsapp" in body) {
    data.whatsapp =
      typeof body.whatsapp === "string" ? body.whatsapp.trim() || null : null;
  }

  const current = await db.user.findUnique({
    where: { id: auth.userId },
    select: { role: true, email: true },
  });
  if (!current) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (email !== undefined && email !== current.email) {
    const taken = await db.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (taken) {
      return NextResponse.json(
        { error: "That email is already in use." },
        { status: 409 },
      );
    }
  }

  if (current.role === "student") {
    if ("age" in body) {
      if (body.age === null || body.age === "") {
        data.age = null;
      } else {
        const age = Number(body.age);
        if (!Number.isFinite(age) || age < 10 || age > 100) {
          return NextResponse.json(
            { error: "Enter a valid age between 10 and 100." },
            { status: 400 },
          );
        }
        data.age = Math.round(age);
      }
    }
    if ("gender" in body) {
      data.gender =
        typeof body.gender === "string" ? body.gender.trim() || null : null;
    }
    if ("education" in body) {
      data.education =
        typeof body.education === "string"
          ? body.education.trim() || null
          : null;
    }
    if ("laptop" in body) {
      data.laptop =
        typeof body.laptop === "string" ? body.laptop.trim() || null : null;
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No changes provided." }, { status: 400 });
  }

  const user = await db.user.update({
    where: { id: auth.userId },
    data,
    select: PROFILE_SELECT,
  });

  if (
    current.role === "student" &&
    email !== undefined &&
    email !== current.email
  ) {
    await db.bootcampRegistration
      .updateMany({
        where: { email: current.email },
        data: {
          email,
          ...(name !== undefined ? { fullName: name } : {}),
          ...(data.whatsapp != null ? { whatsapp: data.whatsapp } : {}),
        },
      })
      .catch(() => undefined);
  }

  return NextResponse.json({ ok: true, user });
}
