import { describe, expect, it } from "vitest"

function courseComplete(passed: number, total: number) {
  if (total === 0) return false
  return passed >= total
}

describe("course certificate completion", () => {
  it("requires every module to pass", () => {
    expect(courseComplete(3, 5)).toBe(false)
    expect(courseComplete(5, 5)).toBe(true)
  })

  it("does not issue for empty courses", () => {
    expect(courseComplete(0, 0)).toBe(false)
  })
})
