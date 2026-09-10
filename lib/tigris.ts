import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

export type UploadFolder =
  | "covers"
  | "videos"
  | "materials"
  | "avatars"
  | "quiz"

const FOLDER_RULES: Record<
  UploadFolder,
  {
    maxBytes: number
    mimePrefixes: string[]
    path: string
    extensions?: string[]
  }
> = {
  covers: {
    maxBytes: 8 * 1024 * 1024,
    mimePrefixes: ["image/"],
    path: "courses/covers",
  },
  materials: {
    maxBytes: 40 * 1024 * 1024,
    mimePrefixes: [
      "application/pdf",
      "application/x-pdf",
      "application/zip",
      "application/x-zip",
      "application/x-zip-compressed",
      "application/octet-stream",
      "text/",
      "image/",
    ],
    extensions: [
      ".pdf",
      ".zip",
      ".png",
      ".jpg",
      ".jpeg",
      ".gif",
      ".webp",
      ".txt",
      ".md",
    ],
    path: "modules/materials",
  },
  videos: {
    maxBytes: 512 * 1024 * 1024,
    mimePrefixes: ["video/", "application/octet-stream"],
    extensions: [
      ".mp4",
      ".mov",
      ".webm",
      ".mkv",
      ".m4v",
      ".avi",
    ],
    path: "modules/videos",
  },
  avatars: {
    maxBytes: 5 * 1024 * 1024,
    mimePrefixes: ["image/"],
    path: "avatars",
  },
  quiz: {
    maxBytes: 8 * 1024 * 1024,
    mimePrefixes: ["image/"],
    path: "modules/quiz",
  },
}

function requiredEnv(name: string) {
  const value = process.env[name]?.trim()
  if (!value) return null
  return value
}

export function getTigrisConfig() {
  const accessKeyId = requiredEnv("TIGRIS_STORAGE_ACCESS_KEY_ID")
  const secretAccessKey = requiredEnv("TIGRIS_STORAGE_SECRET_ACCESS_KEY")
  const bucket = requiredEnv("TIGRIS_STORAGE_BUCKET")
  const endpoint =
    requiredEnv("TIGRIS_STORAGE_ENDPOINT") || "https://fly.storage.tigris.dev"
  // Virtual-hosted style matches Tigris public URLs: https://{bucket}.t3.storage.dev/{key}
  const publicBase =
    requiredEnv("TIGRIS_PUBLIC_URL") ||
    (bucket
      ? `https://${bucket}.${endpoint.replace(/^https?:\/\//, "").replace(/\/$/, "")}`
      : null)

  if (!accessKeyId || !secretAccessKey || !bucket) {
    return {
      ok: false as const,
      error:
        "Tigris is not configured. Set TIGRIS_STORAGE_ACCESS_KEY_ID, TIGRIS_STORAGE_SECRET_ACCESS_KEY, and TIGRIS_STORAGE_BUCKET.",
    }
  }

  return {
    ok: true as const,
    accessKeyId,
    secretAccessKey,
    bucket,
    endpoint,
    publicBase,
  }
}

export function getTigrisClient() {
  const config = getTigrisConfig()
  if (!config.ok) return config

  const client = new S3Client({
    region: "auto",
    endpoint: config.endpoint,
    forcePathStyle: false,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  })

  return { ok: true as const, client, config }
}

function sanitizeFilename(name: string) {
  return name
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .slice(0, 120)
}

