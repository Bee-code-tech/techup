"use client"

import { useState } from "react"
import toast from "react-hot-toast"

import type { Registration } from "@/components/admin/use-admin-dashboard"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function BroadcastPanel({
  registrations,
}: {
  registrations: Registration[]
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [pending, setPending] = useState(false)

  function toggleSelected(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    )
  }

  function toggleAll() {
    const ids = registrations.map((row) => row.id)
    const allSelected = ids.every((id) => selectedIds.includes(id))
    setSelectedIds(allSelected ? [] : ids)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)

    try {
      const response = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          message,
          recipientIds: selectedIds.length > 0 ? selectedIds : undefined,
        }),
      })
      const payload = (await response.json()) as {
        error?: string
        sent?: number
        failed?: number
      }

      if (!response.ok) {
        toast.error(payload.error || "Broadcast failed.")
        return
      }

      toast.success(
        `Sent to ${payload.sent ?? 0} student(s)${
          payload.failed ? ` · ${payload.failed} failed` : ""
        }.`,
      )
      setSubject("")
      setMessage("")
      setSelectedIds([])
    } catch {
      toast.error("Network error while sending broadcast.")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="grid gap-4 px-4 lg:grid-cols-[1fr_0.9fr] lg:px-6">
      <Card className="py-6 shadow-xs">
        <CardHeader className="gap-1.5">
          <CardTitle className="text-xl font-semibold tracking-tight">
            Send broadcast
          </CardTitle>
          <CardDescription className="text-[15px]">
            Email all students, or only the ones you select.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="subject" className="text-[15px]">
                  Subject
                </FieldLabel>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  required
                  className="h-11 px-3.5 text-[15px] md:text-[15px]"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="message" className="text-[15px]">
                  Message
                </FieldLabel>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  required
                  minLength={10}
                  rows={8}
                  className="px-3.5 py-3 text-[15px] md:text-[15px]"
                />
              </Field>
              <p className="text-[15px] text-muted-foreground">
                {selectedIds.length > 0
                  ? `${selectedIds.length} selected student(s) will receive this email.`
                  : `All ${registrations.length} registered student(s) will receive this email.`}
              </p>
              <Button type="submit" className="h-11 text-[15px]" disabled={pending}>
                {pending ? "Sending..." : "Send broadcast"}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <Card className="py-6 shadow-xs">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-xl font-semibold tracking-tight">
              Select recipients
            </CardTitle>
            <CardDescription className="text-[15px]">
              Leave empty to email everyone
            </CardDescription>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={toggleAll}>
            Toggle all
          </Button>
        </CardHeader>
        <CardContent>
          <div className="max-h-[32rem] space-y-2 overflow-y-auto">
            {registrations.map((row) => (
              <label
                key={row.id}
                className="flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-3 transition-colors hover:bg-muted/60"
              >
                <Checkbox
                  checked={selectedIds.includes(row.id)}
                  onCheckedChange={() => toggleSelected(row.id)}
                />
                <span>
                  <span className="block text-[15px] font-medium">{row.fullName}</span>
                  <span className="block text-sm text-muted-foreground">
                    {row.email}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
