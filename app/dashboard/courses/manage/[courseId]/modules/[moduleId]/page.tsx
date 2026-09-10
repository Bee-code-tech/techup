"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { use, useCallback, useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"
import {
  ArrowLeftIcon,
  FileTextIcon,
  PlusIcon,
  Trash2Icon,
  VideoIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { MaterialCard } from "@/components/dashboard/courses/material-card"
import {
  ModuleQuizEditor,
  toEditorQuestions,
  type EditorQuestion,
} from "@/components/dashboard/courses/modular/module-quiz-editor"
import { UploadProgressBar } from "@/components/dashboard/upload-progress"
import { uploadService } from "@/services/upload.service"

type Material = {
  name: string
  url: string
  key?: string
  format?: string
}

type ModuleData = {
  id: string
  title: string
  description: string
  access: string
  passMark: number
  videoUrl: string | null
  videoPublicId: string | null
  materials: Material[] | null
  questions: Array<{
    id?: string
    prompt: string
    promptImageUrl?: string | null
    promptImageKey?: string | null
    options: string[]
    optionImageUrls?: string[]
    correctIndex: number
  }>
}

export default function ModuleEditPage({
  params,
}: {
  params: Promise<{ courseId: string; moduleId: string }>
}) {
  const { courseId, moduleId } = use(params)
  const router = useRouter()
  const videoInputRef = useRef<HTMLInputElement>(null)
  const materialInputRef = useRef<HTMLInputElement>(null)

  const [moduleRow, setModuleRow] = useState<ModuleData | null>(null)
  const [courseTitle, setCourseTitle] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadPct, setUploadPct] = useState(0)
  const [uploading, setUploading] = useState<"video" | "material" | null>(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [access, setAccess] = useState("free")
  const [passMark, setPassMark] = useState(70)
  const [questions, setQuestions] = useState<EditorQuestion[]>([])

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/tutor/courses/${courseId}/modules`)
      const payload = (await response.json()) as {
        course?: { title: string }
        modules?: ModuleData[]
        error?: string
      }
      if (!response.ok) {
        toast.error(payload.error || "Could not load module.")
        router.push(`/dashboard/courses/manage/${courseId}/edit`)
        return
      }
      const found = (payload.modules || []).find((row) => row.id === moduleId)
      if (!found) {
        toast.error("Module not found.")
        router.push(`/dashboard/courses/manage/${courseId}/edit`)
        return
      }
      setCourseTitle(payload.course?.title || "Course")
      setModuleRow({
        ...found,
        materials: Array.isArray(found.materials)
          ? (found.materials as Material[])
          : [],
      })
      setTitle(found.title)
      setDescription(found.description || "")
      setAccess(found.access === "paid" ? "paid" : "free")
      setPassMark(found.passMark || 70)
      setQuestions(toEditorQuestions(found.questions || []))
    } catch {
      toast.error("Network error.")
    } finally {
      setLoading(false)
    }
  }, [courseId, moduleId, router])

  useEffect(() => {
    void load()
  }, [load])

  async function save(
    extra?: Record<string, unknown>,
    options?: { includeQuestions?: boolean; successMessage?: string },
  ) {
    setSaving(true)
    try {
      const includeQuestions = options?.includeQuestions !== false
      const response = await fetch(
        `/api/tutor/courses/${courseId}/modules/${moduleId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description,
            access,
            passMark,
            ...(includeQuestions ? { questions } : {}),
            ...extra,
          }),
        },
      )
      const payload = (await response.json()) as {
        error?: string
        module?: ModuleData
      }
      if (!response.ok) {
        toast.error(payload.error || "Could not save module.")
        return false
      }
      if (payload.module) {
        setModuleRow({
          ...payload.module,
          materials: Array.isArray(payload.module.materials)
            ? (payload.module.materials as Material[])
            : [],
        })
      }
      toast.success(options?.successMessage || "Module saved.")
      return true
    } catch {
      toast.error("Network error.")
      return false
    } finally {
      setSaving(false)
    }
  }

  async function uploadVideo(file: File) {
    setUploading("video")
    setUploadPct(0)
    try {
      const uploaded = await uploadService.uploadFile(file, {
        folder: "videos",
        onProgress: setUploadPct,
      })
      await save(
        {
          videoUrl: uploaded.url,
          videoPublicId: uploaded.key,
        },
        { includeQuestions: false, successMessage: "Video uploaded." },
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Video upload failed.")
    } finally {
      setUploading(null)
      setUploadPct(0)
    }
  }

  async function uploadMaterial(file: File) {
    setUploading("material")
    setUploadPct(0)
    try {
      const uploaded = await uploadService.uploadFile(file, {
        folder: "materials",
        onProgress: setUploadPct,
      })
      const next = [
        ...(moduleRow?.materials || []),
        {
          name: file.name,
          url: uploaded.url,
          key: uploaded.key,
          format: file.type || uploaded.contentType,
        },
      ]
      await save(
        { materials: next },
        { includeQuestions: false, successMessage: "Material uploaded." },
      )
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Material upload failed.",
      )
    } finally {
      setUploading(null)
      setUploadPct(0)
    }
  }

  if (loading || !moduleRow) {
    return (
      <div className="space-y-4 px-4 py-6 lg:px-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="px-4 py-6 lg:px-6 md:py-8">
      <Link
        href={`/dashboard/courses/manage/${courseId}/edit`}
        className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground hover:opacity-80"
      >
        <ArrowLeftIcon className="size-4" />
        Back to {courseTitle}
      </Link>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#001752]">
            Edit module
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Video, materials, access, and quiz
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-lg border-black/10 text-destructive"
            onClick={async () => {
              if (!window.confirm("Delete this module?")) return
              const response = await fetch(
                `/api/tutor/courses/${courseId}/modules/${moduleId}`,
                { method: "DELETE" },
              )
              if (!response.ok) {
                toast.error("Could not delete module.")
                return
              }
              toast.success("Module deleted.")
              router.push(`/dashboard/courses/manage/${courseId}/edit`)
            }}
          >
            <Trash2Icon className="size-4" />
            Delete
          </Button>
          <Button
            type="button"
            disabled={saving || uploading != null}
            onClick={() => void save()}
            className="h-10 rounded-lg bg-[#00206F] text-white hover:bg-[#001752]"
          >
            {saving ? "Saving…" : "Save module"}
          </Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="space-y-4 rounded-xl border border-black/10 p-5">
          <h2 className="text-sm font-semibold text-[#001752]">Basics</h2>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Title
            </span>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 rounded-lg border-black/10 bg-transparent"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Description
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-[#00206F]/40 focus-visible:ring-2 focus-visible:ring-[#00206F]/12"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Access
              </span>
              <select
                value={access}
                onChange={(e) => setAccess(e.target.value)}
                className="h-10 w-full rounded-lg border border-black/10 bg-transparent px-3 text-sm"
              >
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Pass mark %
              </span>
              <Input
                type="number"
                min={1}
                max={100}
                value={passMark}
                onChange={(e) => setPassMark(Number(e.target.value) || 70)}
                className="h-10 rounded-lg border-black/10 bg-transparent"
              />
            </label>
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-black/10 p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[#001752]">
            <VideoIcon className="size-4" /> Lesson video
          </h2>
          {moduleRow.videoUrl ? (
            <video
              src={moduleRow.videoUrl}
              controls
              className="aspect-video w-full rounded-xl bg-black"
            />
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-black/10 text-sm text-muted-foreground">
              No video uploaded
            </div>
          )}
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void uploadVideo(file)
            }}
          />
          {uploading === "video" ? (
            <UploadProgressBar label="Uploading video" percent={uploadPct} />
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                disabled={uploading != null}
                onClick={() => videoInputRef.current?.click()}
                className="h-10 flex-1 rounded-lg border-black/10"
              >
                {moduleRow.videoUrl ? "Replace video" : "Upload video"}
              </Button>
              {moduleRow.videoUrl ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploading != null || saving}
                  className="h-10 rounded-lg border-black/10 text-destructive"
                  onClick={() => {
                    if (!window.confirm("Remove this video from the module?")) {
                      return
                    }
                    void save(
                      { videoUrl: null, videoPublicId: null },
                      {
                        includeQuestions: false,
                        successMessage: "Video removed.",
                      },
                    )
                  }}
                >
                  Remove video
                </Button>
              ) : null}
            </div>
          )}
        </section>

        <section className="space-y-4 rounded-xl border border-black/10 p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[#001752]">
            <FileTextIcon className="size-4" /> Materials
          </h2>
          {(moduleRow.materials || []).length === 0 ? (
            <div className="rounded-xl border border-dashed border-black/10 bg-[#fafafa] px-4 py-8 text-center text-sm text-muted-foreground">
              Add PDFs, images, or zip files students can open.
            </div>
          ) : (
            <ul className="space-y-2.5">
              {(moduleRow.materials || []).map((item) => (
                <li key={item.url}>
                  <MaterialCard
                    item={item}
                    onRemove={() => {
                      const next = (moduleRow.materials || []).filter(
                        (row) => row.url !== item.url,
                      )
                      void save(
                        { materials: next },
                        {
                          includeQuestions: false,
                          successMessage: "Material removed.",
                        },
                      )
                    }}
                  />
                </li>
              ))}
            </ul>
          )}
          <input
            ref={materialInputRef}
            type="file"
            accept=".pdf,image/*,.zip,application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void uploadMaterial(file)
            }}
          />
          {uploading === "material" ? (
            <UploadProgressBar label="Uploading material" percent={uploadPct} />
          ) : (
            <Button
              type="button"
              variant="outline"
              disabled={uploading != null}
              onClick={() => materialInputRef.current?.click()}
              className="h-10 w-full rounded-lg border-black/10"
            >
              <PlusIcon className="size-4" /> Add material
            </Button>
          )}
        </section>

        <ModuleQuizEditor questions={questions} onChange={setQuestions} />
      </div>
    </div>
  )
}
