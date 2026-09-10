"use client"

import Image from "next/image"
import { useEffect, useId, useRef, useState } from "react"
import { createPortal } from "react-dom"
import toast from "react-hot-toast"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  FileSpreadsheetIcon,
  ImageIcon,
  LoaderCircleIcon,
  PencilIcon,
  PlusIcon,
  SparklesIcon,
  Trash2Icon,
  UploadIcon,
  XIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  isBlankQuizQuestion,
  parseQuizCsv,
  QUIZ_CSV_TEMPLATE,
  type NormalizedQuizQuestion,
} from "@/lib/quiz"
import { cn } from "@/lib/utils"
import { uploadService } from "@/services/upload.service"

export type EditorQuestion = {
  prompt: string
  promptImageUrl: string | null
  promptImageKey: string | null
  options: string[]
  optionImageUrls: string[]
  correctIndex: number
}

type Step = "start" | "build" | "review"

function emptyQuestion(): EditorQuestion {
  return {
    prompt: "",
    promptImageUrl: null,
    promptImageKey: null,
    options: ["", ""],
    optionImageUrls: ["", ""],
    correctIndex: 0,
  }
}

export function toEditorQuestions(
  rows: Array<{
    prompt?: string
    promptImageUrl?: string | null
    promptImageKey?: string | null
    options?: string[]
    optionImageUrls?: string[] | null
    correctIndex?: number
  }>,
): EditorQuestion[] {
  return rows.map((row) => {
    const options = (row.options || []).map(String)
    const images = row.optionImageUrls || []
    return {
      prompt: row.prompt || "",
      promptImageUrl: row.promptImageUrl || null,
      promptImageKey: row.promptImageKey || null,
      options: options.length >= 2 ? options : ["", ""],
      optionImageUrls: (options.length >= 2 ? options : ["", ""]).map(
        (_, i) => String(images[i] || ""),
      ),
      correctIndex: row.correctIndex ?? 0,
    }
  })
}

function fromNormalized(question: NormalizedQuizQuestion): EditorQuestion {
  return {
    prompt: question.prompt,
    promptImageUrl: question.promptImageUrl,
    promptImageKey: question.promptImageKey,
    options: question.options,
    optionImageUrls: question.optionImageUrls,
    correctIndex: question.correctIndex,
  }
}

function questionReady(question: EditorQuestion) {
  const hasPrompt =
    Boolean(question.prompt.trim()) || Boolean(question.promptImageUrl)
  const optionsOk =
    question.options.length >= 2 &&
    question.options.every(
      (opt, i) => Boolean(opt.trim()) || Boolean(question.optionImageUrls[i]),
    )
  return (
    hasPrompt &&
    optionsOk &&
    question.correctIndex >= 0 &&
    question.correctIndex < question.options.length
  )
}

export function ModuleQuizEditor({
  questions,
  onChange,
}: {
  questions: EditorQuestion[]
  onChange: (next: EditorQuestion[]) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <section className="rounded-xl border border-black/10 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[#001752]">Quiz</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Create questions in a focused builder with live preview.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => setOpen(true)}
            className="h-9 gap-1.5 rounded-lg bg-[#00206F] text-white hover:bg-[#001752]"
          >
            {questions.length > 0 ? (
              <>
                <PencilIcon className="size-3.5" />
                Edit quiz
              </>
            ) : (
              <>
                <SparklesIcon className="size-3.5" />
                Create quiz
              </>
            )}
          </Button>
        </div>

        {questions.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-black/10 bg-[#fafafa] px-4 py-8 text-center text-sm text-muted-foreground">
            Optional. Students pass this quiz after the video.
          </div>
        ) : (
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {questions.slice(0, 4).map((question, index) => (
              <li
                key={index}
                className="rounded-xl border border-black/8 bg-[#f7f8fb] px-3 py-2.5"
              >
                <p className="text-[10px] font-semibold tracking-[0.12em] text-[#00206F]/65 uppercase">
                  Q{index + 1}
                </p>
                <p className="mt-1 line-clamp-2 text-sm font-medium text-[#001752]">
                  {question.prompt.trim() ||
                    (question.promptImageUrl
                      ? "Image question"
                      : "Untitled question")}
                </p>
              </li>
            ))}
            {questions.length > 4 ? (
              <li className="flex items-center rounded-xl border border-dashed border-black/10 px-3 py-2.5 text-sm text-muted-foreground">
                +{questions.length - 4} more
              </li>
            ) : null}
          </ul>
        )}
      </section>

      <QuizBuilderModal
        open={open}
        initialQuestions={questions}
        onClose={() => setOpen(false)}
        onSave={(next) => {
          onChange(next)
          setOpen(false)
          toast.success(
            next.length
              ? `Quiz saved · ${next.length} question${next.length === 1 ? "" : "s"}`
              : "Quiz cleared.",
          )
        }}
      />
    </>
  )
}

