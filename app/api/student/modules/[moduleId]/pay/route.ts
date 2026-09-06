import { NextResponse } from "next/server";
import { isNextResponse, requireStudent } from "@/lib/api-auth";
import { db } from "@/lib/db";

type RouteContext = { params: Promise<{ moduleId: string }> };

/** Default unlock price in kobo (₦5,000). Override with MODULE_UNLOCK_AMOUNT_KOBO. */
function unlockAmountKobo() {
  const raw = Number(process.env.MODULE_UNLOCK_AMOUNT_KOBO || 500000);
  return Number.isFinite(raw) && raw > 0 ? Math.round(raw) : 500000;
}

export async function POST(_request: Request, context: RouteContext) {
  const auth = await requireStudent();
  if (isNextResponse(auth)) return auth;

  const { moduleId } = await context.params;

  const user = await db.user.findUnique({
    where: { id: auth.userId },
    select: {
      id: true,
      email: true,
      name: true,
      track: true,
      accessTier: true,
    },
  });
  if (!user?.track) {
    return NextResponse.json({ error: "No track enrolled." }, { status: 400 });
  }

  const moduleRow = await db.module.findUnique({
    where: { id: moduleId },
    include: { course: { select: { track: true, published: true, title: true } } },
  });
  if (
    !moduleRow ||
    !moduleRow.course.published ||
    moduleRow.course.track !== user.track
  ) {
    return NextResponse.json({ error: "Module not found." }, { status: 404 });
  }
  if (moduleRow.access !== "paid") {
    return NextResponse.json(
      { error: "This module does not require payment." },
      { status: 400 },
    );
  }
  if (user.accessTier === "paid") {
    return NextResponse.json({
      ok: true,
      alreadyUnlocked: true,
      message: "Your account already has paid access.",
    });
  }

  const existingUnlock = await db.moduleUnlock.findUnique({
    where: {
      userId_moduleId: { userId: user.id, moduleId },
    },
  });
  if (existingUnlock) {
    return NextResponse.json({
      ok: true,
      alreadyUnlocked: true,
      message: "Module already unlocked.",
    });
  }

  const secret = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!secret) {
    return NextResponse.json(
      {
        error:
          "Paystack is not configured yet. Add PAYSTACK_SECRET_KEY to enable checkout.",
      },
      { status: 503 },
    );
  }

  const amount = unlockAmountKobo();
  const reference = `mod_${moduleId.slice(-8)}_${user.id.slice(-8)}_${Date.now()}`;

  await db.payment.create({
    data: {
      userId: user.id,
      moduleId,
      amount,
      currency: "NGN",
      paystackReference: reference,
      status: "pending",
    },
  });

  const origin =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    process.env.APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3000";

  const paystackResponse = await fetch(
    "https://api.paystack.co/transaction/initialize",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        amount,
        reference,
        callback_url: `${origin}/dashboard/learn/course/${moduleRow.courseId}/${moduleId}?paid=1`,
        metadata: {
          userId: user.id,
          moduleId,
          courseId: moduleRow.courseId,
          moduleTitle: moduleRow.title,
        },
      }),
    },
  );

  const payload = (await paystackResponse.json()) as {
    status?: boolean;
    message?: string;
    data?: { authorization_url?: string; access_code?: string; reference?: string };
  };

  if (!paystackResponse.ok || !payload.status || !payload.data?.authorization_url) {
    await db.payment.update({
      where: { paystackReference: reference },
      data: { status: "failed" },
    });
    return NextResponse.json(
      { error: payload.message || "Could not start Paystack checkout." },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    authorizationUrl: payload.data.authorization_url,
    reference: payload.data.reference || reference,
    amount,
  });
}
