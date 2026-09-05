import { NextResponse } from "next/server";
import { bootcampTracks } from "@/lib/bootcamp";
import {
  getWhatsappGroupUrls,
  isWhatsappGroupUrl,
  setWhatsappGroupUrls,
  type WhatsappGroupUrls,
} from "@/lib/site-settings";

export async function GET() {
  try {
    const whatsappGroupUrls = await getWhatsappGroupUrls();
    return NextResponse.json({
      whatsappGroupUrls,
      tracks: Object.entries(bootcampTracks).map(([id, label]) => ({
        id,
        label,
      })),
    });
  } catch (error) {
    console.error("Failed to load site settings", error);
    return NextResponse.json(
      { error: "Could not load settings." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  const body = (await request.json()) as {
    whatsappGroupUrls?: WhatsappGroupUrls;
  };
  const incoming =
    body.whatsappGroupUrls && typeof body.whatsappGroupUrls === "object"
      ? body.whatsappGroupUrls
      : null;

  if (!incoming) {
    return NextResponse.json(
      { error: "Send a WhatsApp link for each track." },
      { status: 400 },
    );
  }

  const whatsappGroupUrls: WhatsappGroupUrls = {};
  for (const track of Object.keys(bootcampTracks)) {
    const value = String(incoming[track] ?? "").trim();
    if (!value) continue;
    if (!isWhatsappGroupUrl(value)) {
      return NextResponse.json(
        {
          error: `Enter a valid WhatsApp invite link for ${bootcampTracks[track]}, starting with https://chat.whatsapp.com/`,
        },
        { status: 400 },
      );
    }
    whatsappGroupUrls[track] = value;
  }

  if (Object.keys(whatsappGroupUrls).length === 0) {
    return NextResponse.json(
      { error: "Add at least one WhatsApp group link." },
      { status: 400 },
    );
  }

  try {
    await setWhatsappGroupUrls(whatsappGroupUrls);
    const saved = await getWhatsappGroupUrls();
    return NextResponse.json({ ok: true, whatsappGroupUrls: saved });
  } catch (error) {
    console.error("Failed to save site settings", error);
    return NextResponse.json(
      { error: "Could not save the WhatsApp group links." },
      { status: 500 },
    );
  }
}
