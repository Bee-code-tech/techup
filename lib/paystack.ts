import crypto from "crypto"

const PAYSTACK_BASE = "https://api.paystack.co"

export function paystackSecret() {
  return process.env.PAYSTACK_SECRET_KEY?.trim() || ""
}

export function appOrigin() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    process.env.APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  )
}

export async function initializePaystack(options: {
  email: string
  amountKobo: number
  reference: string
  callbackUrl: string
  metadata?: Record<string, unknown>
}) {
  const secret = paystackSecret()
  if (!secret) {
    return {
      ok: false as const,
      error: "Paystack is not configured. Add PAYSTACK_SECRET_KEY.",
      status: 503,
    }
  }

  const response = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: options.email,
      amount: options.amountKobo,
      reference: options.reference,
      callback_url: options.callbackUrl,
      currency: "NGN",
      metadata: options.metadata,
    }),
  })

  const payload = (await response.json()) as {
    status?: boolean
    message?: string
    data?: { authorization_url?: string; reference?: string }
  }

  if (!response.ok || !payload.status || !payload.data?.authorization_url) {
    return {
      ok: false as const,
      error: payload.message || "Could not start Paystack checkout.",
      status: 502,
    }
  }

  return {
    ok: true as const,
    authorizationUrl: payload.data.authorization_url,
    reference: payload.data.reference || options.reference,
  }
}

export async function verifyPaystack(reference: string) {
  const secret = paystackSecret()
  if (!secret) {
    return { ok: false as const, error: "Paystack is not configured.", status: 503 }
  }

  const response = await fetch(
    `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${secret}` },
    },
  )
  const payload = (await response.json()) as {
    status?: boolean
    message?: string
    data?: {
      status?: string
      amount?: number
      reference?: string
      currency?: string
    }
  }

  if (!response.ok || !payload.status || !payload.data) {
    return {
      ok: false as const,
      error: payload.message || "Could not verify payment.",
      status: 502,
    }
  }

  return {
    ok: true as const,
    data: payload.data,
  }
}

/** Validates Paystack webhook `x-paystack-signature` against the raw request body. */
export function verifyPaystackWebhookSignature(
  rawBody: string,
  signature: string | null | undefined,
) {
  const secret = paystackSecret()
  if (!secret || !signature) return false

  const hash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex")
  const expected = Buffer.from(hash, "utf8")
  const received = Buffer.from(signature, "utf8")
  if (expected.length !== received.length) return false

  return crypto.timingSafeEqual(expected, received)
}
