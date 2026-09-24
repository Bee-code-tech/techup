/**
 * Clean Phase 2 check: attendance + record → recap.
 *
 * Creates a throwaway class, logs a join, starts/stops LiveKit egress,
 * waits for the Tigris file, then deletes the session.
 *
 *   npx tsx --env-file=.env scripts/live-phase2-test.ts
 */
import { HeadObjectCommand } from "@aws-sdk/client-s3"

import { db } from "@/lib/db"
import { markLiveJoin, markLiveLeave } from "@/lib/live-attendance"
import { LIVEKIT_PLATFORM } from "@/lib/live-session"
import {
  closeLiveRoom,
  ensureLiveRoom,
  liveRecordingKey,
  liveRecordingUrl,
  livekitConfigured,
  startLiveRecording,
  stopLiveRecording,
} from "@/lib/livekit"
import { getTigrisClient } from "@/lib/tigris"

const RECORD_WAIT_MS = 8_000
const FILE_TIMEOUT_MS = 90_000

type Check = { name: string; ok: boolean; detail: string }

function log(line: string) {
  console.log(line)
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitForRecordingFile(url: string, key: string) {
  const storage = getTigrisClient()
  const started = Date.now()
  let last = "not checked"

  while (Date.now() - started < FILE_TIMEOUT_MS) {
    if (storage.ok) {
      try {
        const head = await storage.client.send(
          new HeadObjectCommand({
            Bucket: storage.config.bucket,
            Key: key,
          }),
        )
        const bytes = Number(head.ContentLength || 0)
        if (bytes > 0) {
          return { ok: true as const, bytes, via: "tigris" }
        }
        last = `Tigris object is ${bytes} bytes`
      } catch (error) {
        last =
          error instanceof Error ? error.message : "Tigris HeadObject failed"
      }
    }

    try {
      const response = await fetch(url, { method: "HEAD" })
      const length = Number(response.headers.get("content-length") || 0)
      if (response.ok && length > 0) {
        return { ok: true as const, bytes: length, via: "public url" }
      }
      last = `public HEAD ${response.status} (${length} bytes)`
    } catch (error) {
      last = error instanceof Error ? error.message : "public HEAD failed"
    }

    await sleep(4_000)
  }

  return { ok: false as const, bytes: 0, via: last }
}

async function main() {
  const checks: Check[] = []
  const tigris = getTigrisClient()

  checks.push({
    name: "LiveKit keys",
    ok: livekitConfigured(),
    detail: livekitConfigured()
      ? "LIVEKIT_URL / API_KEY / API_SECRET are set"
      : "Missing LIVEKIT_URL, LIVEKIT_API_KEY, or LIVEKIT_API_SECRET",
  })
  checks.push({
    name: "Tigris storage",
    ok: tigris.ok,
    detail: tigris.ok ? "Bucket credentials are set" : tigris.error,
  })

  if (!livekitConfigured() || !tigris.ok) {
    printReport(checks)
    process.exitCode = 1
    return
  }

  const tutor = await db.user.findFirst({
    where: { role: { in: ["tutor", "admin"] } },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, role: true, track: true },
  })
  if (!tutor) {
    checks.push({
      name: "Tutor account",
      ok: false,
      detail: "No tutor or admin user in the database",
    })
    printReport(checks)
    process.exitCode = 1
    return
  }

  const track = tutor.track || "frontend"
  const student = await db.user.findFirst({
    where: { role: "student", track, id: { not: tutor.id } },
    select: { id: true, name: true },
  })

  const created = await db.liveSession.create({
    data: {
      track,
      tutorId: tutor.id,
      title: `Phase 2 test · ${new Date().toISOString().slice(11, 19)}`,
      platform: LIVEKIT_PLATFORM,
      joinUrl: "in-app",
      audience: "both",
      scheduledAt: new Date(),
      isActive: true,
      endedAt: null,
    },
  })
  const session = await db.liveSession.update({
    where: { id: created.id },
    data: { joinUrl: `/dashboard/live/${created.id}` },
  })

  log(`Session ${session.id}`)
  log(`Tutor   ${tutor.name} (${tutor.role})`)
  if (student) log(`Student ${student.name}`)

  try {
    await ensureLiveRoom(session.id)
    checks.push({
      name: "Create LiveKit room",
      ok: true,
      detail: `techup-live-${session.id}`,
    })

    await markLiveJoin({
      sessionId: session.id,
      userId: tutor.id,
      role: tutor.role,
    })
    if (student) {
      await markLiveJoin({
        sessionId: session.id,
        userId: student.id,
        role: "student",
      })
      await markLiveLeave(session.id, student.id)
    }

    const attendance = await db.liveAttendance.findMany({
      where: { sessionId: session.id },
    })
    const studentJoin = attendance.find((row) => row.role === "student")
    checks.push({
      name: "Attendance join + leave",
      ok: Boolean(student ? studentJoin?.leftAt : attendance.length > 0),
      detail: student
        ? studentJoin?.leftAt
          ? `${student.name} joined then left`
          : "Student join was not stored"
        : `Tutor join stored (${attendance.length} row)`,
    })

    const recording = await startLiveRecording(session.id)
    if (!recording.ok) {
      checks.push({
        name: "Start recording",
        ok: false,
        detail: recording.error,
      })
    } else {
      await db.liveSession.update({
        where: { id: session.id },
        data: {
          recordingStatus: "recording",
          egressId: recording.egressId,
          recordingKey: recording.key,
          recordingUrl: recording.url,
        },
      })
      checks.push({
        name: "Start recording",
        ok: true,
        detail: "Egress accepted",
      })

      log(`Recording for ${RECORD_WAIT_MS / 1000}s…`)
      await sleep(RECORD_WAIT_MS)

      const stopped = await stopLiveRecording(recording.egressId)
      checks.push({
        name: "Stop recording",
        ok: stopped.ok,
        detail: stopped.ok
          ? "Egress stopped"
          : stopped.error || "LiveKit did not confirm stop",
      })

      await db.liveSession.update({
        where: { id: session.id },
        data: {
          isActive: false,
          endedAt: new Date(),
          recordingStatus: stopped.ok ? "ready" : "failed",
        },
      })
      await closeLiveRoom(session.id)

      if (stopped.ok) {
        const file = await waitForRecordingFile(recording.url, recording.key)
        checks.push({
          name: "Recording file on Tigris",
          ok: file.ok,
          detail: file.ok
            ? `${file.bytes} bytes via ${file.via}`
            : `Timed out: ${file.via}`,
        })
      } else {
        checks.push({
          name: "Recording file on Tigris",
          ok: false,
          detail:
            "Skipped file wait — LiveKit aborted egress. A participant must be in the room.",
        })
      }
    }

    const recap = await db.liveSession.findUnique({
      where: { id: session.id },
    })
    const joinedStudents = await db.liveAttendance.count({
      where: { sessionId: session.id, role: "student" },
    })
    checks.push({
      name: "Recap can show who attended",
      ok: joinedStudents > 0 || !student,
      detail: student
        ? `${joinedStudents} student on the roster`
        : "No student on this track to mark present",
    })
    checks.push({
      name: "Recap recording fields",
      ok: Boolean(recap?.recordingUrl) && recap?.recordingStatus === "ready",
      detail: recap
        ? `status=${recap.recordingStatus}`
        : "Session missing after end",
    })
  } finally {
    await closeLiveRoom(session.id).catch(() => undefined)
    await db.liveAttendance.deleteMany({ where: { sessionId: session.id } })
    await db.liveSession.delete({ where: { id: session.id } }).catch(() => undefined)
    await db.$disconnect()
  }

  const failed = printReport(checks)
  process.exitCode = failed ? 1 : 0
}

function printReport(checks: Check[]) {
  log("")
  log("Phase 2 test")
  log("------------")
  for (const check of checks) {
    log(`${check.ok ? "PASS" : "FAIL"}  ${check.name} — ${check.detail}`)
  }
  const failed = checks.some((check) => !check.ok)
  log("")
  log(failed ? "Result: not clean yet." : "Result: clean.")
  return failed
}

void main().catch(async (error) => {
  console.error(error instanceof Error ? error.message : error)
  await db.$disconnect().catch(() => undefined)
  process.exitCode = 1
})
