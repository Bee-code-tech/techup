import crypto from "crypto"
import { afterEach, describe, expect, it } from "vitest"

import { verifyPaystackWebhookSignature } from "@/lib/paystack"

const ORIGINAL_SECRET = process.env.PAYSTACK_SECRET_KEY

function sign(body: string, secret: string) {
  return crypto.createHmac("sha512", secret).update(body).digest("hex")
}

afterEach(() => {
  if (ORIGINAL_SECRET === undefined) {
    delete process.env.PAYSTACK_SECRET_KEY
  } else {
    process.env.PAYSTACK_SECRET_KEY = ORIGINAL_SECRET
  }
})

describe("verifyPaystackWebhookSignature", () => {
  it("accepts a valid signature", () => {
    process.env.PAYSTACK_SECRET_KEY = "sk_test_secret"
    const body = '{"event":"charge.success","data":{"reference":"ref_123"}}'
    const signature = sign(body, "sk_test_secret")

    expect(verifyPaystackWebhookSignature(body, signature)).toBe(true)
  })

  it("rejects an invalid signature", () => {
    process.env.PAYSTACK_SECRET_KEY = "sk_test_secret"
    const body = '{"event":"charge.success","data":{"reference":"ref_123"}}'

    expect(verifyPaystackWebhookSignature(body, "bad-signature")).toBe(false)
  })

  it("rejects when secret is missing", () => {
    delete process.env.PAYSTACK_SECRET_KEY
    const body = '{"event":"charge.success"}'

    expect(verifyPaystackWebhookSignature(body, "anything")).toBe(false)
  })
})
