"use client"

export type UploadFolder =
  | "covers"
  | "videos"
  | "materials"
  | "avatars"
  | "quiz"

export type UploadResult = {
  url: string
  key: string
  contentType: string
}

/**
 * Browser → Tigris direct upload via presigned PUT.
 * Progress is approximate based on XHR upload events.
 */
function inferContentType(file: File) {
  if (file.type) return file.type
  const name = file.name.toLowerCase()
  if (name.endsWith(".mp4")) return "video/mp4"
  if (name.endsWith(".mov")) return "video/quicktime"
  if (name.endsWith(".webm")) return "video/webm"
  if (name.endsWith(".mkv")) return "video/x-matroska"
  if (name.endsWith(".m4v")) return "video/x-m4v"
  if (name.endsWith(".pdf")) return "application/pdf"
  if (name.endsWith(".zip")) return "application/zip"
  if (name.endsWith(".png")) return "image/png"
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg"
  if (name.endsWith(".gif")) return "image/gif"
  if (name.endsWith(".webp")) return "image/webp"
  return "application/octet-stream"
}

export const uploadService = {
  async uploadFile(
    file: File,
    options: {
      folder: UploadFolder
      onProgress?: (pct: number) => void
    },
  ): Promise<UploadResult> {
    const contentType = inferContentType(file)
    const signRes = await fetch("/api/uploads/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        folder: options.folder,
        filename: file.name,
        contentType,
        size: file.size,
      }),
    })

    const signed = (await signRes.json()) as {
      error?: string
      uploadUrl?: string
      key?: string
      publicUrl?: string
      contentType?: string
    }

    if (!signRes.ok || !signed.uploadUrl || !signed.publicUrl || !signed.key) {
      throw new Error(signed.error || "Could not prepare upload.")
    }

    await putWithProgress(
      signed.uploadUrl,
      file,
      contentType,
      options.onProgress,
    )

    return {
      url: signed.publicUrl,
      key: signed.key,
      contentType: signed.contentType || contentType,
    }
  },
}

function putWithProgress(
  uploadUrl: string,
  file: File,
  contentType: string,
  onProgress?: (pct: number) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("PUT", uploadUrl)
    xhr.setRequestHeader("Content-Type", contentType)

    xhr.upload.onprogress = (event) => {
      if (!onProgress || !event.lengthComputable) return
      onProgress(Math.round((event.loaded / event.total) * 100))
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100)
        resolve()
        return
      }
      const body = (xhr.responseText || "").slice(0, 280)
      if (xhr.status === 403) {
        reject(
          new Error(
            "Tigris denied the upload (403). Check that your access key has Editor on this bucket, then set bucket CORS for localhost.",
          ),
        )
        return
      }
      reject(
        new Error(
          body
            ? `Upload failed (${xhr.status}): ${body}`
            : `Upload failed (${xhr.status}).`,
        ),
      )
    }

    xhr.onerror = () =>
      reject(
        new Error(
          "Network error during upload (often missing bucket CORS for localhost:3000).",
        ),
      )
    xhr.send(file)
  })
}
