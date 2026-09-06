"use client"

import { useCallback, useEffect, useState } from "react"
import toast from "react-hot-toast"

import { DashboardContentSkeleton } from "@/components/dashboard/page-skeletons"
import { Select } from "@/components/marketing/Select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type TrackOption = { id: string; label: string }

type ModuleRow = {
  id: string
  title: string
  access: string
  order: number
  videoUrl: string | null
  passMark: number
}

type CourseRow = {
  id: string
  track: string
  trackLabel: string
  title: string
  description: string
  order: number
  moduleCount: number
  modules: ModuleRow[]
}

type QuestionDraft = {
  prompt: string
  options: string[]
  correctIndex: number
}

const fieldClass =
  "h-11 rounded-xl border-black/8 bg-[#f7f8fb] px-3.5 text-[15px] shadow-none md:text-[15px]"

export default function TutorCoursesPage() {
  return <CoursesManager />
}

function CoursesManager() {
  const [tracks, setTracks] = useState<TrackOption[]>([])
  const [courses, setCourses] = useState<CourseRow[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)

  const [track, setTrack] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [pending, setPending] = useState(false)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const response = await fetch("/api/tutor/courses")
      const payload = (await response.json()) as {
        tracks?: TrackOption[]
        courses?: CourseRow[]
        error?: string
      }
      if (!response.ok) {
        if (!silent) toast.error(payload.error || "Could not load courses.")
        return
      }
      setTracks(payload.tracks || [])
      setCourses(payload.courses || [])
      setTrack((current) => current || payload.tracks?.[0]?.id || "")
    } catch {
      if (!silent) toast.error("Network error while loading courses.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load(false)
  }, [load])

  async function createCourse(event: React.FormEvent) {
    event.preventDefault()
    setPending(true)
    try {
      const response = await fetch("/api/tutor/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ track, title, description }),
      })
      const payload = (await response.json()) as { error?: string }
      if (!response.ok) {
        toast.error(payload.error || "Could not create course.")
        return
      }
      toast.success("Course created.")
      setTitle("")
      setDescription("")
      await load(true)
    } catch {
      toast.error("Network error.")
    } finally {
      setPending(false)
    }
  }

  async function deleteCourse(id: string) {
    if (!window.confirm("Delete this course and all its modules?")) return
    const response = await fetch(`/api/tutor/courses/${id}`, {
      method: "DELETE",
    })
    const payload = (await response.json()) as { error?: string }
    if (!response.ok) {
      toast.error(payload.error || "Could not delete course.")
      return
    }
    toast.success("Course deleted.")
    if (selectedCourseId === id) setSelectedCourseId(null)
    await load(true)
  }

  const selected = courses.find((course) => course.id === selectedCourseId)

  if (loading && courses.length === 0) {
    return <DashboardContentSkeleton />
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6 md:py-8">
      <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-xs sm:p-6">
        <h2 className="text-lg font-semibold text-[#001752]">Create course</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Courses sit under a track. Add modules after creating the course.
        </p>
        {tracks.length === 0 && !loading ? (
          <p className="mt-4 rounded-xl bg-orange-soft px-3 py-2 text-sm text-orange">
            No tracks assigned yet. Ask an admin to assign you a track.
          </p>
        ) : (
          <form onSubmit={createCourse} className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <span className="text-sm font-medium text-[#001752]">Track</span>
              <Select
                value={track || undefined}
                onValueChange={setTrack}
                options={tracks.map((item) => ({
                  value: item.id,
                  label: item.label,
                }))}
                placeholder="Select track"
                required
              />
            </div>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-[#001752]">
                Course title
              </span>
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. HTML Fundamentals"
                required
                className={fieldClass}
              />
            </label>
            <label className="block space-y-2 sm:col-span-2">
              <span className="text-sm font-medium text-[#001752]">
                Description
              </span>
              <Input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className={fieldClass}
              />
            </label>
            <div>
              <Button
                type="submit"
                disabled={pending || !tracks.length}
                className="h-11 rounded-xl bg-[#00206F] px-5 text-white hover:bg-[#001752]"
              >
                {pending ? "Creating..." : "Create course"}
              </Button>
            </div>
          </form>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <section className="rounded-2xl border border-black/5 bg-white shadow-xs">
          <div className="border-b border-black/5 px-4 py-3">
            <h3 className="font-semibold text-[#001752]">Courses</h3>
            <p className="text-xs text-muted-foreground">
              {loading ? "Loading..." : `${courses.length} total`}
            </p>
          </div>
          <div className="max-h-[560px] divide-y divide-black/5 overflow-y-auto">
            {courses.map((course) => (
              <button
                key={course.id}
                type="button"
                onClick={() => setSelectedCourseId(course.id)}
                className={cn(
                  "flex w-full flex-col items-start gap-1 px-4 py-3 text-left transition",
                  selectedCourseId === course.id
                    ? "bg-[#eef2f9]"
                    : "hover:bg-[#f7f8fb]",
                )}
              >
                <span className="text-sm font-semibold text-[#001752]">
                  {course.title}
                </span>
                <span className="text-xs text-muted-foreground">
                  {course.trackLabel} · {course.moduleCount} modules
                </span>
              </button>
            ))}
            {!loading && courses.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                No courses yet.
              </p>
            ) : null}
          </div>
        </section>

        <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-xs sm:p-6">
          {!selected ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              Select a course to manage modules.
            </p>
          ) : (
            <ModuleEditor
              course={selected}
              onChanged={() => load(true)}
              onDeleteCourse={() => void deleteCourse(selected.id)}
            />
          )}
        </section>
      </div>
    </div>
  )
}

