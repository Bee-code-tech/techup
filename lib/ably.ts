import Ably from "ably"

export function ablyApiKey() {
  return process.env.ABLY_API_KEY?.trim() || ""
}

export function ablyConfigured() {
  return Boolean(ablyApiKey())
}

export function getAblyRest() {
  const key = ablyApiKey()
  if (!key) return null
  return new Ably.Rest({ key })
}

export async function publishChatEvent(
  channels: string[],
  eventName: string,
  data: Record<string, unknown>,
) {
  const rest = getAblyRest()
  if (!rest) return { ok: false as const, skipped: true }

  try {
    await Promise.all(
      channels.map(async (name) => {
        const channel = rest.channels.get(name)
        await channel.publish(eventName, data)
      }),
    )
    return { ok: true as const, skipped: false }
  } catch (error) {
    console.error("[ably] publish failed", error)
    return { ok: false as const, skipped: false }
  }
}