function QuizBuilderModal({
  open,
  initialQuestions,
  onClose,
  onSave,
}: {
  open: boolean
  initialQuestions: EditorQuestion[]
  onClose: () => void
  onSave: (questions: EditorQuestion[]) => void
}) {
  const titleId = useId()
  const csvInputRef = useRef<HTMLInputElement>(null)
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState<Step>("start")
  const [draft, setDraft] = useState<EditorQuestion[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setVisible(false)
      return
    }
    const hasQuiz = initialQuestions.length > 0
    setDraft(hasQuiz ? initialQuestions.map((q) => ({ ...q })) : [])
    setStep(hasQuiz ? "build" : "start")
    setActiveIndex(0)
    const frame = window.requestAnimationFrame(() => setVisible(true))
    return () => window.cancelAnimationFrame(frame)
  }, [open, initialQuestions])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  if (!open || typeof document === "undefined") return null

  const active = draft[activeIndex] || emptyQuestion()
  const readyCount = draft.filter(questionReady).length

  function updateActive(
    patch: Partial<EditorQuestion> | ((current: EditorQuestion) => EditorQuestion),
  ) {
    setDraft((current) =>
      current.map((row, i) => {
        if (i !== activeIndex) return row
        return typeof patch === "function" ? patch(row) : { ...row, ...patch }
      }),
    )
  }

  async function uploadImage(file: File, key: string) {
    setUploadingKey(key)
    try {
      return await uploadService.uploadFile(file, { folder: "quiz" })
    } finally {
      setUploadingKey(null)
    }
  }

  async function onCsvFile(file: File) {
    try {
      const text = await file.text()
      const parsed = parseQuizCsv(text)
      if (!parsed.ok) {
        toast.error(parsed.error)
        return
      }
      const next = parsed.questions.map(fromNormalized)
      setDraft(next)
      setActiveIndex(0)
      setStep("build")
      toast.success(`Imported ${next.length} questions.`)
    } catch {
      toast.error("Could not read CSV file.")
    }
  }

  function downloadTemplate() {
    const blob = new Blob([QUIZ_CSV_TEMPLATE], {
      type: "text/csv;charset=utf-8",
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = "techup-quiz-template.csv"
    anchor.click()
    URL.revokeObjectURL(url)
  }

  function startBlank() {
    setDraft([emptyQuestion()])
    setActiveIndex(0)
    setStep("build")
  }

  function addQuestion() {
    setDraft((current) => [...current, emptyQuestion()])
    setActiveIndex(draft.length)
  }

  function removeActive() {
    if (draft.length <= 1) {
      setDraft([emptyQuestion()])
      setActiveIndex(0)
      return
    }
    const next = draft.filter((_, i) => i !== activeIndex)
    setDraft(next)
    setActiveIndex(Math.max(0, activeIndex - 1))
  }

  function finish() {
    const cleaned = draft.filter((q) => !isBlankQuizQuestion(q))
    for (const question of cleaned) {
      if (!questionReady(question)) {
        toast.error("Finish each question: text/image + options + correct answer.")
        setStep("build")
        return
      }
    }
    onSave(cleaned)
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <button
        type="button"
        aria-label="Close quiz builder"
        className={cn(
          "absolute inset-0 bg-[#001028]/55 backdrop-blur-[6px] transition-opacity duration-200",
          visible ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "relative z-10 flex h-[min(860px,92dvh)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#f7f8fb] shadow-[0_32px_90px_-28px_rgba(0,32,111,0.55)] transition-[opacity,transform] duration-200",
          visible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-3 scale-[0.98] opacity-0",
        )}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-3 border-b border-black/5 bg-white px-5 py-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-[#00206F]/70 uppercase">
              Quiz builder
            </p>
            <h2
              id={titleId}
              className="mt-0.5 text-lg font-semibold tracking-tight text-[#001752]"
            >
              {step === "start"
                ? "How do you want to start?"
                : step === "build"
                  ? "Craft & preview"
                  : "Review & save"}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <StepPills step={step} />
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-black/4 hover:text-[#001752]"
            >
              <XIcon className="size-4" />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-hidden">
          {step === "start" ? (
            <StartStep
              onBlank={startBlank}
              onTemplate={downloadTemplate}
              onPickCsv={() => csvInputRef.current?.click()}
            />
          ) : null}

          {step === "build" ? (
            <div className="grid h-full min-h-0 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="min-h-0 overflow-y-auto border-b border-black/5 bg-white p-5 lg:border-r lg:border-b-0">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {draft.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setActiveIndex(index)}
                        className={cn(
                          "flex size-8 items-center justify-center rounded-lg text-xs font-semibold transition-colors",
                          index === activeIndex
                            ? "bg-[#00206F] text-white"
                            : questionReady(draft[index])
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-[#eef2f9] text-[#00206F]",
                        )}
                      >
                        {index + 1}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="flex size-8 items-center justify-center rounded-lg border border-dashed border-black/15 text-[#00206F] hover:bg-[#eef2f9]"
                      aria-label="Add question"
                    >
                      <PlusIcon className="size-3.5" />
                    </button>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 text-destructive"
                    onClick={removeActive}
                  >
                    <Trash2Icon className="size-3.5" />
                    Remove
                  </Button>
                </div>

                <QuestionEditor
                  question={active}
                  qIndex={activeIndex}
                  uploadingKey={uploadingKey}
                  onChange={updateActive}
                  onUpload={uploadImage}
                />
              </div>

              <div className="min-h-0 overflow-y-auto bg-[#eef2f9] p-5">
                <p className="text-[11px] font-semibold tracking-[0.14em] text-[#00206F]/65 uppercase">
                  Student preview
                </p>
                <div className="mt-3">
                  <QuizPreviewCard
                    question={active}
                    index={activeIndex}
                    total={draft.length}
                  />
                </div>
              </div>
            </div>
          ) : null}

          {step === "review" ? (
            <div className="h-full overflow-y-auto p-5">
              <div className="mx-auto max-w-3xl space-y-3">
                <div className="rounded-xl border border-black/5 bg-white px-4 py-3 text-sm text-[#334155]">
                  {readyCount} ready question{readyCount === 1 ? "" : "s"} ·
                  pass mark is set on the module basics card.
                </div>
                {draft.map((question, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setActiveIndex(index)
                      setStep("build")
                    }}
                    className="flex w-full items-start gap-3 rounded-xl border border-black/8 bg-white px-4 py-3 text-left transition-colors hover:border-[#00206F]/20"
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold",
                        questionReady(question)
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700",
                      )}
                    >
                      {questionReady(question) ? (
                        <CheckIcon className="size-3.5" />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-[#001752]">
                        {question.prompt.trim() ||
                          (question.promptImageUrl
                            ? "Image question"
                            : "Incomplete question")}
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {question.options.length} options · correct{" "}
                        {String.fromCharCode(65 + question.correctIndex)}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <footer className="flex flex-col-reverse gap-2 border-t border-black/5 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-xl border-black/10"
            onClick={() => {
              if (step === "build") setStep("start")
              else if (step === "review") setStep("build")
              else onClose()
            }}
          >
            <ArrowLeftIcon className="size-4" />
            {step === "start" ? "Cancel" : "Back"}
          </Button>

          <div className="flex flex-col gap-2 sm:flex-row">
            {step === "build" ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-xl border-black/10"
                  onClick={() => setStep("review")}
                >
                  Review
                </Button>
                <Button
                  type="button"
                  className="h-10 rounded-xl bg-[#00206F] text-white hover:bg-[#001752]"
                  onClick={finish}
                >
                  Save quiz
                  <ArrowRightIcon className="size-4" />
                </Button>
              </>
            ) : null}
            {step === "review" ? (
              <Button
                type="button"
                className="h-10 rounded-xl bg-[#00206F] text-white hover:bg-[#001752]"
                onClick={finish}
              >
                Save quiz
              </Button>
            ) : null}
            {step === "start" ? (
              <Button
                type="button"
                variant="ghost"
                className="h-10 text-muted-foreground"
                onClick={() => onSave([])}
              >
                Clear quiz
              </Button>
            ) : null}
          </div>
        </footer>

        <input
          ref={csvInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            e.target.value = ""
            if (file) void onCsvFile(file)
          }}
        />
      </div>
    </div>,
    document.body,
  )
}

function StepPills({ step }: { step: Step }) {
  const items: Array<{ id: Step; label: string }> = [
    { id: "start", label: "Start" },
    { id: "build", label: "Build" },
    { id: "review", label: "Review" },
  ]
  const active = items.findIndex((item) => item.id === step)

  return (
    <div className="hidden items-center gap-1 sm:flex">
      {items.map((item, index) => (
        <div key={item.id} className="flex items-center gap-1">
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-semibold",
              index <= active
                ? "bg-[#00206F] text-white"
                : "bg-[#eef2f9] text-muted-foreground",
            )}
          >
            {item.label}
          </span>
          {index < items.length - 1 ? (
            <span className="h-px w-3 bg-black/10" />
          ) : null}
        </div>
      ))}
    </div>
  )
}

function StartStep({
  onBlank,
  onTemplate,
  onPickCsv,
}: {
  onBlank: () => void
  onTemplate: () => void
  onPickCsv: () => void
}) {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={onBlank}
          className="group rounded-2xl border border-black/8 bg-white p-6 text-left transition-[border-color,box-shadow] hover:border-[#00206F]/25 hover:shadow-[0_16px_40px_-28px_rgba(0,32,111,0.45)]"
        >
          <span className="flex size-11 items-center justify-center rounded-xl bg-[#eef2f9] text-[#00206F]">
            <SparklesIcon className="size-5" />
          </span>
          <p className="mt-4 text-base font-semibold text-[#001752]">
            Create from scratch
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Add questions one by one with text, images, and a live student
            preview.
          </p>
        </button>

        <button
          type="button"
          onClick={onPickCsv}
          className="group rounded-2xl border border-black/8 bg-white p-6 text-left transition-[border-color,box-shadow] hover:border-[#FB7801]/35 hover:shadow-[0_16px_40px_-28px_rgba(251,120,1,0.35)]"
        >
          <span className="flex size-11 items-center justify-center rounded-xl bg-[#fff4ea] text-[#FB7801]">
            <UploadIcon className="size-5" />
          </span>
          <p className="mt-4 text-base font-semibold text-[#001752]">
            Import CSV
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Upload a spreadsheet of questions, then polish images in the
            builder.
          </p>
          <span
            role="link"
            tabIndex={0}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#00206F]"
            onClick={(event) => {
              event.stopPropagation()
              onTemplate()
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                event.stopPropagation()
                onTemplate()
              }
            }}
          >
            <FileSpreadsheetIcon className="size-3.5" />
            Download template
          </span>
        </button>
      </div>
    </div>
  )
}

function QuestionEditor({
  question,
  qIndex,
  uploadingKey,
  onChange,
  onUpload,
}: {
  question: EditorQuestion
  qIndex: number
  uploadingKey: string | null
  onChange: (
    patch: Partial<EditorQuestion> | ((current: EditorQuestion) => EditorQuestion),
  ) => void
  onUpload: (
    file: File,
    key: string,
  ) => Promise<{ url: string; key: string }>
}) {
  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold tracking-[0.12em] text-[#00206F]/70 uppercase">
        Question {qIndex + 1}
      </p>
      <Input
        value={question.prompt}
        onChange={(e) => onChange({ prompt: e.target.value })}
        placeholder="Ask something… (optional if you add an image)"
        className="h-11 rounded-xl border-black/10 bg-transparent"
      />

      <ImageSlot
        label="Question image"
        url={question.promptImageUrl}
        uploading={uploadingKey === `q-${qIndex}-prompt`}
        onPick={async (file) => {
          try {
            const uploaded = await onUpload(file, `q-${qIndex}-prompt`)
            onChange({
              promptImageUrl: uploaded.url,
              promptImageKey: uploaded.key,
            })
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Upload failed.")
          }
        }}
        onClear={() =>
          onChange({ promptImageUrl: null, promptImageKey: null })
        }
      />

      <div className="space-y-2.5">
        <p className="text-xs font-medium text-muted-foreground">
          Options — tap the letter to mark correct
        </p>
        {question.options.map((option, oIndex) => {
          const selected = question.correctIndex === oIndex
          return (
            <div
              key={oIndex}
              className={cn(
                "space-y-2 rounded-xl border p-3",
                selected
                  ? "border-[#00206F]/25 bg-[#f4f7fc]"
                  : "border-black/8",
              )}
            >
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onChange({ correctIndex: oIndex })}
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                    selected
                      ? "bg-[#00206F] text-white"
                      : "bg-[#eef2f9] text-[#00206F]",
                  )}
                >
                  {String.fromCharCode(65 + oIndex)}
                </button>
                <Input
                  value={option}
                  onChange={(e) =>
                    onChange((current) => ({
                      ...current,
                      options: current.options.map((opt, j) =>
                        j === oIndex ? e.target.value : opt,
                      ),
                    }))
                  }
                  placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                  className="h-9 rounded-lg border-black/10 bg-transparent"
                />
                {question.options.length > 2 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 shrink-0 text-destructive"
                    onClick={() =>
                      onChange((current) => {
                        const options = current.options.filter(
                          (_, j) => j !== oIndex,
                        )
                        const optionImageUrls = current.optionImageUrls.filter(
                          (_, j) => j !== oIndex,
                        )
                        let correctIndex = current.correctIndex
                        if (oIndex === current.correctIndex) correctIndex = 0
                        else if (oIndex < current.correctIndex) {
                          correctIndex = current.correctIndex - 1
                        }
                        return {
                          ...current,
                          options,
                          optionImageUrls,
                          correctIndex,
                        }
                      })
                    }
                  >
                    <Trash2Icon className="size-3.5" />
                  </Button>
                ) : null}
              </div>
              <ImageSlot
                label="Option image"
                compact
                url={question.optionImageUrls[oIndex] || null}
                uploading={uploadingKey === `q-${qIndex}-opt-${oIndex}`}
                onPick={async (file) => {
                  try {
                    const uploaded = await onUpload(
                      file,
                      `q-${qIndex}-opt-${oIndex}`,
                    )
                    onChange((current) => ({
                      ...current,
                      optionImageUrls: current.optionImageUrls.map((url, j) =>
                        j === oIndex ? uploaded.url : url,
                      ),
                    }))
                  } catch (err) {
                    toast.error(
                      err instanceof Error ? err.message : "Upload failed.",
                    )
                  }
                }}
                onClear={() =>
                  onChange((current) => ({
                    ...current,
                    optionImageUrls: current.optionImageUrls.map((url, j) =>
                      j === oIndex ? "" : url,
                    ),
                  }))
                }
              />
            </div>
          )
        })}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1"
          onClick={() =>
            onChange((current) => ({
              ...current,
              options: [...current.options, ""],
              optionImageUrls: [...current.optionImageUrls, ""],
            }))
          }
        >
          <PlusIcon className="size-3.5" /> Add option
        </Button>
      </div>
    </div>
  )
}

