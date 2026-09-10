export type MaterialKind = "pdf" | "image" | "zip" | "video" | "link" | "file"

export type MaterialItem = {
  name?: string
  url: string
  key?: string
  format?: string
}

function extensionOf(value: string) {
  const clean = value.split("?")[0].split("#")[0]
  const base = clean.split("/").pop() || clean
  const dot = base.lastIndexOf(".")
  if (dot < 0) return ""
  return base.slice(dot).toLowerCase()
}

export function getMaterialKind(item: MaterialItem): MaterialKind {
  const format = (item.format || "").toLowerCase()
  const name = item.name || ""
  const url = item.url || ""
  const ext = extensionOf(name) || extensionOf(url)

  if (format.startsWith("image/") || [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"].includes(ext)) {
    return "image"
  }
  if (format.includes("pdf") || ext === ".pdf") return "pdf"
  if (format.includes("zip") || ext === ".zip") return "zip"
  if (format.startsWith("video/") || [".mp4", ".mov", ".webm", ".mkv", ".m4v"].includes(ext)) {
    return "video"
  }

  try {
    const host = new URL(url).hostname
    if (host && !ext) return "link"
  } catch {
    /* ignore */
  }

  return "file"
}

export function materialLabel(kind: MaterialKind) {
  switch (kind) {
    case "pdf":
      return "PDF"
    case "image":
      return "Image"
    case "zip":
      return "ZIP"
    case "video":
      return "Video"
    case "link":
      return "Link"
    default:
      return "File"
  }
}

export function materialHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}
