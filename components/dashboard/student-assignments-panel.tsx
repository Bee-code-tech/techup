"use client"

import { useCallback, useEffect, useState } from "react"
import { format, formatDistanceToNow } from "date-fns"
import toast from "react-hot-toast"
import {
  ClipboardListIcon,
  ExternalLinkIcon,
  SendIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type StudentAssignment = {
  id: string
  title: string
  description: string
  scope: string
  trackLabel: string
  courseTitle: string | null
  opensAt: string | null
  dueAt: string | null
  maxScore: number
  submission: {
    id: string
    status: string
    explanation: string
    attachmentUrl: string | null
    score: number | null
    tutorNote: string | null
    createdAt: string
  } | null
}

export function StudentAssignmentsPanel() {
  const [loading, setLoading] = useState(true)
  const [assignments, setAssignments] = useState<StudentAssignment[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [explanation, setExplanation] = useState("")
  const [attachmentUrl, setAttachmentUrl] = useState("")
  const [pending, setPending] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/student/assignments")
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string
        assignments?: StudentAssignment[]
      }
      if (!response.ok) {
        toast.error(payload.error || "Could not load assignments.")
        return
      }
      setAssignments(payload.assignments || [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function submit(assignmentId: string) {
    setPending(true)
    try {
      const response = await fetch("/api/student/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId,
          explanation,
          attachmentUrl: attachmentUrl.trim() || null,
        }),
      })
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string
      }
      if (!response.ok) {
        toast.error(payload.error || "Could not submit.")
        return
      }
      toast.success("Submitted for review.")
      setActiveId(null)
      setExplanation("")
      setAttachmentUrl("")
      await load()
    } catch {
      toast.error("Network error.")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex flex-col gap-5 px-4 py-6 lg:px-6 md:py-8">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.14em] text-[#00206F]/65 uppercase">
          Practice
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#001752]">
          Assignments
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Course tasks and track projects from your tutors.
        </p>
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : assignments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/10 bg-white px-5 py-12 text-center">
            <ClipboardListIcon className="mx-auto size-8 text-[#00206F]/35" />
            <p className="mt-3 font-medium text-[#001752]">Nothing assigned yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              When tutors publish work, it will show up here.
            </p>
          </div>
        ) : (
          assignments.map((row) => {
            const isOpen = activeId === row.id
            const graded = row.submission?.status === "graded"
            const pendingReview = row.submission?.status === "pending"
            return (
              <article
                key={row.id}
                className="overflow-hidden rounded-2xl border border-black/8 bg-white"
              >
                <div className="px-5 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-[#001752]">{row.title}</h3>
                    <Badge variant="secondary" className="rounded-md">
                      {row.scope === "track" ? "Track project" : "Course"}
                    </Badge>
                    {graded ? (
                      <Badge className="rounded-md bg-emerald-600 text-white">
                        {row.submission?.score}/{row.maxScore}
                      </Badge>
                    ) : pendingReview ? (
                      <Badge className="rounded-md bg-[#FB7801] text-white">
                        Under review
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {row.courseTitle || row.trackLabel}
                    {row.opensAt && row.dueAt
                      ? ` · ${format(new Date(row.opensAt), "MMM d")} – ${format(new Date(row.dueAt), "MMM d, h:mm a")}`
                      : row.dueAt
                        ? ` · due ${format(new Date(row.dueAt), "MMM d, h:mm a")}`
                        : ""}
                  </p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[#001752]/90">
                    {row.description || "No brief provided."}
                  </p>

                  {row.submission?.tutorNote ? (
                    <p className="mt-3 rounded-lg bg-[#eef2f9] px-3 py-2 text-sm text-[#001752]">
                      Feedback: {row.submission.tutorNote}
                    </p>
                  ) : null}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {!graded ? (
                      <Button
                        variant={isOpen ? "secondary" : "default"}
                        className={cn(
                          "h-9 rounded-lg",
                          !isOpen &&
                            "bg-[#00206F] text-white hover:bg-[#001752]",
                        )}
                        onClick={() => {
                          setActiveId(isOpen ? null : row.id)
                          setExplanation(row.submission?.explanation || "")
                          setAttachmentUrl(row.submission?.attachmentUrl || "")
                        }}
                      >
                        <SendIcon className="size-3.5" />
                        {pendingReview ? "Update submission" : "Submit work"}
                      </Button>
                    ) : null}
                    {row.submission?.attachmentUrl ? (
                      <a
                        href={row.submission.attachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-black/10 px-3 text-sm font-medium text-[#00206F]"
                      >
                        Your file <ExternalLinkIcon className="size-3.5" />
                      </a>
                    ) : null}
                  </div>
                </div>

                {isOpen ? (
                  <div className="border-t border-black/5 bg-[#f7f8fb] px-5 py-4">
                    <div className="space-y-3">
                      <Textarea
                        value={explanation}
                        onChange={(e) => setExplanation(e.target.value)}
                        rows={4}
                        placeholder="Explain what you built and any tradeoffs…"
                        className="rounded-lg bg-white"
                      />
                      <Input
                        value={attachmentUrl}
                        onChange={(e) => setAttachmentUrl(e.target.value)}
                        placeholder="Attachment URL (Drive, GitHub, Figma…)"
                        className="h-10 rounded-lg bg-white"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          className="h-9 rounded-lg"
                          onClick={() => setActiveId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          disabled={pending}
                          className="h-9 rounded-lg bg-[#00206F] text-white hover:bg-[#001752]"
                          onClick={() => void submit(row.id)}
                        >
                          {pending ? "Sending…" : "Submit"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : null}

                {row.submission && !isOpen ? (
                  <p className="border-t border-black/5 px-5 py-2.5 text-xs text-muted-foreground">
                    Last submitted{" "}
                    {formatDistanceToNow(new Date(row.submission.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                ) : null}
              </article>
            )
          })
        )}
      </div>
    </div>
  )
}