function QuizPreviewCard({
  question,
  index,
  total,
}: {
  question: EditorQuestion
  index: number
  total: number
}) {
  const hasOptionImages = question.optionImageUrls.some(Boolean)

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-[0_12px_40px_-28px_rgba(0,32,111,0.4)]">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Question {index + 1}
          <span className="text-[#001752]/40"> of {total || 1}</span>
        </span>
        <span className="rounded-md bg-[#eef2f9] px-2 py-0.5 font-semibold text-[#00206F]">
          Preview
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {question.prompt.trim() ? (
          <p className="text-[1.02rem] font-semibold leading-snug text-[#001752]">
            {question.prompt}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {question.promptImageUrl
              ? "Look at the image, then choose an answer."
              : "Your question preview appears here."}
          </p>
        )}
        {question.promptImageUrl ? (
          <div className="relative aspect-video overflow-hidden rounded-xl border border-black/8 bg-[#f4f6fa]">
            <Image
              src={question.promptImageUrl}
              alt=""
              fill
              className="object-contain p-2"
              unoptimized
            />
          </div>
        ) : null}
      </div>

      <div
        className={cn(
          "mt-4 grid gap-2",
          hasOptionImages ? "sm:grid-cols-2" : "grid-cols-1",
        )}
      >
        {question.options.map((option, optionIndex) => {
          const imageUrl = question.optionImageUrls[optionIndex]
          const selected = question.correctIndex === optionIndex
          return (
            <div
              key={optionIndex}
              className={cn(
                "rounded-xl border text-left text-sm",
                imageUrl ? "overflow-hidden" : "px-3 py-3",
                selected
                  ? "border-[#00206F]/30 bg-[#eef2f9]"
                  : "border-black/6 bg-[#fafafa]",
              )}
            >
              {imageUrl ? (
                <>
                  <div className="relative m-2 aspect-video overflow-hidden rounded-xl bg-[#f4f6fa]">
                    <Image
                      src={imageUrl}
                      alt=""
                      fill
                      className="rounded-xl object-contain p-2"
                      unoptimized
                    />
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2">
                    <span className="flex size-5 items-center justify-center rounded-full bg-[#00206F]/10 text-[10px] font-bold text-[#00206F]">
                      {String.fromCharCode(65 + optionIndex)}
                    </span>
                    <span className="text-[#334155]">
                      {option.trim() || "Image option"}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-black/10 text-[10px] font-semibold text-muted-foreground">
                    {String.fromCharCode(65 + optionIndex)}
                  </span>
                  <span className="text-[#334155]">
                    {option.trim() || "Option text…"}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ImageSlot({
  label,
  url,
  uploading,
  onPick,
  onClear,
  compact,
}: {
  label: string
  url: string | null
  uploading: boolean
  onPick: (file: File) => void | Promise<void>
  onClear: () => void
  compact?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="flex gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            className="h-7 gap-1 rounded-md border-black/10 text-xs"
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <LoaderCircleIcon className="size-3.5 animate-spin" />
            ) : (
              <ImageIcon className="size-3.5" />
            )}
            {url ? "Replace" : "Upload"}
          </Button>
          {url ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-destructive"
              onClick={onClear}
            >
              Remove
            </Button>
          ) : null}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ""
          if (file) void onPick(file)
        }}
      />
      {url ? (
        <div
          className={cn(
            "relative overflow-hidden rounded-xl border border-black/8 bg-[#f4f6fa]",
            compact ? "aspect-video max-w-[220px]" : "aspect-video max-w-sm",
          )}
        >
          <Image
            src={url}
            alt=""
            fill
            className="rounded-xl object-contain"
            unoptimized
          />
        </div>
      ) : null}
    </div>
  )
}
