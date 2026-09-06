import { NextResponse } from "next/server";
import { isNextResponse, requireAnyAuth } from "@/lib/api-auth";
import { createUploadSignature } from "@/lib/cloudinary";

export async function POST(request: Request) {
  const auth = await requireAnyAuth();
  if (isNextResponse(auth)) return auth;

  const body = (await request.json().catch(() => ({}))) as {
    folder?: string;
  };

  const signed = createUploadSignature({
    resourceType: "image",
    folder: body.folder || `techup/avatars/${auth.userId}`,
  });

  if (!signed.ok) {
    return NextResponse.json({ error: signed.error }, { status: 500 });
  }

  return NextResponse.json(signed);
}
