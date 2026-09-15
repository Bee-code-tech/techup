/** Pricing helpers for cohort checkout (amounts in kobo). */

export function nairaToKobo(naira: number) {
  return Math.round(naira * 100)
}

export function koboToNaira(kobo: number) {
  return kobo / 100
}

export function formatNgnFromKobo(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(koboToNaira(kobo))
}

export function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.min(100, Math.max(0, Math.round(value)))
}

export function amountAfterPercentOff(priceKobo: number, percentOff: number) {
  const off = clampPercent(percentOff)
  return Math.max(0, Math.round(priceKobo * (1 - off / 100)))
}

export function validateInstallmentPercents(percents: number[]) {
  if (!Array.isArray(percents) || percents.length < 2) {
    return { ok: false as const, error: "Need at least 2 installment parts." }
  }
  if (percents.some((p) => !Number.isFinite(p) || p <= 0)) {
    return { ok: false as const, error: "Each installment percent must be > 0." }
  }
  const sum = percents.reduce((a, b) => a + b, 0)
  if (sum !== 100) {
    return { ok: false as const, error: "Installment percents must sum to 100." }
  }
  return { ok: true as const }
}

export function splitInstallmentAmounts(priceKobo: number, percents: number[]) {
  const check = validateInstallmentPercents(percents)
  if (!check.ok) throw new Error(check.error)

  const amounts = percents.map((percent) =>
    Math.round((priceKobo * percent) / 100),
  )
  const drift = priceKobo - amounts.reduce((a, b) => a + b, 0)
  amounts[amounts.length - 1] += drift
  return amounts
}

export function buildInstallmentSchedule(options: {
  priceKobo: number
  percents: number[]
  startDate: Date
  intervalDays: number
}) {
  const amounts = splitInstallmentAmounts(options.priceKobo, options.percents)
  return amounts.map((amountKobo, index) => {
    const dueAt = new Date(options.startDate)
    dueAt.setUTCDate(dueAt.getUTCDate() + index * options.intervalDays)
    return {
      index,
      percent: options.percents[index],
      amountKobo,
      dueAt,
    }
  })
}

export function isCouponValid(options: {
  isActive: boolean
  expiresAt: Date | null
  maxUses: number | null
  usedCount: number
  now?: Date
}) {
  const now = options.now ?? new Date()
  if (!options.isActive) return { ok: false as const, reason: "inactive" }
  if (options.expiresAt && options.expiresAt.getTime() < now.getTime()) {
    return { ok: false as const, reason: "expired" }
  }
  if (
    options.maxUses != null &&
    options.usedCount >= options.maxUses
  ) {
    return { ok: false as const, reason: "exhausted" }
  }
  return { ok: true as const }
}

export function quoteCheckout(options: {
  priceKobo: number
  mode: "full" | "installment"
  scholarshipPercentOff?: number | null
  couponPercentOff?: number | null
  installmentPercents?: number[]
}) {
  let working = options.priceKobo
  let scholarshipOff = 0
  let couponOff = 0

  if (options.scholarshipPercentOff != null) {
    scholarshipOff = clampPercent(options.scholarshipPercentOff)
    working = amountAfterPercentOff(working, scholarshipOff)
  } else if (options.couponPercentOff != null) {
    couponOff = clampPercent(options.couponPercentOff)
    working = amountAfterPercentOff(options.priceKobo, couponOff)
  }

  if (options.mode === "installment") {
    const percents = options.installmentPercents || [40, 30, 30]
    const check = validateInstallmentPercents(percents)
    if (!check.ok) throw new Error(check.error)
    const parts = splitInstallmentAmounts(working, percents)
    return {
      listPriceKobo: options.priceKobo,
      dueNowKobo: parts[0],
      totalDueKobo: working,
      scholarshipPercentOff: scholarshipOff || null,
      couponPercentOff: couponOff || null,
      installmentParts: parts,
    }
  }

  return {
    listPriceKobo: options.priceKobo,
    dueNowKobo: working,
    totalDueKobo: working,
    scholarshipPercentOff: scholarshipOff || null,
    couponPercentOff: couponOff || null,
    installmentParts: null as number[] | null,
  }
}
