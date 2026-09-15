"use client"

import { SolarIcon } from "@/components/icons/solar-icon"

import { useEffect, useState } from "react"
import { Select } from "@/components/marketing/Select"
import { Button } from "@/components/ui/button"

export function TrackForm({
  initialTrack,
  tracks,
  onSave,
}: {
  initialTrack: string
  tracks: Array<{ id: string; label: string }>
  onSave: (track: string) => Promise<void> | void
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(initialTrack)
  const [pending, setPending] = useState(false)

  useEffect(() => setValue(initialTrack), [initialTrack])

  const label =
    tracks.find((track) => track.id === initialTrack)?.label || initialTrack

  async function submit() {
    setPending(true)
    try {
      await onSave(value)
      setEditing(false)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="rounded-xl border border-black/10 p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[#001752]">Bootcamp track</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5"
          onClick={() => setEditing((v) => !v)}
        >
          {editing ? (
            <>
              <SolarIcon name="close-circle" className="size-3.5" /> Cancel
            </>
          ) : (
            <>
              <SolarIcon name="pen" className="size-3.5" /> Edit
            </>
          )}
        </Button>
      </div>
      {!editing ? (
        <p className="mt-2 text-base font-medium text-[#001752]">{label}</p>
      ) : (
        <div className="mt-3 space-y-3">
          <Select
            value={value}
            onValueChange={setValue}
            options={tracks.map((track) => ({
              value: track.id,
              label: track.label,
            }))}
          />
          <Button
            type="button"
            size="sm"
            disabled={pending || !value}
            onClick={() => void submit()}
            className="rounded-lg bg-[#00206F] text-white hover:bg-[#001752]"
          >
            {pending ? "Saving…" : "Save"}
          </Button>
        </div>
      )}
    </div>
  )
}
