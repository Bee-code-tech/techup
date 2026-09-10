"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { format, formatDistanceToNow, isBefore, startOfDay } from "date-fns"
import type { DateRange } from "react-day-picker"
import toast from "react-hot-toast"
import {
  CalendarDaysIcon,
  ClipboardCheckIcon,
  ExternalLinkIcon,
  PlusIcon,
  SparklesIcon,
  XIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

type TrackOption = { id: string; label: string }
type CourseOption = { id: string; title: string; track: string; trackLabel: string }

type AssignmentRow = {
  id: string
  title: string
  description: string
  scope: string
  track: string
  trackLabel: string
  courseId: string | null
  courseTitle: string | null
  opensAt: string | null
  dueAt: string | null
  maxScore: number
  published: boolean
  submissionCount: number
  pendingCount: number
  createdAt: string
}

type SubmissionRow = {
  id: string
  status: string
  explanation: string
  attachmentUrl: string | null
  score: number | null
  tutorNote: string | null
  createdAt: string
  student: {
    id: string
    name: string
    email: string
    avatarUrl: string | null
  }
}

const fieldClass =
  "h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm data-[size=default]:h-10"

const TIME_OPTIONS = Array.from({ length: 24 * 4 }, (_, index) => {
  const hours = Math.floor(index / 4)
  const minutes = (index % 4) * 15
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
})

function combineDateAndTime(date: Date, time: string) {
  const [hours, minutes] = time.split(":").map(Number)
  const value = new Date(date)
  value.setHours(hours || 0, minutes || 0, 0, 0)
  return value
}

export function TutorAssignmentsPanel({
  initialId,
}: {
  initialId?: string | null
}) {
  const [tab, setTab] = useState(initialId ? "review" : "queue")
  const [loading, setLoading] = useState(true)
  const [tracks, setTracks] = useState<TrackOption[]>([])
  const [courses, setCourses] = useState<CourseOption[]>([])
  const [assignments, setAssignments] = useState<AssignmentRow[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(initialId || null)
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([])
  const [selectedAssignment, setSelectedAssignment] =
    useState<AssignmentRow | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [pending, setPending] = useState(false)
  const [gradingId, setGradingId] = useState<string | null>(null)

  const [scope, setScope] = useState("course")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [track, setTrack] = useState("")
  const [courseId, setCourseId] = useState("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [dueTime, setDueTime] = useState("17:00")
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [maxScore, setMaxScore] = useState("100")

  const rangeLabel = useMemo(() => {
    if (!dateRange?.from) return "Pick a date range"
    if (!dateRange.to) return `${format(dateRange.from, "MMM d, yyyy")} – …`
    if (
      format(dateRange.from, "yyyy-MM-dd") ===
      format(dateRange.to, "yyyy-MM-dd")
    ) {
      return format(dateRange.from, "MMM d, yyyy")
    }
    return `${format(dateRange.from, "MMM d, yyyy")} – ${format(dateRange.to, "MMM d, yyyy")}`
  }, [dateRange])

  const filteredCourses = useMemo(
    () =>
      scope === "track"
        ? []
        : courses.filter((course) => !track || course.track === track),
    [courses, scope, track],
  )

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/tutor/assignments")
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string
        tracks?: TrackOption[]
        courses?: CourseOption[]
        assignments?: AssignmentRow[]
      }
      if (!response.ok) {
        toast.error(payload.error || "Could not load assignments.")
        return
      }
      setTracks(payload.tracks || [])
      setCourses(payload.courses || [])
      setAssignments(payload.assignments || [])
      setTrack((current) => current || payload.tracks?.[0]?.id || "")
    } finally {
      setLoading(false)
    }
  }, [])

  const loadDetail = useCallback(async (id: string) => {
    setDetailLoading(true)
    try {
      const response = await fetch(`/api/tutor/assignments/${id}`)
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string
        assignment?: AssignmentRow & { submissions: SubmissionRow[] }
      }
      if (!response.ok) {
        toast.error(payload.error || "Could not open assignment.")
        return
      }
      if (!payload.assignment) return
      setSelectedAssignment(payload.assignment)
      setSubmissions(payload.assignment.submissions || [])
      setSelectedId(id)
      setTab("review")
    } finally {
      setDetailLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (initialId) void loadDetail(initialId)
  }, [initialId, loadDetail])

  async function createAssignment(event: React.FormEvent) {
    event.preventDefault()
    setPending(true)
    try {
      const response = await fetch("/api/tutor/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope,
          title,
          description,
          track: scope === "track" ? track : undefined,
          courseId: scope === "course" ? courseId : undefined,
          opensAt: dateRange?.from
            ? startOfDay(dateRange.from).toISOString()
            : null,
          dueAt: dateRange?.to
            ? combineDateAndTime(dateRange.to, dueTime).toISOString()
            : dateRange?.from
              ? combineDateAndTime(dateRange.from, dueTime).toISOString()
              : null,
          maxScore: Number(maxScore) || 100,
        }),
      })
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string
      }
      if (!response.ok) {
        toast.error(payload.error || "Could not create assignment.")
        return
      }
      toast.success("Assignment published.")
      setTitle("")
      setDescription("")
      setDateRange(undefined)
      setDueTime("17:00")
      setTab("queue")
      await load()
    } catch {
      toast.error("Network error.")
    } finally {
      setPending(false)
    }
  }

  async function gradeSubmission(
    submissionId: string,
    score: number,
    tutorNote: string,
  ) {
    if (!selectedId) return
    setGradingId(submissionId)
    try {
      const response = await fetch(`/api/tutor/assignments/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "grade",
          submissionId,
          score,
          tutorNote,
        }),
      })
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string
      }
      if (!response.ok) {
        toast.error(payload.error || "Could not grade.")
        return
      }
      toast.success("Marked as graded.")
      await loadDetail(selectedId)
      await load()
    } catch {
      toast.error("Network error.")
    } finally {
      setGradingId(null)
    }
  }

  const pendingTotal = assignments.reduce(
    (sum, row) => sum + row.pendingCount,
    0,
  )

  return (
    <div className="flex flex-col gap-5 px-4 py-6 lg:px-6 md:py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.14em] text-[#00206F]/65 uppercase">
            Teaching
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#001752]">
            Assignments
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Create course or track projects, then review and mark submissions.
          </p>
        </div>
        {!loading ? (
          <div className="inline-flex items-center gap-2 rounded-lg border border-black/8 bg-white px-3 py-2 text-sm text-[#001752]">
            <SparklesIcon className="size-4 text-[#FB7801]" />
            {pendingTotal} awaiting review
          </div>
        ) : null}
      </div>

      <Tabs
        value={tab}
        onValueChange={(value) => {
          if (value != null) setTab(String(value))
        }}
        className="gap-4"
      >
        <TabsList className="h-10 w-fit justify-start gap-1 rounded-xl bg-[#eef2f9] p-1">
          <TabsTrigger value="queue" className="flex-none rounded-lg px-4">
            Queue
          </TabsTrigger>
          <TabsTrigger value="create" className="flex-none rounded-lg px-4">
            Create
          </TabsTrigger>
          <TabsTrigger
            value="review"
            className="flex-none rounded-lg px-4"
            disabled={!selectedId}
          >
            Review
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="mt-0">
          <div className="overflow-hidden rounded-2xl border border-black/8 bg-white">
            {loading ? (
              <p className="px-5 py-10 text-sm text-muted-foreground">
                Loading assignments…
              </p>
            ) : assignments.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <ClipboardCheckIcon className="mx-auto size-8 text-[#00206F]/35" />
                <p className="mt-3 font-medium text-[#001752]">
                  No assignments yet
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create a course assignment or track project to get started.
                </p>
                <Button
                  className="mt-4 h-10 rounded-lg bg-[#00206F] text-white hover:bg-[#001752]"
                  onClick={() => setTab("create")}
                >
                  <PlusIcon className="size-4" />
                  Create assignment
                </Button>
              </div>
            ) : (
              <ul className="divide-y divide-black/5">
                {assignments.map((row) => (
                  <li
                    key={row.id}
                    className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-[#001752]">
                          {row.title}
                        </p>
                        <Badge variant="secondary" className="rounded-md">
                          {row.scope === "track" ? "Track project" : "Course"}
                        </Badge>
                        {row.pendingCount > 0 ? (
                          <Badge className="rounded-md bg-[#FB7801] text-white">
                            {row.pendingCount} pending
                          </Badge>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {row.courseTitle || row.trackLabel}
                        {row.opensAt && row.dueAt
                          ? ` · ${format(new Date(row.opensAt), "MMM d")} – ${format(new Date(row.dueAt), "MMM d")}`
                          : row.dueAt
                            ? ` · due ${format(new Date(row.dueAt), "MMM d")}`
                            : ""}
                        {` · ${row.submissionCount} submission${row.submissionCount === 1 ? "" : "s"}`}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="h-9 rounded-lg"
                      onClick={() => void loadDetail(row.id)}
                    >
                      Open
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </TabsContent>

        <TabsContent value="create" className="mt-0">
          <form
            onSubmit={createAssignment}
            className="grid max-w-2xl gap-4 rounded-2xl border border-black/8 bg-white p-5 sm:p-6"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Type
                </label>
                <Select
                  value={scope}
                  onValueChange={(value) => {
                    if (value != null) setScope(String(value))
                  }}
                  modal={false}
                  items={[
                    { value: "course", label: "Course assignment" },
                    { value: "track", label: "Track project" },
                  ]}
                >
                  <SelectTrigger className={fieldClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="start" alignItemWithTrigger={false}>
                    <SelectItem value="course">Course assignment</SelectItem>
                    <SelectItem value="track">Track project</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {scope === "track" ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Track
                  </label>
                  <Select
                    value={track || null}
                    onValueChange={(value) => {
                      if (value != null) setTrack(String(value))
                    }}
                    modal={false}
                    items={tracks.map((item) => ({
                      value: item.id,
                      label: item.label,
                    }))}
                  >
                    <SelectTrigger className={fieldClass}>
                      <SelectValue placeholder="Select track" />
                    </SelectTrigger>
                    <SelectContent align="start" alignItemWithTrigger={false}>
                      {tracks.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Course
                  </label>
                  <Select
                    value={courseId || null}
                    onValueChange={(value) => {
                      if (value == null) return
                      setCourseId(String(value))
                      const course = courses.find((row) => row.id === value)
                      if (course) setTrack(course.track)
                    }}
                    modal={false}
                    items={filteredCourses.map((item) => ({
                      value: item.id,
                      label: item.title,
                    }))}
                  >
                    <SelectTrigger className={fieldClass}>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent align="start" alignItemWithTrigger={false}>
                      {filteredCourses.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Title
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className={fieldClass}
                placeholder="Portfolio landing page"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Brief
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="min-h-28 rounded-lg border-input"
                placeholder="What should students build or submit?"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-[1.4fr_0.8fr_0.8fr]">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Date range
                </label>
                <div className="flex gap-2">
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger
                      render={
                        <Button
                          type="button"
                          variant="outline"
                          data-empty={!dateRange?.from}
                          className={cn(
                            fieldClass,
                            "min-w-0 flex-1 justify-start gap-2 text-left font-normal text-foreground hover:bg-transparent data-[empty=true]:text-muted-foreground",
                          )}
                        />
                      }
                    >
                      <CalendarDaysIcon className="size-4 shrink-0 text-muted-foreground" />
                      <span className="truncate">{rangeLabel}</span>
                    </PopoverTrigger>
                    <PopoverContent
                      align="start"
                      className="w-auto overflow-hidden p-0"
                    >
                      <Calendar
                        mode="range"
                        numberOfMonths={2}
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        className="[--cell-size:2.35rem]"
                        disabled={(day) =>
                          isBefore(startOfDay(day), startOfDay(new Date()))
                        }
                      />
                    </PopoverContent>
                  </Popover>
                  {dateRange?.from ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-10 shrink-0 rounded-lg"
                      aria-label="Clear date range"
                      onClick={() => setDateRange(undefined)}
                    >
                      <XIcon className="size-4" />
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Due time
                </label>
                <Select
                  value={dueTime}
                  onValueChange={(value) => {
                    if (value != null) setDueTime(String(value))
                  }}
                  modal={false}
                  disabled={!dateRange?.from}
                  items={TIME_OPTIONS.map((option) => ({
                    value: option,
                    label: format(
                      combineDateAndTime(
                        dateRange?.to ?? dateRange?.from ?? new Date(),
                        option,
                      ),
                      "h:mm a",
                    ),
                  }))}
                >
                  <SelectTrigger className={fieldClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    align="start"
                    alignItemWithTrigger={false}
                    className="max-h-64"
                  >
                    {TIME_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {format(
                          combineDateAndTime(
                            dateRange?.to ?? dateRange?.from ?? new Date(),
                            option,
                          ),
                          "h:mm a",
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Max score
                </label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={maxScore}
                  onChange={(e) => setMaxScore(e.target.value)}
                  className={fieldClass}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={pending}
                className="h-10 rounded-lg bg-[#00206F] text-white hover:bg-[#001752]"
              >
                {pending ? "Publishing…" : "Publish assignment"}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="review" className="mt-0">
          {detailLoading || !selectedAssignment ? (
            <p className="text-sm text-muted-foreground">
              {detailLoading ? "Loading submissions…" : "Pick an assignment."}
            </p>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl border border-black/8 bg-white px-5 py-4">
                <p className="text-[11px] font-semibold tracking-[0.14em] text-[#00206F]/65 uppercase">
                  {selectedAssignment.scope === "track"
                    ? "Track project"
                    : "Course assignment"}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-[#001752]">
                  {selectedAssignment.title}
                </h3>
                <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                  {selectedAssignment.description || "No brief provided."}
                </p>
              </div>

              <div className="space-y-3">
                {submissions.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-black/10 px-5 py-10 text-center text-sm text-muted-foreground">
                    No submissions yet.
                  </div>
                ) : (
                  submissions.map((submission) => (
                    <SubmissionReviewCard
                      key={submission.id}
                      submission={submission}
                      maxScore={selectedAssignment.maxScore}
                      busy={gradingId === submission.id}
                      onGrade={(score, note) =>
                        void gradeSubmission(submission.id, score, note)
                      }
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function SubmissionReviewCard({
  submission,
  maxScore,
  busy,
  onGrade,
}: {
  submission: SubmissionRow
  maxScore: number
  busy: boolean
  onGrade: (score: number, note: string) => void
}) {
  const [score, setScore] = useState(
    String(submission.score ?? Math.round(maxScore * 0.8)),
  )
  const [note, setNote] = useState(submission.tutorNote || "")

  return (
    <article className="rounded-2xl border border-black/8 bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-semibold text-[#001752]">
            {submission.student.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {submission.student.email} ·{" "}
            {formatDistanceToNow(new Date(submission.createdAt), {
              addSuffix: true,
            })}
          </p>
        </div>
        <Badge
          variant={submission.status === "graded" ? "secondary" : "default"}
          className={cn(
            "rounded-md",
            submission.status === "pending" && "bg-[#FB7801] text-white",
          )}
        >
          {submission.status}
        </Badge>
      </div>

      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[#001752]/90">
        {submission.explanation || "No written explanation."}
      </p>

      {submission.attachmentUrl ? (
        <a
          href={submission.attachmentUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#00206F]"
        >
          Open attachment <ExternalLinkIcon className="size-3.5" />
        </a>
      ) : null}

      {submission.status === "graded" ? (
        <p className="mt-4 rounded-lg bg-[#eef2f9] px-3 py-2 text-sm text-[#001752]">
          Score {submission.score}/{maxScore}
          {submission.tutorNote ? ` · ${submission.tutorNote}` : ""}
        </p>
      ) : (
        <div className="mt-4 grid gap-3 border-t border-black/5 pt-4 sm:grid-cols-[7rem_1fr_auto]">
          <Input
            type="number"
            min={0}
            max={maxScore}
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className={fieldClass}
            aria-label="Score"
          />
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Feedback note"
            className={fieldClass}
          />
          <Button
            disabled={busy}
            onClick={() => onGrade(Number(score) || 0, note)}
            className="h-10 rounded-lg bg-[#00206F] text-white hover:bg-[#001752]"
          >
            {busy ? "Saving…" : "Mark"}
          </Button>
        </div>
      )}
    </article>
  )
}
