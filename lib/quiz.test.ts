import { describe, expect, it } from "vitest"

import { parseCorrectIndex, parseQuizCsv } from "@/lib/quiz"

describe("parseCorrectIndex", () => {
  const options = ["42", "null", "undefined", "NaN"]

  it("resolves letters", () => {
    expect(parseCorrectIndex("B", options)).toEqual({ index: 1, matched: true })
    expect(parseCorrectIndex("d", options)).toEqual({ index: 3, matched: true })
  })

  it("resolves 1-based numbers", () => {
    expect(parseCorrectIndex("3", options)).toEqual({ index: 2, matched: true })
  })

  it("resolves option text", () => {
    expect(parseCorrectIndex("null", options)).toEqual({
      index: 1,
      matched: true,
    })
    expect(parseCorrectIndex("NaN", options)).toEqual({
      index: 3,
      matched: true,
    })
  })

  it("resolves Option B style labels", () => {
    expect(parseCorrectIndex("Option C", options)).toEqual({
      index: 2,
      matched: true,
    })
    expect(parseCorrectIndex("B)", options)).toEqual({
      index: 1,
      matched: true,
    })
  })

  it("rejects unknown values instead of silently using A", () => {
    expect(parseCorrectIndex("not-an-option", options).matched).toBe(false)
    expect(parseCorrectIndex("", options).matched).toBe(false)
  })
})

describe("parseQuizCsv", () => {
  it("imports correct answers from letters", () => {
    const csv = `prompt,option1,option2,option3,option4,correct
Q1,42,null,undefined,NaN,B
Q2,a,b,c,d,D`

    const parsed = parseQuizCsv(csv)
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    expect(parsed.questions[0].correctIndex).toBe(1)
    expect(parsed.questions[1].correctIndex).toBe(3)
  })

  it("imports correct answers from option text and correct_answer header", () => {
    const csv = `question,option1,option2,option3,correct_answer
Which is null?,42,null,undefined,null`

    const parsed = parseQuizCsv(csv)
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    expect(parsed.questions[0].correctIndex).toBe(1)
    expect(parsed.questions[0].options[1]).toBe("null")
  })

  it("fails clearly when correct cannot be resolved", () => {
    const csv = `prompt,option1,option2,correct
Q1,yes,no,maybe`

    const parsed = parseQuizCsv(csv)
    expect(parsed.ok).toBe(false)
    if (parsed.ok) return
    expect(parsed.error).toMatch(/Could not resolve correct answer/i)
  })

  it("requires a correct column", () => {
    const csv = `prompt,option1,option2
Q1,yes,no`

    const parsed = parseQuizCsv(csv)
    expect(parsed.ok).toBe(false)
    if (parsed.ok) return
    expect(parsed.error).toMatch(/correct/i)
  })
})
