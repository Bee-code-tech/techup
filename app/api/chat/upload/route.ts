import { NextResponse } from "next/server"
import { isNextResponse, requireAnyAuth } from "@/lib/api-auth"
import { validateChatMedia } from "@/lib/chat"
import { createPresignedUpload } from "@/lib/tigris"

/** Thin chat upload signer: validates chat media limits, then Tigris presign. */
export async function POST(request: Request) {
  const auth = await requireAnyAuth()
  if (isNextResponse(auth)) return auth

  if (auth.role !== "student" && auth.role !== "tutor") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 })
  }

  const body = (await request.json().catch(() => ({}))) as {
    filename?: string
    contentType?: string
    size?: number
    durationSeconds?: number | null
  }

  const filename = String(body.filename ?? "").trim()
  const contentType = String(body.contentType ?? "").trim()
  const size =
    body.size != null && Number.isFinite(Number(body.size))
      ? Number(body.size)
      : NaN
  const durationSeconds =
    body.durationSeconds != null && Number.isFinite(Number(body.durationSeconds))
      ? Number(body.durationSeconds)
      : null

  if (!filename) {
    return NextResponse.json({ error: "Filename is required." }, { status: 400 })
  }
  if (!contentType) {
    return NextResponse.json(
      { error: "Content type is required." },
      { status: 400 },
    )
  }
  if (!Number.isFinite(size) || size < 0) {
    return NextResponse.json({ error: "File size is required." }, { status: 400 })
  }

  const validated = validateChatMedia({
    mime: contentType,
    size,
    durationSeconds,
  })
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 })
  }

  const signed = await createPresignedUpload({
    userId: auth.userId,
    folder: "chat",
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
    kind: validated.kind,
  })
}
