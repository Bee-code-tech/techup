import { NextResponse } from "next/server"
import { isNextResponse, requireAnyAuth } from "@/lib/api-auth"
import { createPresignedUpload } from "@/lib/tigris"

/** Profile photo upload — Tigris presigned PUT (any authenticated user). */
export async function POST(request: Request) {
  const auth = await requireAnyAuth()
  if (isNextResponse(auth)) return auth

  const body = (await request.json().catch(() => ({}))) as {
    filename?: string
    contentType?: string
    size?: number
  }

  const filename = String(body.filename ?? "").trim() || "avatar.jpg"
  const contentType = String(body.contentType ?? "").trim()
  const size =
    body.size != null && Number.isFinite(Number(body.size))
      ? Number(body.size)
      : undefined

  if (!contentType || !contentType.startsWith("image/")) {
    return NextResponse.json(
      { error: "Avatar must be an image." },
      { status: 400 },
    )
  }

  const signed = await createPresignedUpload({
    userId: auth.userId,
    folder: "avatars",
    filename,
    contentType,
    size,
  })

  if (!signed.ok) {
    return NextResponse.json({ error: signed.error }, { status: 500 })
  }

  return NextResponse.json({
    uploadUrl: signed.uploadUrl,
    key: signed.key,
    publicUrl: signed.publicUrl,
    contentType: signed.contentType,
    expiresIn: signed.expiresIn,
  })
}
