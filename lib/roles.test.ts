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

  it("allows tutors and admins to manage live classes", () => {
    expect(canAccessPath("tutor", "/dashboard/live/manage")).toBe(true)
    expect(canAccessPath("admin", "/dashboard/live/manage")).toBe(true)
    expect(canAccessPath("student", "/dashboard/live/manage")).toBe(false)
  })

  it("allows students tutors and admins into a live classroom", () => {
    expect(canAccessPath("student", "/dashboard/live/64b1f0c8a1b2c3d4e5f60789")).toBe(
      true,
    )
    expect(canAccessPath("tutor", "/dashboard/live/64b1f0c8a1b2c3d4e5f60789")).toBe(
      true,
    )
    expect(canAccessPath("admin", "/dashboard/live/64b1f0c8a1b2c3d4e5f60789")).toBe(
      true,
    )
  })

  it("allows admin and tutor to manage courses", () => {
    expect(canAccessPath("admin", "/dashboard/courses/manage")).toBe(true)
    expect(canAccessPath("tutor", "/dashboard/courses/manage")).toBe(true)
    expect(
      canAccessPath("admin", "/dashboard/courses/manage/abc/edit"),
    ).toBe(true)
    expect(canAccessPath("student", "/dashboard/courses/manage")).toBe(false)
  })
})
