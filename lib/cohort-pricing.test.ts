import { describe, expect, it } from "vitest"
import {
  amountAfterPercentOff,
  buildInstallmentSchedule,
  formatNgnFromKobo,
  isCouponValid,
  koboToNaira,
  nairaToKobo,
  quoteCheckout,
  splitInstallmentAmounts,
  validateInstallmentPercents,
} from "@/lib/cohort-pricing"

describe("cohort-pricing", () => {
  it("converts naira and kobo", () => {
    expect(nairaToKobo(5000)).toBe(500000)
    expect(koboToNaira(500000)).toBe(5000)
  })

  it("formats NGN from kobo", () => {
    const formatted = formatNgnFromKobo(15_000_000)
    expect(formatted).toContain("150")
    expect(formatted).toMatch(/₦|NGN/)
  })

  it("applies percent off", () => {
    expect(amountAfterPercentOff(100000, 70)).toBe(30000)
    expect(amountAfterPercentOff(100000, 100)).toBe(0)
    expect(amountAfterPercentOff(100000, 0)).toBe(100000)
  })

  it("validates installment percents", () => {
    expect(validateInstallmentPercents([40, 30, 30]).ok).toBe(true)
    expect(validateInstallmentPercents([50, 50]).ok).toBe(true)
    expect(validateInstallmentPercents([40, 30]).ok).toBe(false)
    expect(validateInstallmentPercents([100]).ok).toBe(false)
  })

  it("splits installments without losing kobo to rounding", () => {
    const parts = splitInstallmentAmounts(100001, [40, 30, 30])
    expect(parts.reduce((a, b) => a + b, 0)).toBe(100001)
    expect(parts[0]).toBe(40000)
  })

  it("builds installment schedule dates", () => {
    const start = new Date("2026-01-01T00:00:00.000Z")
    const schedule = buildInstallmentSchedule({
      priceKobo: 100000,
      percents: [50, 50],
      startDate: start,
      intervalDays: 30,
    })
    expect(schedule).toHaveLength(2)
    expect(schedule[0].amountKobo).toBe(50000)
    expect(schedule[1].dueAt.toISOString()).toBe("2026-01-31T00:00:00.000Z")
  })

  it("quotes full checkout with scholarship", () => {
    const quote = quoteCheckout({
      priceKobo: 100000,
      mode: "full",
      scholarshipPercentOff: 70,
    })
    expect(quote.listPriceKobo).toBe(100000)
    expect(quote.dueNowKobo).toBe(30000)
    expect(quote.totalDueKobo).toBe(30000)
    expect(quote.scholarshipPercentOff).toBe(70)
  })

  it("quotes installment with coupon (no scholarship)", () => {
    const quote = quoteCheckout({
      priceKobo: 100000,
      mode: "installment",
      couponPercentOff: 10,
      installmentPercents: [40, 30, 30],
    })
    expect(quote.totalDueKobo).toBe(90000)
    expect(quote.dueNowKobo).toBe(36000)
    expect(quote.installmentParts).toEqual([36000, 27000, 27000])
  })

  it("prefers scholarship over coupon in quoteCheckout", () => {
    const quote = quoteCheckout({
      priceKobo: 100000,
      mode: "full",
      scholarshipPercentOff: 70,
      couponPercentOff: 10,
    })
    expect(quote.dueNowKobo).toBe(30000)
    expect(quote.couponPercentOff).toBeNull()
  })

  it("checks coupon validity", () => {
    const now = new Date("2026-06-01T00:00:00.000Z")
    expect(
      isCouponValid({
        isActive: true,
        expiresAt: new Date("2026-12-01"),
        maxUses: 10,
        usedCount: 2,
        now,
      }).ok,
    ).toBe(true)
    expect(
      isCouponValid({
        isActive: false,
        expiresAt: null,
        maxUses: null,
        usedCount: 0,
        now,
      }).reason,
    ).toBe("inactive")
    expect(
      isCouponValid({
        isActive: true,
        expiresAt: new Date("2026-01-01"),
        maxUses: null,
        usedCount: 0,
        now,
      }).reason,
    ).toBe("expired")
    expect(
      isCouponValid({
        isActive: true,
        expiresAt: null,
        maxUses: 5,
        usedCount: 5,
        now,
      }).reason,
    ).toBe("exhausted")
  })
})
