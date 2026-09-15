export type TrackOption = { id: string; label: string }

export type CohortRow = {
  id: string
  name: string
  description: string
  priceKobo: number
  status: string
  tracks: string[]
  scholarshipEnabled: boolean
  scholarshipPercentOff: number
  scholarshipConsentText: string | null
  scholarshipDeadlineDays: number
  installmentEnabled: boolean
  installmentCount: number
  installmentPercents: number[]
  installmentReminderDays: number[]
  installmentOverdueRemoveDays: number
  installmentIntervalDays: number
  createdAt: string
  enrollmentCount: number
  scholarshipCount: number
  couponCount: number
}

export type CouponRow = {
  id: string
  code: string
  percentOff: number
  cohortId: string | null
  cohortName: string | null
  maxUses: number | null
  usedCount: number
  expiresAt: string | null
  isActive: boolean
  createdAt: string
}
