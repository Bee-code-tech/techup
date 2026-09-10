"use client"

import Image from "next/image"
import { useEffect, useId, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import toast from "react-hot-toast"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  Clock3Icon,
  XIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type QuizQuestion = {
  id: string
  prompt: string
  promptImageUrl?: string | null
  options: string[]
  optionImageUrls?: string[]
}

export type QuizReviewItem = {
  questionId: string
  prompt: string
  promptImageUrl?: string | null
  options: string[]
  optionImageUrls?: string[]
  selectedIndex: number
  correctIndex: number
  isCorrect: boolean
}

type QuizResult = {
  passed: boolean
  score: number
  passMark: number
  review: QuizReviewItem[]
}

function quizDurationSeconds(questionCount: number) {
  // Extra time when questions may include reading images
  return Math.max(120, questionCount * 60)
}

function formatClock(totalSeconds: number) {
  const safe = Math.max(0, totalSeconds)
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${minutes}:${String(seconds).padStart(2, "0")}`
}

function optionLabel(options: string[], optionImageUrls: string[] | undefined, index: number) {
  const text = options[index]?.trim()
  if (text) return text
  if (optionImageUrls?.[index]) return `Image ${String.fromCharCode(65 + index)}`
  return `Option ${String.fromCharCode(65 + index)}`
}

export function ModuleQuizModal({
  open,
  moduleTitle,
  passMark,
  questions,
  moduleId,
  onClose,
  onComplete,
}: {
  open: boolean
  moduleTitle: string
  passMark: number
  questions: QuizQuestion[]
  moduleId: string
  onClose: () => void
  onComplete: (result: QuizResult) => void
}) {
  const titleId = useId()
  const [visible, setVisible] = useState(false)
  const [phase, setPhase] = useState<"intro" | "quiz" | "result">("intro")
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<QuizResult | null>(null)
  const submittingRef = useRef(false)
  const answersRef = useRef<number[]>([])

  const totalSeconds = useMemo(
    () => quizDurationSeconds(questions.length),
    [questions.length],
  )

  useEffect(() => {
    answersRef.current = answers
  }, [answers])

  useEffect(() => {
    if (!open) {
      setVisible(false)
      return
    }
    const frame = window.requestAnimationFrame(() => setVisible(true))
    return () => window.cancelAnimationFrame(frame)
  }, [open])

  useEffect(() => {
    if (!open) return
    setPhase("intro")
    setStep(0)
    setAnswers(questions.map(() => -1))
    setSecondsLeft(totalSeconds)
    setSubmitting(false)
    setResult(null)
    submittingRef.current = false
  }, [open, questions, totalSeconds])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  async function submitAnswers(finalAnswers: number[]) {
    if (submittingRef.current) return
    submittingRef.current = true
    setSubmitting(true)
    try {
      const response = await fetch(
        `/api/student/modules/${moduleId}/progress`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "submit-quiz",
            answers: finalAnswers,
          }),
        },
      )
      const payload = (await response.json()) as {
        error?: string
        passed?: boolean
        score?: number
        review?: QuizReviewItem[]
        passMark?: number
      }
      if (!response.ok) {
        toast.error(payload.error || "Quiz submit failed.")
        submittingRef.current = false
        setSubmitting(false)
        return
      }
      const nextResult: QuizResult = {
        passed: Boolean(payload.passed),
        score: payload.score ?? 0,
        passMark: payload.passMark ?? passMark,
        review: payload.review || [],
      }
      setResult(nextResult)
      setPhase("result")
      onComplete(nextResult)
      if (nextResult.passed) {
        toast.success(`Passed with ${nextResult.score}%`)
      } else {
        toast.error(
          `Score ${nextResult.score}% — need ${nextResult.passMark}% to continue.`,
        )
      }
    } catch {
      toast.error("Network error.")
      submittingRef.current = false
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (!open || phase !== "quiz") return

    const tick = window.setInterval(() => {
      if (document.hidden) return
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(tick)
          void submitAnswers(answersRef.current)
          return 0
        }
        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(tick)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- submit uses refs
  }, [open, phase])

  if (!open || typeof document === "undefined") return null

  const question = questions[step]
  const optionImages = question?.optionImageUrls || []
  const hasOptionImages = optionImages.some(Boolean)
  const answeredCount = answers.filter((value) => value >= 0).length
  const progressPercent =
    questions.length === 0
      ? 0
      : phase === "result"
        ? 100
        : phase === "intro"
          ? 0
          : Math.round(
              ((step + (answers[step] >= 0 ? 0.35 : 0)) / questions.length) *
                100,
            )
  const timerUrgent = secondsLeft <= 30 && phase === "quiz"

  function startQuiz() {
    submittingRef.current = false
    setSubmitting(false)
    setResult(null)
    setPhase("quiz")
    setStep(0)
    setAnswers(questions.map(() => -1))
    setSecondsLeft(totalSeconds)
  }

  function selectOption(optionIndex: number) {
    setAnswers((current) =>
      current.map((value, index) => (index === step ? optionIndex : value)),
    )
  }

  function goNext() {
    if (answers[step] < 0) {
      toast.error("Pick an answer to continue.")
      return
    }
    if (step >= questions.length - 1) {
      void submitAnswers(answers)
      return
    }
    setStep((current) => current + 1)
  }

  function goBack() {
    setStep((current) => Math.max(0, current - 1))
  }

  function requestClose() {
    if (phase === "quiz" && !submitting) {
      const ok = window.confirm(
        "Leave quiz? Your progress for this attempt will be lost.",
      )
      if (!ok) return
    }
    onClose()
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close quiz"
        className={cn(
          "absolute inset-0 bg-[#001028]/60 backdrop-blur-[7px] transition-opacity duration-200 ease-[var(--ease-out)]",
          visible ? "opacity-100" : "opacity-0",
        )}
        onClick={requestClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "relative z-10 flex max-h-[min(92dvh,900px)] w-full flex-col overflow-hidden rounded-t-2xl border border-white/10 bg-[#f7f8fb] shadow-[0_28px_80px_-28px_rgba(0,32,111,0.55)] transition-[opacity,transform] duration-200 ease-[var(--ease-out)] sm:rounded-2xl",
          hasOptionImages || question?.promptImageUrl
            ? "max-w-2xl"
            : "max-w-xl",
          visible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-3 scale-[0.97] opacity-0 sm:translate-y-2",
        )}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="border-b border-black/5 bg-white px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-[#00206F]/70 uppercase">
                Knowledge check
              </p>
              <h2
                id={titleId}
                className="mt-1 truncate text-lg font-semibold tracking-tight text-[#001752]"
              >
                {moduleTitle}
              </h2>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={requestClose}
              className="admin-press flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-black/4 hover:text-[#001752]"
            >
              <XIcon className="size-4" />
            </button>
          </div>

          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#eef2f9]">
            <div
              className="h-full rounded-full bg-linear-to-r from-[#00206F] to-[#FB7801] transition-[width] duration-300 ease-[var(--ease-out)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {phase === "quiz" ? (
            <div className="mt-3 flex items-center justify-between gap-3 text-sm">
              <p className="font-medium text-[#001752]">
                Question {step + 1}
                <span className="text-muted-foreground">
                  {" "}
                  of {questions.length}
                </span>
              </p>
              <p
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold tabular-nums",
                  timerUrgent
                    ? "bg-red-50 text-red-700"
                    : "bg-[#eef2f9] text-[#00206F]",
                )}
              >
                <Clock3Icon className="size-3.5" aria-hidden />
                {formatClock(secondsLeft)}
              </p>
            </div>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {phase === "intro" ? (
            <div className="space-y-5">
              <div className="rounded-xl border border-black/5 bg-white p-4">
                <p className="text-sm leading-relaxed text-[#334155]">
                  Answer one question at a time. Some questions may include
                  images. You have{" "}
                  <span className="font-semibold text-[#001752]">
                    {formatClock(totalSeconds)}
                  </span>{" "}
                  for the full quiz. Unanswered questions are marked wrong when
                  time runs out.
                </p>
              </div>
              <ul className="grid gap-2 sm:grid-cols-3">
                <IntroStat label="Questions" value={String(questions.length)} />
                <IntroStat label="Pass mark" value={`${passMark}%`} />
                <IntroStat label="Time limit" value={formatClock(totalSeconds)} />
              </ul>
            </div>
          ) : null}

          {phase === "quiz" && question ? (
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#00206F] text-xs font-semibold text-white">
                  {String(step + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1 space-y-3">
                  {question.prompt.trim() ? (
                    <p className="pt-0.5 text-[1.05rem] font-semibold leading-snug text-[#001752]">
                      {question.prompt}
                    </p>
                  ) : (
                    <p className="pt-0.5 text-sm font-medium text-muted-foreground">
                      Look at the image, then choose an answer.
                    </p>
                  )}
                  {question.promptImageUrl ? (
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-black/8 bg-white">
                      <Image
                        src={question.promptImageUrl}
                        alt="Question"
                        fill
                        className="object-contain p-2"
                        unoptimized
                      />
                    </div>
                  ) : null}
                </div>
              </div>

              <div
                className={cn(
                  "grid gap-2",
                  hasOptionImages ? "sm:grid-cols-2" : "grid-cols-1",
                )}
              >
                {question.options.map((option, optionIndex) => {
                  const selected = answers[step] === optionIndex
                  const imageUrl = optionImages[optionIndex]
                  return (
                    <button
                      key={optionIndex}
                      type="button"
                      onClick={() => selectOption(optionIndex)}
                      className={cn(
                        "admin-press rounded-xl border text-left text-sm leading-snug transition-[background-color,border-color,box-shadow,color] duration-150",
                        imageUrl ? "overflow-hidden p-0" : "px-3.5 py-3.5",
                        selected
                          ? "border-[#00206F]/35 bg-[#eef2f9] text-[#001752] shadow-[0_0_0_3px_rgba(0,32,111,0.08)]"
                          : "border-black/6 bg-white text-[#334155] hover:border-[#00206F]/18",
                      )}
                    >
                      {imageUrl ? (
                        <span className="block">
                          <span className="relative m-2 block aspect-video overflow-hidden rounded-xl bg-[#f4f6fa]">
                            <Image
                              src={imageUrl}
                              alt={option || `Option ${optionIndex + 1}`}
                              fill
                              className="rounded-xl object-contain p-2"
                              unoptimized
                            />
                          </span>
                          <span className="flex items-start gap-2.5 px-3 py-2.5">
                            <span
                              className={cn(
                                "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold",
                                selected
                                  ? "border-[#00206F] bg-[#00206F] text-white"
                                  : "border-black/15 text-muted-foreground",
                              )}
                            >
                              {String.fromCharCode(65 + optionIndex)}
                            </span>
                            <span className="pt-0.5">
                              {option.trim() || "Select this image"}
                            </span>
                          </span>
                        </span>
                      ) : (
                        <span className="flex items-start gap-2.5">
                          <span
                            className={cn(
                              "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold",
                              selected
                                ? "border-[#00206F] bg-[#00206F] text-white"
                                : "border-black/15 text-muted-foreground",
                            )}
                          >
                            {String.fromCharCode(65 + optionIndex)}
                          </span>
                          <span>{option}</span>
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                {answeredCount}/{questions.length} answered
              </p>
            </div>
          ) : null}

          {phase === "result" && result ? (
            <div className="space-y-5">
              <div
                className={cn(
                  "rounded-xl border px-4 py-5 text-center",
                  result.passed
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-[#FB7801]/25 bg-[#fff8f1]",
                )}
              >
                <CheckCircle2Icon
                  className={cn(
                    "mx-auto size-8",
                    result.passed ? "text-emerald-600" : "text-[#FB7801]",
                  )}
                  aria-hidden
                />
                <p className="mt-3 text-2xl font-semibold tracking-tight text-[#001752]">
                  {result.score}%
                </p>
                <p className="mt-1 text-sm text-[#334155]">
                  {result.passed
                    ? `Passed · required ${result.passMark}%`
                    : `Not yet · need ${result.passMark}% to continue`}
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-[11px] font-semibold tracking-[0.14em] text-[#00206F]/65 uppercase">
                  Quick review
                </p>
                <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
                  {result.review.map((item, index) => (
                    <li
                      key={item.questionId}
                      className="rounded-xl border border-black/5 bg-white px-3 py-2.5 text-sm"
                    >
                      <p className="font-medium text-[#001752]">
                        {index + 1}.{" "}
                        {item.prompt.trim() || "Image question"}
                      </p>
                      {item.promptImageUrl ? (
                        <div className="relative mt-2 aspect-video max-w-[220px] overflow-hidden rounded-lg border border-black/8 bg-[#f4f6fa]">
                          <Image
                            src={item.promptImageUrl}
                            alt=""
                            fill
                            className="object-contain p-1"
                            unoptimized
                          />
                        </div>
                      ) : null}
                      <p
                        className={cn(
                          "mt-1 text-xs",
                          item.isCorrect
                            ? "text-emerald-700"
                            : "text-destructive",
                        )}
                      >
                        {item.isCorrect
                          ? `Correct · ${optionLabel(item.options, item.optionImageUrls, item.correctIndex)}`
                          : `Your answer: ${
                              item.selectedIndex >= 0
                                ? optionLabel(
                                    item.options,
                                    item.optionImageUrls,
                                    item.selectedIndex,
                                  )
                                : "Skipped"
                            } · Correct: ${optionLabel(item.options, item.optionImageUrls, item.correctIndex)}`}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </div>

        <div className="border-t border-black/5 bg-white px-5 py-4">
          {phase === "intro" ? (
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="admin-press h-11 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={startQuiz}
                disabled={questions.length === 0}
                className="admin-press h-11 rounded-xl bg-[#00206F] text-white hover:bg-[#001752]"
              >
                Start quiz
              </Button>
            </div>
          ) : null}

          {phase === "quiz" ? (
            <div className="flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={goBack}
                disabled={step === 0 || submitting}
                className="admin-press h-11 gap-1.5 rounded-xl"
              >
                <ArrowLeftIcon className="size-4" aria-hidden />
                Back
              </Button>
              <Button
                type="button"
                onClick={goNext}
                disabled={submitting || answers[step] < 0}
                className="admin-press h-11 gap-1.5 rounded-xl bg-[#00206F] text-white hover:bg-[#001752]"
              >
                {submitting
                  ? "Submitting…"
                  : step >= questions.length - 1
                    ? "Submit"
                    : "Next"}
                {!submitting && step < questions.length - 1 ? (
                  <ArrowRightIcon className="size-4" aria-hidden />
                ) : null}
              </Button>
            </div>
          ) : null}

          {phase === "result" ? (
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              {!result?.passed ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={startQuiz}
                  className="admin-press h-11 rounded-xl"
                >
                  Try again
                </Button>
              ) : null}
              <Button
                type="button"
                onClick={onClose}
                className="admin-press h-11 rounded-xl bg-[#00206F] text-white hover:bg-[#001752]"
              >
                Done
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  )
}

function IntroStat({ label, value }: { label: string; value: string }) {
  return (
    <li className="rounded-xl border border-black/5 bg-white px-3 py-3">
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-base font-semibold text-[#001752]">{value}</p>
    </li>
  )
}
