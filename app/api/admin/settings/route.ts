import { NextResponse } from "next/server";
import {
  getWhatsappGroupUrl,
  isWhatsappGroupUrl,
  setWhatsappGroupUrl,
} from "@/lib/site-settings";

export async function GET() {
  try {
    const whatsappGroupUrl = await getWhatsappGroupUrl();
    return NextResponse.json({ whatsappGroupUrl });
  } catch (error) {
    console.error("Failed to load site settings", error);
    return NextResponse.json(
      { error: "Could not load settings." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  const body = (await request.json()) as { whatsappGroupUrl?: string };
  const whatsappGroupUrl = String(body.whatsappGroupUrl ?? "").trim();

  if (!isWhatsappGroupUrl(whatsappGroupUrl)) {
    return NextResponse.json(
      {
        error:
          "Enter a valid WhatsApp group invite link, starting with https://chat.whatsapp.com/",
      },
      { status: 400 },
    );
  }

  try {
    await setWhatsappGroupUrl(whatsappGroupUrl);
    return NextResponse.json({ ok: true, whatsappGroupUrl });
  } catch (error) {
    console.error("Failed to save site settings", error);
    return NextResponse.json(
      { error: "Could not save the WhatsApp group link." },
      { status: 500 },
    );
  }
}
