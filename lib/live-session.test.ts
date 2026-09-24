import { describe, expect, it } from "vitest"

import {
  audienceAllowsStudent,
  isAllowedLiveTrack,
  isInAppLive,
  formatLiveDuration,
  isLiveRoomPath,
  liveJoinHref,
  livePlatformLabel,
  liveSessionAllowsTrack,
  liveSessionChannel,
  liveSessionDurationMs,
  liveTrackLabel,
  liveTrackOptions,
  pickPreferredLiveSession,
} from "@/lib/live-session"

describe("live-session helpers", () => {
  it("keeps Zoom/Meet on their join URLs", () => {
    expect(
      liveJoinHref({
        id: "abc",
        platform: "zoom",
        joinUrl: "https://zoom.us/j/1",
      }),
    ).toBe("https://zoom.us/j/1")
    expect(isInAppLive("meet")).toBe(false)
    expect(livePlatformLabel("zoom")).toBe("Zoom")
  })

  it("routes in-app sessions to the classroom page", () => {
    expect(
      liveJoinHref({
        id: "64b1f0c8a1b2c3d4e5f60789",
        platform: "livekit",
        joinUrl: "https://unused.example",
      }),
    ).toBe("/dashboard/live/64b1f0c8a1b2c3d4e5f60789")
    expect(isInAppLive("livekit")).toBe(true)
    expect(livePlatformLabel("livekit")).toBe("TechUp classroom")
  })

  it("gates paid-only classes", () => {
    expect(audienceAllowsStudent("free", "paid")).toBe(false)
    expect(audienceAllowsStudent("paid", "paid")).toBe(true)
    expect(audienceAllowsStudent("free", "both")).toBe(true)
    expect(audienceAllowsStudent("paid", "free")).toBe(true)
  })

  it("recognizes classroom routes and chat channels", () => {
    expect(isLiveRoomPath("/dashboard/live/64b1f0c8a1b2c3d4e5f60789")).toBe(
      true,
    )
    expect(isLiveRoomPath("/dashboard/live/manage")).toBe(false)
    expect(liveSessionChannel("abc")).toBe("live:session:abc")
  })

  it("lets every track into an all-tracks class", () => {
    expect(liveSessionAllowsTrack("all", "frontend")).toBe(true)
    expect(liveSessionAllowsTrack("all", "backend")).toBe(true)
    expect(liveSessionAllowsTrack("frontend", "backend")).toBe(false)
    expect(liveSessionAllowsTrack("frontend", "frontend")).toBe(true)
    expect(liveTrackLabel("all")).toBe("All tracks")
    expect(isAllowedLiveTrack("all")).toBe(true)
    expect(isAllowedLiveTrack("backend")).toBe(true)
    expect(isAllowedLiveTrack("unknown")).toBe(false)
    expect(liveTrackOptions()[0]).toEqual({ id: "all", label: "All tracks" })
    expect(pickPreferredLiveSession(
      [
        { id: "1", track: "all" },
        { id: "2", track: "frontend" },
      ],
      "frontend",
    )?.id).toBe("2")
  })

  it("measures class length from start to end", () => {
    const now = new Date("2026-09-24T16:00:00.000Z")
    expect(
      liveSessionDurationMs({
        scheduledAt: "2026-09-24T15:00:00.000Z",
        endedAt: "2026-09-24T16:12:00.000Z",
      }),
    ).toBe(72 * 60_000)
    expect(
      formatLiveDuration(
        liveSessionDurationMs({
          scheduledAt: "2026-09-24T15:00:00.000Z",
          isActive: true,
          now,
        }),
      ),
    ).toBe("1 hr")
    expect(formatLiveDuration(null)).toBe("—")
    expect(formatLiveDuration(45 * 60_000)).toBe("45 min")
  })
})