export function validateUpload(options: {
  folder: UploadFolder
  contentType: string
  filename?: string
  size?: number
}) {
  const rules = FOLDER_RULES[options.folder]
  if (!rules) {
    return { ok: false as const, error: "Invalid upload folder." }
  }

  const contentType = (options.contentType || "").trim().toLowerCase()
  const filename = (options.filename || "").trim().toLowerCase()
  const extension = filename.includes(".")
    ? `.${filename.split(".").pop()}`
    : ""

  const mimeOk = rules.mimePrefixes.some((prefix) =>
    contentType.startsWith(prefix),
  )
  const extensionOk =
    Boolean(extension) &&
    Boolean(rules.extensions?.includes(extension))

  // Allow when MIME matches, or when MIME is blank/generic but extension is known.
  const allowed =
    mimeOk ||
    ((!contentType || contentType === "application/octet-stream") &&
      extensionOk)

  if (!allowed) {
    return {
      ok: false as const,
      error: `Unsupported file type for ${options.folder}.`,
    }
  }

  if (options.size != null && options.size > rules.maxBytes) {
    return {
      ok: false as const,
      error: `File too large for ${options.folder} (max ${Math.round(rules.maxBytes / (1024 * 1024))}MB).`,
    }
  }

  return { ok: true as const, rules }
}

export function buildObjectKey(options: {
  userId: string
  folder: UploadFolder
  filename: string
}) {
  const rules = FOLDER_RULES[options.folder]
  const safe = sanitizeFilename(options.filename) || "file"
  return `techup/${options.userId}/${rules.path}/${Date.now()}-${safe}`
}

export async function createPresignedUpload(options: {
  userId: string
  folder: UploadFolder
  filename: string
  contentType: string
  size?: number
  expiresIn?: number
}) {
  const validation = validateUpload({
    folder: options.folder,
    contentType: options.contentType,
    filename: options.filename,
    size: options.size,
  })
  if (!validation.ok) return validation

  const tigris = getTigrisClient()
  if (!tigris.ok) return tigris

  const key = buildObjectKey({
    userId: options.userId,
    folder: options.folder,
    filename: options.filename,
  })

  const command = new PutObjectCommand({
    Bucket: tigris.config.bucket,
    Key: key,
    ContentType: options.contentType,
  })

  const uploadUrl = await getSignedUrl(tigris.client, command, {
    expiresIn: options.expiresIn ?? 60 * 15,
  })

  const publicUrl = `${tigris.config.publicBase!.replace(/\/$/, "")}/${key}`

  return {
    ok: true as const,
    uploadUrl,
    key,
    publicUrl,
    bucket: tigris.config.bucket,
    contentType: options.contentType,
    expiresIn: options.expiresIn ?? 60 * 15,
  }
}

/** Only allow deleting objects we created under the techup/ prefix. */
export function extractObjectKey(value?: string | null) {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  if (trimmed.startsWith("techup/")) return trimmed

  try {
    const pathname = decodeURIComponent(
      new URL(trimmed).pathname.replace(/^\//, ""),
    )
    const marker = pathname.indexOf("techup/")
    if (marker >= 0) return pathname.slice(marker)
  } catch {
    /* ignore */
  }

  return null
}

export function collectObjectKeys(
  values: Array<string | null | undefined>,
): string[] {
  const keys = new Set<string>()
  for (const value of values) {
    const key = extractObjectKey(value)
    if (key) keys.add(key)
  }
  return [...keys]
}

export async function deleteTigrisObjects(keys: string[]) {
  const unique = [...new Set(keys.map((key) => key.trim()).filter(Boolean))]
  const safe = unique.filter((key) => key.startsWith("techup/"))
  if (safe.length === 0) {
    return { ok: true as const, deleted: 0 }
  }

  const tigris = getTigrisClient()
  if (!tigris.ok) return tigris

  try {
    // Batch in chunks of 1000 (S3 limit)
    for (let i = 0; i < safe.length; i += 1000) {
      const chunk = safe.slice(i, i + 1000)
      if (chunk.length === 1) {
        await tigris.client.send(
          new DeleteObjectCommand({
            Bucket: tigris.config.bucket,
            Key: chunk[0],
          }),
        )
      } else {
        await tigris.client.send(
          new DeleteObjectsCommand({
            Bucket: tigris.config.bucket,
            Delete: {
              Objects: chunk.map((Key) => ({ Key })),
              Quiet: true,
            },
          }),
        )
      }
    }
    return { ok: true as const, deleted: safe.length }
  } catch (error) {
    console.error("[tigris] delete failed", error)
    return {
      ok: false as const,
      error: "Could not delete storage objects.",
    }
  }
}
