import { describe, expect, it } from "vitest"
import {
  AGE_RANGES,
  COUNTRIES,
  DAILY_HOURS,
  EDUCATION_LEVELS,
  GENDERS,
  REFERRAL_SOURCES,
  YES_NO,
} from "@/lib/scholarship-options"

describe("scholarship-options", () => {
  it("exposes non-empty option catalogs", () => {
    expect(AGE_RANGES.length).toBeGreaterThan(0)
    expect(GENDERS.length).toBeGreaterThan(0)
    expect(COUNTRIES.length).toBeGreaterThan(0)
    expect(EDUCATION_LEVELS.length).toBeGreaterThan(0)
    expect(REFERRAL_SOURCES.length).toBeGreaterThan(0)
    expect(DAILY_HOURS.length).toBeGreaterThan(0)
    expect(YES_NO.map((o) => o.value)).toEqual(["yes", "no"])
  })
})