function ModuleEditor({
  course,
  onChanged,
  onDeleteCourse,
}: {
  course: CourseRow
  onChanged: () => Promise<void>
  onDeleteCourse: () => void
}) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [access, setAccess] = useState("free")
  const [passMark, setPassMark] = useState("70")
  const [videoUrl, setVideoUrl] = useState("")
  const [videoPublicId, setVideoPublicId] = useState("")
  const [uploading, setUploading] = useState(false)
  const [pending, setPending] = useState(false)
  const [questions, setQuestions] = useState<QuestionDraft[]>([
    { prompt: "", options: ["", "", "", ""], correctIndex: 0 },
  ])

  async function uploadVideo(file: File) {
    setUploading(true)
    try {
      const signRes = await fetch("/api/tutor/uploads/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceType: "video", folder: "techup/videos" }),
      })
      const signed = (await signRes.json()) as {
        error?: string
        cloudName?: string
        apiKey?: string
        timestamp?: number
        folder?: string
        signature?: string
      }
      if (!signRes.ok || !signed.cloudName) {
        toast.error(signed.error || "Upload signing failed.")
        return
      }

      const form = new FormData()
      form.append("file", file)
      form.append("api_key", signed.apiKey!)
      form.append("timestamp", String(signed.timestamp))
      form.append("signature", signed.signature!)
      form.append("folder", signed.folder!)

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${signed.cloudName}/video/upload`,
        { method: "POST", body: form },
      )
      const uploaded = (await uploadRes.json()) as {
        secure_url?: string
        public_id?: string
        error?: { message?: string }
      }
      if (!uploadRes.ok || !uploaded.secure_url) {
        toast.error(uploaded.error?.message || "Video upload failed.")
        return
      }
      setVideoUrl(uploaded.secure_url)
      setVideoPublicId(uploaded.public_id || "")
      toast.success("Video uploaded.")
    } catch {
      toast.error("Upload network error.")
    } finally {
      setUploading(false)
    }
  }

  async function createModule(event: React.FormEvent) {
    event.preventDefault()
    setPending(true)
    try {
      const cleanedQuestions = questions
        .map((question) => ({
          prompt: question.prompt.trim(),
          options: question.options.map((option) => option.trim()).filter(Boolean),
          correctIndex: question.correctIndex,
        }))
        .filter((question) => question.prompt && question.options.length >= 2)

      const response = await fetch(
        `/api/tutor/courses/${course.id}/modules`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description,
            access,
            passMark: Number(passMark),
            videoUrl: videoUrl || undefined,
            videoPublicId: videoPublicId || undefined,
            order: course.modules.length,
            questions: cleanedQuestions,
          }),
        },
      )
      const payload = (await response.json()) as { error?: string }
      if (!response.ok) {
        toast.error(payload.error || "Could not create module.")
        return
      }
      toast.success("Module created.")
      setTitle("")
      setDescription("")
      setVideoUrl("")
      setVideoPublicId("")
      setQuestions([{ prompt: "", options: ["", "", "", ""], correctIndex: 0 }])
      await onChanged()
    } catch {
      toast.error("Network error.")
    } finally {
      setPending(false)
    }
  }

  async function deleteModule(moduleId: string) {
    if (!window.confirm("Delete this module?")) return
    const response = await fetch(
      `/api/tutor/courses/${course.id}/modules/${moduleId}`,
      { method: "DELETE" },
    )
    const payload = (await response.json()) as { error?: string }
    if (!response.ok) {
      toast.error(payload.error || "Could not delete module.")
      return
    }
    toast.success("Module deleted.")
    await onChanged()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {course.trackLabel}
          </p>
          <h2 className="text-xl font-semibold text-[#001752]">{course.title}</h2>
          {course.description ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {course.description}
            </p>
          ) : null}
        </div>
        <Button
          type="button"
          variant="ghost"
          className="text-destructive"
          onClick={onDeleteCourse}
        >
          Delete course
        </Button>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-[#001752]">Modules</h3>
        {course.modules.length === 0 ? (
          <p className="text-sm text-muted-foreground">No modules yet.</p>
        ) : (
          <ul className="divide-y divide-black/5 rounded-xl border border-black/5">
            {course.modules.map((moduleRow, index) => (
              <li
                key={moduleRow.id}
                className="flex items-center justify-between gap-3 px-3 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-[#001752]">
                    {index + 1}. {moduleRow.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {moduleRow.access} · pass {moduleRow.passMark}%
                    {moduleRow.videoUrl ? " · video ready" : " · no video"}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => void deleteModule(moduleRow.id)}
                >
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={createModule} className="space-y-4 border-t border-black/5 pt-5">
        <h3 className="text-sm font-semibold text-[#001752]">Add module</h3>
        <label className="block space-y-2">
          <span className="text-sm font-medium">Title</span>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            className={fieldClass}
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium">Description</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            className="w-full rounded-xl border border-black/8 bg-[#f7f8fb] px-3.5 py-2.5 text-[15px] outline-none focus:border-[#00206F]/35 focus:bg-white"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <span className="text-sm font-medium">Access</span>
            <Select
              value={access}
              onValueChange={setAccess}
              options={[
                { value: "free", label: "Free" },
                { value: "paid", label: "Paid" },
              ]}
            />
          </div>
          <label className="block space-y-2">
            <span className="text-sm font-medium">Pass mark %</span>
            <Input
              type="number"
              min={1}
              max={100}
              value={passMark}
              onChange={(event) => setPassMark(event.target.value)}
              className={fieldClass}
            />
          </label>
        </div>
        <div className="space-y-2">
          <span className="text-sm font-medium">Video</span>
          <Input
            type="file"
            accept="video/*"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) void uploadVideo(file)
            }}
            className={fieldClass}
          />
          {uploading ? (
            <p className="text-xs text-muted-foreground">Uploading to Cloudinary...</p>
          ) : null}
          {videoUrl ? (
            <p className="truncate text-xs text-[#128c4a]">Uploaded: {videoUrl}</p>
          ) : null}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">Quiz (multiple choice)</h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setQuestions((current) => [
                  ...current,
                  { prompt: "", options: ["", "", "", ""], correctIndex: 0 },
                ])
              }
            >
              Add question
            </Button>
          </div>
          {questions.map((question, qIndex) => (
            <div
              key={qIndex}
              className="space-y-2 rounded-xl border border-black/5 bg-[#f7f8fb] p-3"
            >
              <Input
                value={question.prompt}
                onChange={(event) =>
                  setQuestions((current) =>
                    current.map((item, index) =>
                      index === qIndex
                        ? { ...item, prompt: event.target.value }
                        : item,
                    ),
                  )
                }
                placeholder={`Question ${qIndex + 1}`}
                className={fieldClass}
              />
              {question.options.map((option, oIndex) => (
                <label key={oIndex} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${qIndex}`}
                    checked={question.correctIndex === oIndex}
                    onChange={() =>
                      setQuestions((current) =>
                        current.map((item, index) =>
                          index === qIndex
                            ? { ...item, correctIndex: oIndex }
                            : item,
                        ),
                      )
                    }
                  />
                  <Input
                    value={option}
                    onChange={(event) =>
                      setQuestions((current) =>
                        current.map((item, index) =>
                          index === qIndex
                            ? {
                                ...item,
                                options: item.options.map((value, oi) =>
                                  oi === oIndex ? event.target.value : value,
                                ),
                              }
                            : item,
                        ),
                      )
                    }
                    placeholder={`Option ${oIndex + 1}`}
                    className={fieldClass}
                  />
                </label>
              ))}
            </div>
          ))}
        </div>

        <Button
          type="submit"
          disabled={pending || uploading}
          className="h-11 rounded-xl bg-[#00206F] px-5 text-white hover:bg-[#001752]"
        >
          {pending ? "Saving..." : "Add module"}
        </Button>
      </form>
    </div>
  )
}
