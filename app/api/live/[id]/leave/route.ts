import { NextResponse } from "next/server"

import { isNextResponse, requireAnyAuth } from "@/lib/api-auth"
import { markLiveLeave } from "@/lib/live-attendance"

export const runtime = "nodejs"

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(_request: Request, context: RouteContext) {
  const auth = await requireAnyAuth()
  if (isNextResponse(auth)) return auth
  const { id } = await context.params
  await markLiveLeave(id, auth.userId)
  return NextResponse.json({ ok: true })
}
