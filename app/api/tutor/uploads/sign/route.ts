import { NextResponse } from "next/server";
import { isNextResponse, requireTutorOrAdmin } from "@/lib/api-auth";
import { createUploadSignature } from "@/lib/cloudinary";

export async function POST(request: Request) {
  const auth = await requireTutorOrAdmin();
  if (isNextResponse(auth)) return auth;

  const body = (await request.json().catch(() => ({}))) as {
    resourceType?: "image" | "video" | "raw" | "auto";
    folder?: string;
  };

  const signed = createUploadSignature({
    resourceType: body.resourceType || "auto",
    folder: body.folder || "techup/modules",
  });

  if (!signed.ok) {
    return NextResponse.json({ error: signed.error }, { status: 500 });
  }

  return NextResponse.json(signed);
}
