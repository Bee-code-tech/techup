import { describe, expect, it } from "vitest"
import { canAccessPath } from "@/lib/roles"

describe("roles payment routes", () => {
  it("restricts payments and scholarships to admin", () => {
    expect(canAccessPath("admin", "/dashboard/payments")).toBe(true)
    expect(canAccessPath("admin", "/dashboard/scholarships")).toBe(true)
    expect(canAccessPath("tutor", "/dashboard/payments")).toBe(false)
    expect(canAccessPath("student", "/dashboard/scholarships")).toBe(false)
  })

  it("allows students certificates and leaderboard", () => {
    expect(canAccessPath("student", "/dashboard/certificates")).toBe(true)
    expect(canAccessPath("student", "/dashboard/leaderboard")).toBe(true)
    expect(canAccessPath("tutor", "/dashboard/certificates")).toBe(false)
    expect(canAccessPath("admin", "/dashboard/leaderboard")).toBe(false)
  })

  it("allows messages for student and tutor only", () => {
    expect(canAccessPath("student", "/dashboard/messages")).toBe(true)
    expect(canAccessPath("tutor", "/dashboard/messages")).toBe(true)
    expect(canAccessPath("admin", "/dashboard/messages")).toBe(false)
  })
})
