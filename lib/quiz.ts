export type QuizQuestionInput = {
  prompt: string
  promptImageUrl?: string | null
  promptImageKey?: string | null
  options: string[]
  optionImageUrls?: Array<string | null | undefined>
  correctIndex: number
}

export type NormalizedQuizQuestion = {
  prompt: string
  promptImageUrl: string | null
  promptImageKey: string | null
  options: string[]
  optionImageUrls: string[]
  correctIndex: number
}

function cleanUrl(value: unknown) {
  const text = String(value ?? "").trim()
  return text || null
}

export function normalizeQuizQuestion(
  question: QuizQuestionInput,
): NormalizedQuizQuestion {
  const options = (question.options || []).map((opt) => String(opt ?? ""))
  const rawImages = question.optionImageUrls || []
  const optionImageUrls = options.map((_, index) => {
    const url = cleanUrl(rawImages[index])
    return url || ""
  })

  return {
    prompt: String(question.prompt ?? "").trim(),
    promptImageUrl: cleanUrl(question.promptImageUrl),
    promptImageKey: cleanUrl(question.promptImageKey),
    options,
    optionImageUrls,
    correctIndex: Number(question.correctIndex) || 0,
  }
}

export function isBlankQuizQuestion(question: QuizQuestionInput) {
  const normalized = normalizeQuizQuestion(question)
  const hasPrompt =
    Boolean(normalized.prompt) || Boolean(normalized.promptImageUrl)
  const hasAnyOption = normalized.options.some(
    (option, index) =>
      Boolean(option.trim()) || Boolean(normalized.optionImageUrls[index]),
  )
  return !hasPrompt && !hasAnyOption
}

export function validateQuizQuestion(question: QuizQuestionInput) {
  const normalized = normalizeQuizQuestion(question)

  if (!normalized.prompt && !normalized.promptImageUrl) {
    return {
      ok: false as const,
      error: "Each quiz question needs text or an image.",
    }
  }

  if (normalized.options.length < 2) {
    return {
      ok: false as const,
      error: "Each quiz question needs at least 2 options.",
    }
  }

  for (let i = 0; i < normalized.options.length; i += 1) {
    const hasText = Boolean(normalized.options[i].trim())
    const hasImage = Boolean(normalized.optionImageUrls[i])
    if (!hasText && !hasImage) {
      return {
        ok: false as const,
        error: "Each option needs text or an image.",
      }
    }
  }

  if (
    normalized.correctIndex < 0 ||
    normalized.correctIndex >= normalized.options.length
  ) {
    return {
      ok: false as const,
      error: "Quiz correct answer index is invalid.",
    }
  }

  return { ok: true as const, question: normalized }
}

function parseCsvRows(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ""
  let inQuotes = false

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    const next = text[i + 1]

    if (inQuotes) {
      if (char === '"' && next === '"') {
        cell += '"'
        i += 1
      } else if (char === '"') {
        inQuotes = false
      } else {
        cell += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
      continue
    }
    if (char === ",") {
      row.push(cell)
      cell = ""
      continue
    }
    if (char === "\n" || char === "\r") {
      if (char === "\r" && next === "\n") i += 1
      row.push(cell)
      cell = ""
      if (row.some((value) => value.trim())) rows.push(row)
      row = []
      continue
    }
    cell += char
  }

  row.push(cell)
  if (row.some((value) => value.trim())) rows.push(row)
  return rows
}

function headerKey(value: string) {
  return value.trim().toLowerCase().replace(/[\s-]+/g, "_")
}

function parseCorrectIndex(raw: string, optionCount: number) {
  const value = raw.trim()
  if (!value) return 0

  const letter = value.toUpperCase()
  if (/^[A-Z]$/.test(letter)) {
    const index = letter.charCodeAt(0) - 65
    return index >= 0 && index < optionCount ? index : 0
  }

  const asNumber = Number(value)
  if (!Number.isFinite(asNumber)) return 0
  // Support 1-based (CSV common) and 0-based
  if (asNumber >= 1 && asNumber <= optionCount) return asNumber - 1
  if (asNumber >= 0 && asNumber < optionCount) return asNumber
  return 0
}

/**
 * CSV columns (flexible):
 * prompt, prompt_image?, option1, option1_image?, option2, ..., correct
 * Aliases: question, answer, option_a / opt1, etc.
 */
