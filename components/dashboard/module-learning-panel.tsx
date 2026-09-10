"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  CircleIcon,
  Clock3Icon,
  CreditCardIcon,
  LockIcon,
  PlayCircleIcon,
} from "lucide-react"

import {
  ModuleQuizModal,
  type QuizQuestion,
} from "@/components/dashboard/module-quiz-modal"
import { MaterialCard } from "@/components/dashboard/courses/material-card"
import { LearningPanelSkeleton } from "@/components/dashboard/page-skeletons"
import { Button } from "@/components/ui/button"
import { type MaterialItem } from "@/lib/materials"
import { cn } from "@/lib/utils"

type ModulePayload = {
  id: string
  title: string
  description: string
  videoUrl: string | null
  materials: unknown
  passMark: number
  courseId: string
  courseTitle: string
  questions: QuizQuestion[]
}

type Material = MaterialItem

function parseMaterials(materials: unknown): Material[] {
  if (!Array.isArray(materials)) return []
  return materials.filter(
    (item): item is Material =>
      Boolean(item) &&
      typeof item === "object" &&
      typeof (item as Material).url === "string",
  )
}

function quizDurationLabel(questionCount: number) {
  const total = Math.max(120, questionCount * 60)
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${minutes}:${String(seconds).padStart(2, "0")}`
}

export function ModuleLearningPanel({
  courseId,
  moduleId,
}: {
  courseId: string
  moduleId: string
}) {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [moduleData, setModuleData] = useState<ModulePayload | null>(null)
  const [nextModule, setNextModule] = useState<{
    id: string
    title: string
    access: string
    requiresPayment: boolean
  } | null>(null)
  const [videoCompleted, setVideoCompleted] = useState(false)
  const [quizPassed, setQuizPassed] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [quizOpen, setQuizOpen] = useState(false)
  const [paying, setPaying] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/student/modules/${moduleId}`)
      const payload = (await response.json()) as {
        module?: ModulePayload
        progress?: {
          videoCompleted: boolean
          quizPassed: boolean
          quizScore?: number | null
        } | null
        nextModule?: {
          id: string
          title: string
          access: string
          requiresPayment: boolean
        } | null
        error?: string
      }
      if (!response.ok) {
        toast.error(payload.error || "Could not open module.")
        router.push("/dashboard/learn")
        return
      }
      if (payload.module?.courseId && payload.module.courseId !== courseId) {
        router.replace(
          `/dashboard/learn/course/${payload.module.courseId}/${moduleId}`,
        )
        return
      }
      setModuleData(payload.module || null)
      setNextModule(payload.nextModule || null)
      setVideoCompleted(Boolean(payload.progress?.videoCompleted))
      setQuizPassed(Boolean(payload.progress?.quizPassed))
      setScore(
        typeof payload.progress?.quizScore === "number"
          ? payload.progress.quizScore
          : null,
      )
    } catch {
      toast.error("Network error.")
    } finally {
      setLoading(false)
    }
  }, [courseId, moduleId, router])

  useEffect(() => {
    void load()
  }, [load])

  async function completeVideo() {
    const response = await fetch(
      `/api/student/modules/${moduleId}/progress`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete-video" }),
      },
    )
    if (!response.ok) {
      toast.error("Could not mark video complete.")
      return
    }
    setVideoCompleted(true)
    toast.success("Lesson watched — quiz unlocked.")
    window.dispatchEvent(new Event("learn-progress-updated"))
    window.requestAnimationFrame(() => {
      document
        .getElementById("module-quiz")
        ?.scrollIntoView({ behavior: "smooth", block: "start" })
    })
  }

  async function startNextModulePayment() {
    if (!nextModule?.requiresPayment) return
    setPaying(true)
    try {
      const response = await fetch(
        `/api/student/modules/${nextModule.id}/pay`,
        { method: "POST" },
      )
      const payload = (await response.json()) as {
        error?: string
        authorizationUrl?: string
        alreadyUnlocked?: boolean
        message?: string
      }
      if (!response.ok) {
        toast.error(payload.error || "Could not start payment.")
        return
      }
      if (payload.alreadyUnlocked) {
        toast.success(payload.message || "Module already unlocked.")
        router.push(`/dashboard/learn/course/${courseId}/${nextModule.id}`)
        return
      }
      if (payload.authorizationUrl) {
        window.location.href = payload.authorizationUrl
        return
      }
      toast.error("No checkout URL returned.")
    } catch {
      toast.error("Network error.")
    } finally {
      setPaying(false)
    }
  }

  const materials = useMemo(
    () => parseMaterials(moduleData?.materials),
    [moduleData?.materials],
  )

  const questionCount = moduleData?.questions.length ?? 0

  if (loading || !moduleData) {
    return <LearningPanelSkeleton />
  }

  const stage: "watch" | "quiz" | "done" = quizPassed
    ? "done"
    : videoCompleted
      ? "quiz"
      : "watch"

  return (
    <div className="flex w-full flex-col gap-5 px-4 py-6 lg:px-6 md:py-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-1.5">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-[#00206F]/65 uppercase">
            {moduleData.courseTitle}
          </p>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#001752] sm:text-[1.75rem]">
            {moduleData.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            Pass mark {moduleData.passMark}%
            {questionCount > 0
              ? ` · ${questionCount} quiz question${questionCount === 1 ? "" : "s"}`
              : ""}
          </p>
        </div>
        <LessonSteps stage={stage} />
      </header>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)] xl:gap-6">
        <section className="overflow-hidden rounded-xl border border-black/5 bg-[#0b1220] shadow-[0_24px_60px_-40px_rgba(0,32,111,0.55)]">
          {moduleData.videoUrl ? (
            <video
              key={moduleData.videoUrl}
              src={moduleData.videoUrl}
              controls
              className="aspect-video w-full bg-black"
              onEnded={() => {
                if (!videoCompleted) void completeVideo()
              }}
            />
          ) : (
            <div className="flex aspect-video flex-col items-center justify-center gap-2 bg-[#121a2b] px-6 text-center">
              <PlayCircleIcon className="size-10 text-white/35" aria-hidden />
              <p className="text-sm text-white/65">
                No video uploaded for this module yet.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-white/8 bg-[#111827] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex items-center gap-2.5 text-sm text-white/80">
              {videoCompleted ? (
                <>
                  <CheckCircle2Icon
                    className="size-4 text-emerald-400"
                    aria-hidden
                  />
                  <span>Lesson marked complete</span>
                </>
              ) : (
                <>
                  <PlayCircleIcon className="size-4 text-[#FB7801]" aria-hidden />
                  <span>Watch to the end, or mark complete when ready</span>
                </>
              )}
            </div>
            {!videoCompleted && moduleData.videoUrl ? (
              <Button
                type="button"
                onClick={() => void completeVideo()}
                className="admin-press h-10 rounded-xl bg-white px-4 text-sm font-semibold text-[#001752] hover:bg-white/90"
              >
                Mark complete
              </Button>
            ) : null}
          </div>
        </section>

        <div className="flex min-w-0 flex-col gap-4">
          <section className="admin-panel p-5 sm:p-6">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-[#00206F]/65 uppercase">
              About this lesson
            </p>
            <p className="mt-3 whitespace-pre-wrap text-[15px] leading-7 text-[#334155]">
              {moduleData.description || "No description yet for this module."}
            </p>
          </section>

          <section className="admin-panel p-5 sm:p-6">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-[#00206F]/65 uppercase">
              Resources
            </p>
            {materials.length === 0 ? (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                No materials attached yet.
              </p>
            ) : (
              <ul className="mt-3 space-y-2.5">
                {materials.map((item, index) => (
                  <li key={`${item.url}-${index}`}>
                    <MaterialCard item={item} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section id="module-quiz" className="admin-panel scroll-mt-6 p-5 sm:p-6">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-[#00206F]/65 uppercase">
              Knowledge check
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-[#001752]">
              Module quiz
            </h2>

            {!videoCompleted ? (
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-dashed border-black/10 bg-[#fbfcfe] px-4 py-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eef2f9] text-[#00206F]">
                  <LockIcon className="size-4" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#001752]">
                    Quiz locked
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Finish the lesson first to unlock the timed quiz.
                  </p>
                </div>
              </div>
            ) : questionCount === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                No quiz questions for this module yet.
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <QuizMeta label="Questions" value={String(questionCount)} />
                  <QuizMeta
                    label="Pass mark"
                    value={`${moduleData.passMark}%`}
                  />
                  <QuizMeta
                    label="Timer"
                    value={quizDurationLabel(questionCount)}
                  />
                </div>

                {score != null ? (
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      quizPassed ? "text-emerald-700" : "text-[#9a4d00]",
                    )}
                  >
                    Last score: {score}%
                    {quizPassed ? " · Passed" : " · Not passed yet"}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    One question at a time in a focused quiz modal.
                  </p>
                )}

                {quizPassed && nextModule?.requiresPayment ? (
                  <p className="rounded-xl border border-[#FB7801]/20 bg-[#fff8f1] px-3 py-2.5 text-sm text-[#7a4a1a]">
                    Next up is a paid module:{" "}
                    <span className="font-semibold">{nextModule.title}</span>.
                    Unlock it to continue.
                  </p>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  {!quizPassed ? (
                    <Button
                      type="button"
                      onClick={() => setQuizOpen(true)}
                      className="admin-press h-11 gap-2 rounded-xl bg-[#00206F] px-5 text-white hover:bg-[#001752]"
                    >
                      <Clock3Icon className="size-4" aria-hidden />
                      {score != null ? "Retake quiz" : "Start quiz"}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setQuizOpen(true)}
                      className="admin-press h-11 rounded-xl"
                    >
                      Review attempt
                    </Button>
                  )}

                  {quizPassed && nextModule?.requiresPayment ? (
                    <Button
                      type="button"
                      disabled={paying}
                      onClick={() => void startNextModulePayment()}
                      className="admin-press h-11 gap-2 rounded-xl bg-[#FB7801] px-5 text-white hover:brightness-105"
                    >
                      <CreditCardIcon className="size-4" aria-hidden />
                      {paying ? "Opening Paystack…" : "Pay to unlock"}
                    </Button>
                  ) : null}

                  {quizPassed &&
                  nextModule &&
                  !nextModule.requiresPayment ? (
                    <Button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/dashboard/learn/course/${courseId}/${nextModule.id}`,
                        )
                      }
                      className="admin-press h-11 gap-2 rounded-xl bg-[#FB7801] px-5 text-white hover:brightness-105"
                    >
                      Next module
                      <ArrowRightIcon className="size-4" aria-hidden />
                    </Button>
                  ) : null}

                  {quizPassed && !nextModule ? (
                    <Button
                      type="button"
                      onClick={() => router.push("/dashboard/learn")}
                      className="admin-press h-11 rounded-xl bg-[#00206F] px-5 text-white hover:bg-[#001752]"
                    >
                      Back to courses
                    </Button>
                  ) : null}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      <ModuleQuizModal
        open={quizOpen}
        moduleId={moduleId}
        moduleTitle={moduleData.title}
        passMark={moduleData.passMark}
        questions={moduleData.questions}
        onClose={() => setQuizOpen(false)}
        onComplete={(result) => {
          setScore(result.score)
          setQuizPassed(result.passed)
          if (result.passed) {
            window.dispatchEvent(new Event("learn-progress-updated"))
          }
        }}
      />
    </div>
  )
}

function QuizMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-black/5 bg-[#f7f8fb] px-3 py-2.5">
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-[#001752]">{value}</p>
    </div>
  )
}

function LessonSteps({ stage }: { stage: "watch" | "quiz" | "done" }) {
  const steps = [
    { id: "watch", label: "Watch" },
    { id: "quiz", label: "Quiz" },
    { id: "done", label: "Done" },
  ] as const

  const activeIndex =
    stage === "watch" ? 0 : stage === "quiz" ? 1 : 2

  return (
    <ol className="flex items-center gap-1 rounded-xl border border-black/5 bg-[#f7f8fb] p-1">
      {steps.map((step, index) => {
        const complete = index < activeIndex || stage === "done"
        const current = index === activeIndex && stage !== "done"
        const doneAll = stage === "done"

        return (
          <li key={step.id}>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors duration-150",
                current || (doneAll && index === 2)
                  ? "bg-white text-[#001752] shadow-sm"
                  : complete
                    ? "text-[#00206F]"
                    : "text-muted-foreground",
              )}
            >
              {complete || doneAll ? (
                <CheckCircle2Icon
                  className={cn(
                    "size-3.5",
                    current || (doneAll && index === 2)
                      ? "text-[#FB7801]"
                      : "text-[#00206F]",
                  )}
                  aria-hidden
                />
              ) : (
                <CircleIcon className="size-3.5" aria-hidden />
              )}
              {step.label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
