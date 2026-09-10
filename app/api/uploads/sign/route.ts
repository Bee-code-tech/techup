import { NextResponse } from "next/server"
import { isNextResponse, requireTutorOrAdmin } from "@/lib/api-auth"
import { createPresignedUpload, type UploadFolder } from "@/lib/tigris"

const FOLDERS = new Set<UploadFolder>([
  "covers",
  "videos",
  "materials",
  "avatars",
  "quiz",
])

export async function POST(request: Request) {
  const auth = await requireTutorOrAdmin()
  if (isNextResponse(auth)) return auth

  const body = (await request.json().catch(() => ({}))) as {
    folder?: string
    filename?: string
    contentType?: string
    size?: number
  }

  const folder = body.folder as UploadFolder
  const filename = String(body.filename ?? "").trim()
  const contentType = String(body.contentType ?? "").trim()
  const size =
    body.size != null && Number.isFinite(Number(body.size))
      ? Number(body.size)
      : undefined

  if (!FOLDERS.has(folder)) {
    return NextResponse.json({ error: "Invalid upload folder." }, { status: 400 })
  }
  if (!filename) {
    return NextResponse.json({ error: "Filename is required." }, { status: 400 })
  }
  if (!contentType) {
    return NextResponse.json(
      { error: "Content type is required." },
      { status: 400 },
    )
  }

  const signed = await createPresignedUpload({
    userId: auth.userId,
    folder,
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