export function parseQuizCsv(text: string): {
  ok: true
  questions: NormalizedQuizQuestion[]
} | {
  ok: false
  error: string
} {
  const rows = parseCsvRows(text)
  if (rows.length < 2) {
    return {
      ok: false,
      error: "CSV needs a header row and at least one question.",
    }
  }

  const headers = rows[0].map(headerKey)
  const promptIdx = headers.findIndex((h) =>
    ["prompt", "question", "q"].includes(h),
  )
  const promptImageIdx = headers.findIndex((h) =>
    ["prompt_image", "question_image", "image", "prompt_image_url"].includes(h),
  )
  const correctIdx = headers.findIndex((h) =>
    ["correct", "answer", "correct_index", "correctindex", "key"].includes(h),
  )

  if (promptIdx < 0) {
    return {
      ok: false,
      error: 'CSV must include a "prompt" (or "question") column.',
    }
  }

  const optionCols: Array<{ text: number; image: number | null }> = []
  headers.forEach((header, index) => {
    const match =
      header.match(/^option_?([a-z]|\d+)$/) ||
      header.match(/^opt_?([a-z]|\d+)$/) ||
      header.match(/^choice_?([a-z]|\d+)$/)
    if (!match) return
    const token = match[1]
    const imageHeaderCandidates = [
      `option_${token}_image`,
      `option${token}_image`,
      `opt_${token}_image`,
      `opt${token}_image`,
      `choice_${token}_image`,
      `choice${token}_image`,
    ]
    const image = headers.findIndex((h) => imageHeaderCandidates.includes(h))
    optionCols.push({ text: index, image: image >= 0 ? image : null })
  })

  // Also support option1_image paired when option1 exists (already handled)
  // Fallback: unlabeled consecutive option_a style already covered.
  if (optionCols.length < 2) {
    // Fallback: treat columns after prompt (excluding known meta) as options
    const reserved = new Set(
      [promptIdx, promptImageIdx, correctIdx].filter((i) => i >= 0),
    )
    headers.forEach((header, index) => {
      if (reserved.has(index)) return
      if (header.endsWith("_image") || header.includes("image")) return
      if (
        header.startsWith("option") ||
        header.startsWith("opt") ||
        header.startsWith("choice") ||
        /^[a-d]$/.test(header)
      ) {
        optionCols.push({ text: index, image: null })
      }
    })
  }

  if (optionCols.length < 2) {
    return {
      ok: false,
      error: "CSV needs at least two option columns (option1, option2, …).",
    }
  }

  const questions: NormalizedQuizQuestion[] = []
  for (let r = 1; r < rows.length; r += 1) {
    const row = rows[r]
    const options = optionCols.map(({ text }) => String(row[text] ?? "").trim())
    const optionImageUrls = optionCols.map(({ image }) =>
      image == null ? "" : String(row[image] ?? "").trim(),
    )

    // Drop trailing empty option pairs
    while (
      options.length > 2 &&
      !options[options.length - 1] &&
      !optionImageUrls[optionImageUrls.length - 1]
    ) {
      options.pop()
      optionImageUrls.pop()
    }

    const draft: QuizQuestionInput = {
      prompt: String(row[promptIdx] ?? ""),
      promptImageUrl:
        promptImageIdx >= 0 ? String(row[promptImageIdx] ?? "") : null,
      options,
      optionImageUrls,
      correctIndex: parseCorrectIndex(
        correctIdx >= 0 ? String(row[correctIdx] ?? "") : "1",
        options.length,
      ),
    }

    const validated = validateQuizQuestion(draft)
    if (!validated.ok) {
      return {
        ok: false,
        error: `Row ${r + 1}: ${validated.error}`,
      }
    }
    questions.push(validated.question)
  }

  if (questions.length === 0) {
    return { ok: false, error: "No valid questions found in CSV." }
  }

  return { ok: true, questions }
}

export const QUIZ_CSV_TEMPLATE = `prompt,prompt_image,option1,option1_image,option2,option2_image,option3,option3_image,option4,option4_image,correct
What does this function return?,,42,,null,,undefined,,NaN,,B
Pick the correct UI screenshot,,Option A,https://example.com/a.png,Option B,https://example.com/b.png,,,,,A
`
