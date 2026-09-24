"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  LiveKitRoom,
  RoomAudioRenderer,
  StartAudio,
  VideoTrack,
  isTrackReference,
  useIsSpeaking,
  useLocalParticipant,
  useParticipants,
  useRoomContext,
  useTracks,
} from "@livekit/components-react"
import { RoomEvent, Track, type Participant } from "livekit-client"

import { LiveChat } from "@/components/dashboard/live/live-chat"
import {
  LivePresence,
  type PresenceStudent,
} from "@/components/dashboard/live/live-presence"
import { SolarIcon } from "@/components/icons/solar-icon"
import { LIVE_CLASS_CAP } from "@/lib/live-session"
import { cn } from "@/lib/utils"

const REACTIONS = ["👍", "❤️", "👏", "🎉", "😂"] as const

type Signal =
  | { type: "reaction"; emoji: string; userId: string; name: string; id: string }
  | { type: "hand"; userId: string; name: string; up: boolean }
  | { type: "speak"; userId: string; name: string; granted: boolean }

type RosterPerson = {
  id: string
  name: string
  email?: string
  avatarUrl?: string | null
  role?: string
}

function initials(name?: string) {
  const parts = String(name || "Guest")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
  return parts.map((part) => part[0]?.toUpperCase() || "").join("") || "G"
}

function participantMeta(participant: Participant) {
  try {
    return JSON.parse(participant.metadata || "{}") as {
      role?: string
      avatarUrl?: string
    }
  } catch {
    return {}
  }
}

function encodeSignal(signal: Signal) {
  return new TextEncoder().encode(JSON.stringify(signal))
}

function DockButton({
  active,
  danger,
  disabled,
  onClick,
  label,
  children,
}: {
  active?: boolean
  danger?: boolean
  disabled?: boolean
  onClick: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex min-w-14 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl px-2.5 py-2 transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.97] disabled:cursor-not-allowed disabled:active:scale-100",
        disabled
          ? "bg-white/8 text-white/55"
          : danger
            ? "bg-[#fff1e6] text-[#c05600]"
            : active
              ? "bg-white text-[#001752] shadow-[0_8px_20px_-12px_rgba(0,23,82,0.45)]"
              : "bg-white/12 text-white hover:bg-white/18",
      )}
    >
      {children}
      <span className="text-[10px] leading-none font-bold tracking-[0.04em]">
        {label}
      </span>
    </button>
  )
}

function Tile({
  participant,
  children,
  label,
}: {
  participant: Participant
  children: React.ReactNode
  label?: string
}) {
  const speaking = useIsSpeaking(participant)
  return (
    <div
      className={cn(
        "relative h-full overflow-hidden rounded-[28px] bg-[#07101f] transition-shadow duration-200 ease-out",
        speaking
          ? "shadow-[0_0_0_3px_rgba(251,120,1,0.85)]"
          : "shadow-[0_24px_60px_-36px_rgba(0,16,40,0.45)]",
      )}
    >
      {children}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent px-5 py-4">
        <p className="truncate text-sm font-medium text-white">
          {label || participant.name || "Guest"}
          {speaking ? " · speaking" : ""}
        </p>
      </div>
    </div>
  )
}

