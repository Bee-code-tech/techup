"use client"

import { useEffect, useState } from "react"
import { PencilIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const fieldClass =
  "h-10 rounded-lg border border-black/10 bg-transparent px-3 text-sm shadow-none"

export function TitleForm({
  initialTitle,
  onSave,
}: {
  initialTitle: string
  onSave: (title: string) => Promise<void> | void
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(initialTitle)
  const [pending, setPending] = useState(false)

  useEffect(() => setValue(initialTitle), [initialTitle])

  async function submit() {
    if (!value.trim()) return
    setPending(true)
    try {
      await onSave(value.trim())
      setEditing(false)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="rounded-xl border border-black/10 p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[#001752]">Course title</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5"
          onClick={() => setEditing((v) => !v)}
        >
          {editing ? (
            <>
              <XIcon className="size-3.5" /> Cancel
            </>
          ) : (
            <>
              <PencilIcon className="size-3.5" /> Edit
            </>
          )}
        </Button>
      </div>
      {!editing ? (
        <p className="mt-2 text-lg font-medium text-[#001752]">
          {initialTitle || "Untitled course"}
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className={fieldClass}
            placeholder="e.g. HTML & CSS Foundations"
          />
          <Button
            type="button"
            size="sm"
            disabled={pending || value.trim().length < 2}
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

export function DescriptionForm({
  initialDescription,
  onSave,
}: {
  initialDescription: string
  onSave: (description: string) => Promise<void> | void
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(initialDescription)
  const [pending, setPending] = useState(false)

  useEffect(() => setValue(initialDescription), [initialDescription])

  async function submit() {
    setPending(true)
    try {
      await onSave(value.trim())
      setEditing(false)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="rounded-xl border border-black/10 p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[#001752]">Description</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5"
          onClick={() => setEditing((v) => !v)}
        >
          {editing ? (
            <>
              <XIcon className="size-3.5" /> Cancel
            </>
          ) : (
            <>
              <PencilIcon className="size-3.5" /> Edit
            </>
          )}
        </Button>
      </div>
      {!editing ? (
        <p
          className={cn(
            "mt-2 text-sm leading-relaxed",
            initialDescription
              ? "text-[#334155]"
              : "italic text-muted-foreground",
          )}
        >
          {initialDescription || "No description yet"}
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={5}
            className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-[#00206F]/40 focus-visible:ring-2 focus-visible:ring-[#00206F]/12"
            placeholder="What will students learn in this course?"
          />
          <Button
            type="button"
            size="sm"
            disabled={pending}
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
