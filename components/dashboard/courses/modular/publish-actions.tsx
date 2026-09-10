"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function PublishActions({
  disabled,
  published,
  onPublish,
  onDelete,
}: {
  disabled: boolean
  published: boolean
  onPublish: () => Promise<void>
  onDelete: () => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(false)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (!open) {
      setVisible(false)
      return
    }
    const frame = window.requestAnimationFrame(() => setVisible(true))
    return () => window.cancelAnimationFrame(frame)
  }, [open])

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || pending}
        className="h-9 rounded-lg border-black/10 font-semibold"
        onClick={() => {
          setPending(true)
          void onPublish().finally(() => setPending(false))
        }}
      >
        {pending && !open ? "Working…" : published ? "Unpublish" : "Publish"}
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-9 text-muted-foreground hover:text-destructive"
        onClick={() => setOpen(true)}
      >
        <Trash2Icon className="size-4" />
      </Button>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <button
                type="button"
                aria-label="Close"
                className={cn(
                  "absolute inset-0 bg-[#001028]/50 transition-opacity",
                  visible ? "opacity-100" : "opacity-0",
                )}
                onClick={() => setOpen(false)}
              />
              <div
                role="dialog"
                className={cn(
                  "relative z-10 w-full max-w-sm rounded-xl border border-black/10 bg-white p-5 shadow-lg transition-[opacity,transform]",
                  visible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-2 opacity-0",
                )}
              >
                <h2 className="text-lg font-semibold text-[#001752]">
                  Delete this course?
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  This permanently deletes the course, modules, and quiz data.
                </p>
                <div className="mt-5 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={pending}
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={pending}
                    onClick={() => {
                      setPending(true)
                      void onDelete().finally(() => {
                        setPending(false)
                        setOpen(false)
                      })
                    }}
                  >
                    {pending ? "Deleting…" : "Delete"}
                  </Button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