function ClassroomBody({
  sessionId,
  title,
  tutorName,
  isHost,
  userId,
  userName,
  userAvatar,
  onLeave,
  onEnd,
  ending,
  recordingStatus,
  recordingBusy,
  onStartRecording,
}: {
  sessionId: string
  title: string
  tutorName: string
  isHost: boolean
  userId: string
  userName: string
  userAvatar?: string | null
  onLeave: () => void
  onEnd?: () => void
  ending?: boolean
  recordingStatus?: string
  recordingBusy?: boolean
  onStartRecording?: () => void
}) {
  const room = useRoomContext()
  const participants = useParticipants()
  const {
    localParticipant,
    isMicrophoneEnabled,
    isCameraEnabled,
    isScreenShareEnabled,
  } = useLocalParticipant()
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: false },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: true },
  )
  const [sideOpen, setSideOpen] = useState(true)
  const [handUp, setHandUp] = useState(false)
  const [hands, setHands] = useState<Record<string, string>>({})
  const [speakers, setSpeakers] = useState<Record<string, string>>({})
  const [reactions, setReactions] = useState<
    Array<{ id: string; emoji: string; name: string }>
  >([])
  const [roster, setRoster] = useState<RosterPerson[]>([])
  const [endingLocal, setEndingLocal] = useState(false)
  const isEnding = ending || endingLocal

  useEffect(() => {
    const onData = (payload: Uint8Array) => {
      try {
        const signal = JSON.parse(new TextDecoder().decode(payload)) as Signal
        if (signal.type === "reaction") {
          setReactions((current) =>
            [...current, { id: signal.id, emoji: signal.emoji, name: signal.name }].slice(
              -8,
            ),
          )
          window.setTimeout(() => {
            setReactions((current) => current.filter((item) => item.id !== signal.id))
          }, 2400)
        }
        if (signal.type === "hand") {
          setHands((current) => {
            const next = { ...current }
            if (signal.up) next[signal.userId] = signal.name
            else delete next[signal.userId]
            return next
          })
        }
        if (signal.type === "speak") {
          setHands((current) => {
            const next = { ...current }
            delete next[signal.userId]
            return next
          })
          setSpeakers((current) => {
            const next = { ...current }
            if (signal.granted) next[signal.userId] = signal.name
            else delete next[signal.userId]
            return next
          })
          if (signal.userId === userId) {
            setHandUp(false)
            void localParticipant.setMicrophoneEnabled(signal.granted)
          }
        }
      } catch {
        /* ignore */
      }
    }
    room.on(RoomEvent.DataReceived, onData)
    return () => {
      room.off(RoomEvent.DataReceived, onData)
    }
  }, [localParticipant, room, userId])

  useEffect(() => {
    let cancelled = false
    const loadRoster = async () => {
      try {
        const response = await fetch(`/api/live/${sessionId}/roster`)
        const payload = (await response.json().catch(() => ({}))) as {
          joined?: RosterPerson[]
        }
        if (!response.ok || cancelled) return
        setRoster(payload.joined || [])
      } catch {
        /* keep last roster */
      }
    }
    void loadRoster()
    const timer = window.setInterval(() => void loadRoster(), 8000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [sessionId])

  const screenShare = tracks.find(
    (track) =>
      isTrackReference(track) && track.source === Track.Source.ScreenShare,
  )
  const hostCamera = tracks.find((track) => {
    if (!isTrackReference(track) || track.source !== Track.Source.Camera) {
      return false
    }
    return ["tutor", "admin"].includes(participantMeta(track.participant).role || "")
  })
  const fallbackCamera = tracks.find(
    (track) => isTrackReference(track) && track.source === Track.Source.Camera,
  )
  const main = screenShare || hostCamera || fallbackCamera

  const students = useMemo(() => {
    const map = new Map<string, PresenceStudent>()
    for (const person of roster) {
      if (person.role && person.role !== "student") continue
      map.set(person.id, {
        id: person.id,
        name: person.name,
        avatarUrl: person.avatarUrl,
        here: false,
        handUp: Boolean(hands[person.id]),
        speaking: Boolean(speakers[person.id]),
      })
    }
    for (const participant of participants) {
      const meta = participantMeta(participant)
      if (meta.role === "tutor" || meta.role === "admin") continue
      const existing = map.get(participant.identity)
      if (!existing && meta.role !== "student") continue
      map.set(participant.identity, {
        id: participant.identity,
        name: existing?.name || participant.name || "Student",
        avatarUrl: meta.avatarUrl || existing?.avatarUrl,
        here: true,
        handUp: Boolean(hands[participant.identity]),
        speaking: Boolean(speakers[participant.identity]),
      })
    }
    return [...map.values()].sort((a, b) => {
      if (a.handUp !== b.handUp) return a.handUp ? -1 : 1
      if (a.speaking !== b.speaking) return a.speaking ? -1 : 1
      if (a.here !== b.here) return a.here ? -1 : 1
      return a.name.localeCompare(b.name)
    })
  }, [hands, participants, roster, speakers])

  const raised = Object.entries(hands)
  const onMic = Object.entries(speakers)
  const canTalk = isHost || Boolean(speakers[userId])

  async function react(emoji: string) {
    const signal: Signal = {
      type: "reaction",
      emoji,
      userId,
      name: userName,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    }
    setReactions((current) =>
      [...current, { id: signal.id, emoji, name: userName }].slice(-8),
    )
    window.setTimeout(() => {
      setReactions((current) => current.filter((item) => item.id !== signal.id))
    }, 2400)
    await localParticipant.publishData(encodeSignal(signal), { reliable: true })
  }

  async function toggleHand() {
    const next = !handUp
    setHandUp(next)
    setHands((current) => {
      const copy = { ...current }
      if (next) copy[userId] = userName
      else delete copy[userId]
      return copy
    })
    await localParticipant.publishData(
      encodeSignal({
        type: "hand",
        userId,
        name: userName,
        up: next,
      }),
      { reliable: true },
    )
  }

  async function assignMic(targetId: string, targetName: string, granted: boolean) {
    if (!isHost) return
    setHands((current) => {
      const next = { ...current }
      delete next[targetId]
      return next
    })
    setSpeakers((current) => {
      const next = { ...current }
      if (granted) next[targetId] = targetName
      else delete next[targetId]
      return next
    })
    if (targetId === userId) {
      setHandUp(false)
      void localParticipant.setMicrophoneEnabled(granted)
    }
    await localParticipant.publishData(
      encodeSignal({
        type: "speak",
        userId: targetId,
        name: targetName,
        granted,
      }),
      { reliable: true },
    )
    if (granted) {
      await localParticipant.publishData(
        encodeSignal({
          type: "hand",
          userId: targetId,
          name: targetName,
          up: false,
        }),
        { reliable: true },
      )
    }
  }

  function leave() {
    if (isEnding) return
    void fetch(`/api/live/${sessionId}/leave`, { method: "POST" })
    room.disconnect()
    onLeave()
  }

  function requestEnd() {
    if (isEnding || !onEnd) return
    setEndingLocal(true)
    onEnd()
  }

  return (
    <div className="live-room relative flex h-dvh min-h-0 bg-[#e8edf6] text-[#0b1426]">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="relative min-h-0 flex-1 p-3 sm:p-4">
          <div className="relative h-full min-h-0">
            {main && isTrackReference(main) ? (
              <Tile
                participant={main.participant}
                label={
                  main.source === Track.Source.ScreenShare
                    ? `${main.participant.name || tutorName} · screen`
                    : main.participant.name || tutorName
                }
              >
                <VideoTrack
                  trackRef={main}
                  className="h-full w-full object-contain"
                />
              </Tile>
            ) : (
              <div className="flex h-full min-h-64 items-center justify-center overflow-hidden rounded-[28px] bg-[#07101f] shadow-[0_24px_60px_-36px_rgba(0,16,40,0.45)]">
                <div className="text-center">
                  <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-white/8 text-lg font-semibold text-white">
                    {initials(tutorName)}
                  </div>
                  <p className="mt-3 text-sm text-white/65">
                    Camera and mic start off. Turn them on when you’re ready.
                  </p>
                </div>
              </div>
            )}

            <div className="absolute inset-x-4 top-4 z-10 flex items-start justify-between gap-3">
              <div className="min-w-0 rounded-2xl bg-[#07101f]/72 px-3.5 py-2.5 text-white backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.16em] text-[#FB7801] uppercase">
                    <span className="size-1.5 rounded-full bg-[#FB7801]" />
                    Live
                  </span>
                  <span className="text-[11px] text-white/55">
                    {students.length}/{LIVE_CLASS_CAP}
                  </span>
                  {recordingStatus === "recording" ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-[0.14em] text-red-400 uppercase">
                      <span className="size-1.5 rounded-full bg-red-500" />
                      Rec
                    </span>
                  ) : null}
                </div>
                <h1 className="mt-0.5 truncate text-sm font-semibold sm:text-base">
                  {title}
                </h1>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSideOpen((current) => !current)}
                  className={cn(
                    "inline-flex size-10 cursor-pointer items-center justify-center rounded-full backdrop-blur-md transition-[transform,background-color] duration-150 ease-out active:scale-[0.97]",
                    sideOpen
                      ? "bg-white text-[#001752]"
                      : "bg-[#07101f]/72 text-white",
                  )}
                  aria-label={sideOpen ? "Hide chat" : "Show chat"}
                >
                  <SolarIcon name="chat-round-dots" className="size-4" />
                </button>
                {isHost && onEnd ? (
                  <button
                    type="button"
                    disabled={isEnding}
                    onClick={requestEnd}
                    className="inline-flex h-10 cursor-pointer items-center rounded-full bg-[#FB7801] px-4 text-sm font-semibold text-white transition-transform duration-150 ease-out active:scale-[0.97] disabled:cursor-wait disabled:opacity-70"
                  >
                    {isEnding ? "Ending…" : "End"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={leave}
                    className="inline-flex h-10 items-center rounded-full bg-[#07101f]/72 px-4 text-sm font-semibold text-white backdrop-blur-md transition-transform duration-150 ease-out active:scale-[0.97]"
                  >
                    Leave
                  </button>
                )}
              </div>
            </div>

            {raised.length > 0 || onMic.length > 0 ? (
              <div className="absolute inset-x-4 top-20 z-10 flex max-w-md flex-col gap-2">
                {raised.map(([id, name]) =>
                  isHost ? (
                    <button
                      key={id}
                      type="button"
                      onClick={() => void assignMic(id, name, true)}
                      className="flex cursor-pointer items-center gap-3 rounded-2xl bg-[#FB7801] px-4 py-3 text-left text-white shadow-[0_16px_40px_-20px_rgba(251,120,1,0.8)] transition-transform duration-150 ease-out active:scale-[0.98]"
                    >
                      <span className="text-3xl leading-none">✋</span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[11px] font-bold tracking-[0.14em] uppercase">
                          Wants to speak
                        </span>
                        <span className="mt-0.5 block truncate text-lg font-bold">
                          {name}
                        </span>
                      </span>
                      <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#c05600]">
                        Give mic
                      </span>
                    </button>
                  ) : (
                    <div
                      key={id}
                      className="flex items-center gap-3 rounded-2xl bg-[#FB7801] px-4 py-3 text-white"
                    >
                      <span className="text-3xl leading-none">✋</span>
                      <span className="min-w-0">
                        <span className="block text-[11px] font-bold tracking-[0.14em] uppercase">
                          Hand raised
                        </span>
                        <span className="mt-0.5 block truncate text-lg font-bold">
                          {id === userId ? "You" : name}
                        </span>
                      </span>
                    </div>
                  ),
                )}
                {onMic.map(([id, name]) =>
                  isHost ? (
                    <button
                      key={id}
                      type="button"
                      onClick={() => void assignMic(id, name, false)}
                      className="flex cursor-pointer items-center gap-3 rounded-2xl bg-[#0f3d2e] px-4 py-3 text-left text-white transition-transform duration-150 ease-out active:scale-[0.98]"
                    >
                      <SolarIcon name="microphone" className="size-6" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[11px] font-bold tracking-[0.14em] uppercase">
                          On mic
                        </span>
                        <span className="mt-0.5 block truncate text-lg font-bold">
                          {name}
                        </span>
                      </span>
                      <span className="rounded-full bg-white/12 px-3 py-1.5 text-xs font-bold">
                        Take mic
                      </span>
                    </button>
                  ) : (
                    <div
                      key={id}
                      className="flex items-center gap-3 rounded-2xl bg-[#0f3d2e] px-4 py-3 text-white"
                    >
                      <SolarIcon name="microphone" className="size-6" />
                      <span>
                        <span className="block text-[11px] font-bold tracking-[0.14em] uppercase">
                          On mic
                        </span>
                        <span className="mt-0.5 block text-lg font-bold">
                          {id === userId ? "You" : name}
                        </span>
                      </span>
                    </div>
                  ),
                )}
              </div>
            ) : null}

            <div className="pointer-events-none absolute inset-x-0 bottom-28 z-10 flex h-28 justify-center gap-3 overflow-hidden">
              {reactions.map((item) => (
                <span key={item.id} className="live-react text-4xl">
                  {item.emoji}
                </span>
              ))}
            </div>

            <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center px-3">
              <div className="flex flex-wrap items-end justify-center gap-1.5 rounded-[28px] bg-[#07101f]/78 px-2.5 py-2 backdrop-blur-md">
                <DockButton
                  label="Mic"
                  danger={canTalk && !isMicrophoneEnabled}
                  active={isMicrophoneEnabled}
                  disabled={!canTalk}
                  onClick={() =>
                    void localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)
                  }
                >
                  <SolarIcon name="microphone" className="size-6" />
                </DockButton>
                {isHost ? (
                  <>
                    <DockButton
                      label={isCameraEnabled ? "Camera" : "Cam off"}
                      active={isCameraEnabled}
                      onClick={() =>
                        void localParticipant.setCameraEnabled(!isCameraEnabled)
                      }
                    >
                      <SolarIcon name="videocamera" className="size-6" />
                    </DockButton>
                    <DockButton
                      label={isScreenShareEnabled ? "Sharing" : "Share"}
                      active={isScreenShareEnabled}
                      onClick={() =>
                        void localParticipant.setScreenShareEnabled(
                          !isScreenShareEnabled,
                        )
                      }
                    >
                      <SolarIcon name="laptop" className="size-6" />
                    </DockButton>
                    <DockButton
                      label={
                        recordingBusy
                          ? "Starting"
                          : recordingStatus === "recording"
                            ? "Recording"
                            : "Record"
                      }
                      danger={recordingStatus === "recording"}
                      active={recordingStatus === "recording"}
                      disabled={
                        recordingBusy || recordingStatus === "recording"
                      }
                      onClick={() => onStartRecording?.()}
                    >
                      <SolarIcon name="record" className="size-6" />
                    </DockButton>
                  </>
                ) : (
                  <DockButton
                    label={
                      speakers[userId]
                        ? "Approved"
                        : handUp
                          ? "Hand raised"
                          : "Speak"
                    }
                    active={handUp || Boolean(speakers[userId])}
                    disabled={Boolean(speakers[userId])}
                    onClick={() => void toggleHand()}
                  >
                    <span className="text-2xl leading-none">✋</span>
                  </DockButton>
                )}
                <div className="mx-1 mb-2 h-10 w-px bg-white/15" />
                <div className="flex items-center gap-0.5 pb-0.5">
                  {REACTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => void react(emoji)}
                      className="grid size-11 cursor-pointer place-items-center rounded-2xl text-xl transition-transform duration-150 ease-out hover:bg-white/10 active:scale-[0.97]"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <StartAudio
                  label="Sound"
                  className="inline-flex min-w-14 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl bg-[#00206F] px-2.5 py-2 text-[10px] font-bold text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <aside
        className={cn(
          "z-20 flex min-h-0 flex-col bg-white shadow-[-18px_0_40px_-28px_rgba(0,23,82,0.18)]",
          sideOpen
            ? "absolute inset-x-0 bottom-0 h-[min(58dvh,560px)] rounded-t-[28px] sm:relative sm:h-auto sm:w-90 sm:rounded-none"
            : "hidden",
        )}
      >
        {sideOpen ? (
          <>
            <div className="flex justify-center pt-2 sm:hidden">
              <span className="h-1 w-10 rounded-full bg-black/10" />
            </div>
            <LivePresence
              students={students}
              isHost={isHost}
              onGiveMic={(student) =>
                void assignMic(student.id, student.name, true)
              }
            />
            <div className="min-h-0 flex-1">
              <LiveChat
                sessionId={sessionId}
                userId={userId}
                userName={userName}
                userAvatar={userAvatar}
              />
            </div>
          </>
        ) : null}
      </aside>
      <RoomAudioRenderer />
      {isEnding ? (
        <div className="absolute inset-0 z-40 grid place-items-center bg-[#07101f]/62 backdrop-blur-xs">
          <div className="rounded-2xl bg-white px-6 py-5 text-center shadow-[0_24px_60px_-28px_rgba(0,16,40,0.5)]">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-[#FB7801] uppercase">
              Ending
            </p>
            <p className="mt-1 font-display text-lg font-semibold text-[#001752]">
              Closing the class…
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Saving attendance and the recording draft.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function LiveRoom({
  token,
  serverUrl,
  sessionId,
  title,
  tutorName,
  isHost,
  userId,
  userName,
  userAvatar,
  onLeave,
  onEnd,
  ending,
  recordingStatus,
  recordingBusy,
  onStartRecording,
}: {
  token: string
  serverUrl: string
  sessionId: string
  title: string
  tutorName: string
  isHost: boolean
  userId: string
  userName: string
  userAvatar?: string | null
  onLeave: () => void
  onEnd?: () => void
  ending?: boolean
  recordingStatus?: string
  recordingBusy?: boolean
  onStartRecording?: () => void
}) {
  const joined = useRef(false)
  const endingRef = useRef(false)
  const [connectError, setConnectError] = useState("")
  endingRef.current = Boolean(ending)

  if (connectError) {
    return (
      <div className="flex h-dvh items-center justify-center bg-[#e8edf6] px-6">
        <div className="w-full max-w-md rounded-2xl border border-black/8 bg-white p-6 text-center">
          <h2 className="text-lg font-semibold text-[#001752]">
            Couldn’t stay in class
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {connectError.includes("API key")
              ? "LiveKit rejected the API key. Paste the exact keys into .env and restart."
              : connectError}
          </p>
          <button
            type="button"
            onClick={onLeave}
            className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-[#00206F] px-4 text-sm font-semibold text-white"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connect
      audio={false}
      video={false}
      options={{ adaptiveStream: true, dynacast: true }}
      onConnected={() => {
        joined.current = true
      }}
      onError={(error) => {
        setConnectError(error.message || "Could not connect to the classroom.")
      }}
      onDisconnected={() => {
        if (endingRef.current) return
        if (joined.current) {
          void fetch(`/api/live/${sessionId}/leave`, { method: "POST" })
          onLeave()
        }
      }}
      className="h-dvh"
    >
      <ClassroomBody
        sessionId={sessionId}
        title={title}
        tutorName={tutorName}
        isHost={isHost}
        userId={userId}
        userName={userName}
        userAvatar={userAvatar}
        onLeave={onLeave}
        onEnd={onEnd}
        ending={ending}
        recordingStatus={recordingStatus}
        recordingBusy={recordingBusy}
        onStartRecording={onStartRecording}
      />
    </LiveKitRoom>
  )
}
