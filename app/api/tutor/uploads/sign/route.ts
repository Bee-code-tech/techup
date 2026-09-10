import { NextResponse } from "next/server"
import { isNextResponse, requireTutorOrAdmin } from "@/lib/api-auth"
import { createPresignedUpload } from "@/lib/tigris"

/** @deprecated Prefer POST /api/uploads/sign — kept as alias for older clients. */
export async function POST(request: Request) {
  const auth = await requireTutorOrAdmin()
  if (isNextResponse(auth)) return auth

  const body = (await request.json().catch(() => ({}))) as {
    resourceType?: string
    folder?: string
    filename?: string
    contentType?: string
    size?: number
  }

  const folder =
    body.folder?.includes("cover")
      ? "covers"
      : body.resourceType === "video"
        ? "videos"
        : body.resourceType === "image"
          ? "covers"
          : "materials"

  const signed = await createPresignedUpload({
    userId: auth.userId,
    folder,
    filename: body.filename || "upload.bin",
    contentType: body.contentType || "application/octet-stream",
    size: body.size,
  })

  if (!signed.ok) {
    return NextResponse.json({ error: signed.error }, { status: 500 })
  }

  return NextResponse.json({
    uploadUrl: signed.uploadUrl,
    key: signed.key,
    publicUrl: signed.publicUrl,
    contentType: signed.contentType,
    // Back-compat shape hints
    folder: signed.key,
  })
}
