"use client"

import type { BroadcastRecord } from "@/components/admin/use-admin-dashboard"

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export function BroadcastHistory({
  broadcasts,
}: {
  broadcasts: BroadcastRecord[]
}) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-xs">
      <div className="border-b px-5 py-4 sm:px-6">
        <h2 className="text-base font-semibold tracking-tight">Sent emails</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Recent broadcasts from this dashboard.
        </p>
      </div>

      {broadcasts.length === 0 ? (
        <p className="px-5 py-8 text-sm text-muted-foreground sm:px-6">
          No emails sent yet.
        </p>
      ) : (
        <ul className="divide-y">
          {broadcasts.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-4 px-5 py-3.5 sm:px-6"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{item.subject}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatDate(item.createdAt)}
                </p>
              </div>
              <p className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {item.recipientCount} sent
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
