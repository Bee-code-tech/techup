"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { ImageIcon, PencilIcon, XIcon } from "lucide-react"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { UploadProgressBar } from "@/components/dashboard/upload-progress"
import { uploadService } from "@/services/upload.service"

export function CoverForm({
  initialUrl,
  onSave,
}: {
  initialUrl: string | null
  onSave: (payload: {
    coverUrl: string | null
    coverKey: string | null
  }) => Promise<void> | void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [editing, setEditing] = useState(false)
  const [url, setUrl] = useState(initialUrl)
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)

  useEffect(() => setUrl(initialUrl), [initialUrl])

  async function onFile(file: File) {
    setUploading(true)
    setProgress(0)
    try {
      const uploaded = await uploadService.uploadFile(file, {
        folder: "covers",
        onProgress: setProgress,
      })
      await onSave({ coverUrl: uploaded.url, coverKey: uploaded.key })
      setUrl(uploaded.url)
      setEditing(false)
      toast.success("Cover uploaded.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.")
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <div className="rounded-xl border border-black/10 p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[#001752]">Cover image</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5"
          disabled={uploading}
          onClick={() => setEditing((v) => !v)}
        >
          {editing ? (
            <>
              <XIcon className="size-3.5" /> Cancel
            </>
          ) : (
            <>
              <PencilIcon className="size-3.5" /> {url ? "Edit" : "Add"}
            </>
          )}
        </Button>
      </div>

      {!editing ? (
        url ? (
          <div className="relative mt-3 aspect-video overflow-hidden rounded-xl border border-black/8 bg-[#f4f6fa]">
            <Image src={url} alt="" fill className="object-cover" unoptimized />
          </div>
        ) : (
          <div className="mt-3 flex h-40 items-center justify-center rounded-xl border border-dashed border-black/10 bg-[#fafafa]">
            <ImageIcon className="size-8 text-muted-foreground" />
          </div>
        )
      ) : (
        <div className="mt-3 space-y-3">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void onFile(file)
            }}
          />
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="h-10 w-full rounded-lg border-black/10"
          >
            Choose image
          </Button>
          {uploading ? (
            <UploadProgressBar label="Uploading cover" percent={progress} />
          ) : null}
          {url ? (
            <Button
              type="button"
              variant="ghost"
              disabled={uploading}
              className="h-9 w-full text-destructive"
              onClick={() => void onSave({ coverUrl: null, coverKey: null })}
            >
              Remove cover
            </Button>
          ) : null}
        </div>
      )}
    </div>
  )
}
