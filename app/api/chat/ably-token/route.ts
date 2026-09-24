import { NextResponse } from "next/server"
import Ably from "ably"
import { isNextResponse, requireAnyAuth } from "@/lib/api-auth"
import { ablyApiKey, ablyConfigured } from "@/lib/ably"

/** Capability token for the signed-in user (Vercel-safe Ably auth). */
export async function GET() {
  const auth = await requireAnyAuth()
  if (isNextResponse(auth)) return auth

  if (!ablyConfigured()) {
    return NextResponse.json({
      ok: false,
      configured: false,
      error: "Realtime is not configured. Add ABLY_API_KEY.",
    })
  }

  const rest = new Ably.Rest({ key: ablyApiKey() })
  const tokenRequest = await rest.auth.createTokenRequest({
    clientId: auth.userId,
    capability: {
      [`chat:inbox:${auth.userId}`]: ["subscribe", "presence"],
      "chat:conversation:*": ["subscribe", "publish", "presence"],
      "live:session:*": ["subscribe", "publish", "presence"],
    },
  })

  return NextResponse.json({
    ok: true,
    configured: true,
    tokenRequest,
  })
}
