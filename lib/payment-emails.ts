import { getResendConfig, resendErrorMessage } from "@/lib/resend-client"
import {
  emailPrimaryButton,
  emailShell,
  escapeHtml,
  escapeHtmlWithBreaks,
} from "@/lib/email-shell"
import { formatNgnFromKobo } from "@/lib/cohort-pricing"
import { site } from "@/lib/site"

function appOrigin() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    process.env.APP_URL?.replace(/\/$/, "") ||
    site.url
  )
}

export async function sendScholarshipAwardEmail(options: {
  to: string
  fullName: string
  cohortName: string
  amountDueKobo: number
  percentOff: number
  payDeadline: Date | null
  hasAccount: boolean
}) {
  const config = getResendConfig()
  if (!config.ok) return { ok: false as const, error: config.error }

  const origin = appOrigin()
  const ctaHref = options.hasAccount
    ? `${origin}/dashboard`
    : `${origin}/auth?mode=register&email=${encodeURIComponent(options.to)}`
  const ctaLabel = options.hasAccount
    ? "Go to dashboard"
    : "Create your account"
  const deadline = options.payDeadline
    ? options.payDeadline.toLocaleDateString("en-NG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null

  const html = emailShell({
    title: "Scholarship awarded — TechUp Academy",
    eyebrow: "Scholarship",
    heading: `Congratulations, ${options.fullName.split(" ")[0]}!`,
    subheading: `You've been awarded a scholarship for ${options.cohortName}.`,
    body: `
      <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#5B6475;">
        Your scholarship covers <strong>${options.percentOff}%</strong> of the cohort fee.
        Amount due: <strong>${escapeHtml(formatNgnFromKobo(options.amountDueKobo))}</strong>.
        ${deadline ? `Please complete payment by <strong>${escapeHtml(deadline)}</strong> to keep your scholarship.` : ""}
      </p>
      <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#5B6475;">
        ${
          options.hasAccount
            ? "Sign in to your TechUp account to pay the remaining balance and unlock full access."
            : "Create a TechUp account with this email to claim your scholarship and unlock full access."
        }
      </p>
      ${emailPrimaryButton(ctaHref, ctaLabel)}
    `,
  })

  try {
    await config.resend.emails.send({
      from: config.from,
      to: options.to,
      subject: `Scholarship awarded — ${options.cohortName}`,
      html,
    })
    return { ok: true as const }
  } catch (error) {
    return { ok: false as const, error: resendErrorMessage(error) }
  }
}

export async function sendInstallmentReminderEmail(options: {
  to: string
  fullName: string
  cohortName: string
  amountKobo: number
  dueAt: Date
  daysBefore: number
}) {
  const config = getResendConfig()
  if (!config.ok) return { ok: false as const, error: config.error }

  const due = options.dueAt.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  const html = emailShell({
    title: "Installment reminder — TechUp Academy",
    eyebrow: "Payment reminder",
    heading: `Hi ${options.fullName.split(" ")[0]},`,
    body: `
      <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#5B6475;">
        Reminder: your ${escapeHtml(options.cohortName)} installment of
        <strong>${escapeHtml(formatNgnFromKobo(options.amountKobo))}</strong>
        is due ${options.daysBefore === 0 ? "today" : `in ${options.daysBefore} day${options.daysBefore === 1 ? "" : "s"}`}
        (${escapeHtml(due)}).
      </p>
      ${emailPrimaryButton(`${appOrigin()}/dashboard`, "Pay now")}
    `,
  })

  try {
    await config.resend.emails.send({
      from: config.from,
      to: options.to,
      subject: `Installment reminder — ${options.cohortName}`,
      html,
    })
    return { ok: true as const }
  } catch (error) {
    return { ok: false as const, error: resendErrorMessage(error) }
  }
}

export async function sendScholarshipRevokedEmail(options: {
  to: string
  fullName: string
  cohortName: string
  reason: string
}) {
  const config = getResendConfig()
  if (!config.ok) return { ok: false as const, error: config.error }

  const html = emailShell({
    title: "Scholarship update — TechUp Academy",
    eyebrow: "Scholarship",
    heading: `Hi ${options.fullName.split(" ")[0]},`,
    body: `
      <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#5B6475;">
        ${escapeHtmlWithBreaks(options.reason)}
      </p>
      <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#5B6475;">
        Your access for <strong>${escapeHtml(options.cohortName)}</strong> has been set back to free.
        You can still join with full or installment payment.
      </p>
      ${emailPrimaryButton(`${appOrigin()}/dashboard`, "Open dashboard")}
    `,
  })

  try {
    await config.resend.emails.send({
      from: config.from,
      to: options.to,
      subject: `Scholarship update — ${options.cohortName}`,
      html,
    })
    return { ok: true as const }
  } catch (error) {
    return { ok: false as const, error: resendErrorMessage(error) }
  }
}
