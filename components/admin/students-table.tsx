"use client"

import { useMemo, useState } from "react"
import { ChevronDownIcon, SearchIcon } from "lucide-react"

import type { Registration } from "@/components/admin/use-admin-dashboard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

function whatsappHref(value: string) {
  const digits = value.replace(/\D/g, "")
  return digits ? `https://wa.me/${digits}` : undefined
}

export function StudentsTable({
  registrations,
}: {
  registrations: Registration[]
}) {
  const [query, setQuery] = useState("")
  const [trackFilter, setTrackFilter] = useState("all")

  const tracks = useMemo(
    () =>
      Array.from(new Set(registrations.map((row) => row.track))).map((track) => ({
        track,
        label:
          registrations.find((row) => row.track === track)?.trackLabel ?? track,
      })),
    [registrations],
  )

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return registrations.filter((row) => {
      const matchesTrack = trackFilter === "all" || row.track === trackFilter
      const matchesQuery =
        normalized.length === 0 ||
        row.fullName.toLowerCase().includes(normalized) ||
        row.email.toLowerCase().includes(normalized) ||
        row.whatsapp.includes(normalized) ||
        row.trackLabel.toLowerCase().includes(normalized)
      return matchesTrack && matchesQuery
    })
  }, [query, registrations, trackFilter])

  const trackLabel =
    trackFilter === "all"
      ? "All tracks"
      : (tracks.find((track) => track.track === trackFilter)?.label ??
        "All tracks")

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Registered students
          </h2>
          <p className="text-[15px] text-muted-foreground">
            {filtered.length} of {registrations.length} shown
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, email, WhatsApp, or track"
            className="h-11 px-3.5 pl-10 text-[15px] md:text-[15px]"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                className="h-11 w-full justify-between px-3.5 text-[15px] font-normal sm:w-56"
              />
            }
          >
            <span className="truncate">{trackLabel}</span>
            <ChevronDownIcon className="size-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-56">
            <DropdownMenuRadioGroup
              value={trackFilter}
              onValueChange={(value) => {
                if (value) setTrackFilter(value)
              }}
            >
              <DropdownMenuRadioItem value="all" className="text-[15px]">
                All tracks
              </DropdownMenuRadioItem>
              {tracks.map((track) => (
                <DropdownMenuRadioItem
                  key={track.track}
                  value={track.track}
                  className="text-[15px]"
                >
                  {track.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-xs">
        <Table>
          <TableHeader className="bg-muted/70">
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-12 w-16 px-4 text-[13px] font-semibold tracking-wide text-muted-foreground uppercase">
                S/N
              </TableHead>
              <TableHead className="h-12 px-4 text-[13px] font-semibold tracking-wide text-muted-foreground uppercase">
                Student
              </TableHead>
              <TableHead className="h-12 px-4 text-[13px] font-semibold tracking-wide text-muted-foreground uppercase">
                Track
              </TableHead>
              <TableHead className="h-12 px-4 text-[13px] font-semibold tracking-wide text-muted-foreground uppercase">
                WhatsApp
              </TableHead>
              <TableHead className="h-12 px-4 text-[13px] font-semibold tracking-wide text-muted-foreground uppercase">
                Education
              </TableHead>
              <TableHead className="h-12 px-4 text-[13px] font-semibold tracking-wide text-muted-foreground uppercase">
                Registered
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={6}
                  className="h-28 text-center text-[15px] text-muted-foreground"
                >
                  No registrations match your filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((row, index) => {
                const href = whatsappHref(row.whatsapp)
                return (
                  <TableRow key={row.id} className="hover:bg-muted/40">
                    <TableCell className="px-4 py-4 font-medium tabular-nums text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-semibold text-white">
                          {initials(row.fullName)}
                        </span>
                        <span>
                          <span className="block text-[15px] font-medium">
                            {row.fullName}
                          </span>
                          <span className="block text-sm text-muted-foreground">
                            {row.email}
                          </span>
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <Badge
                        variant="secondary"
                        className="h-auto rounded-full px-2.5 py-1 text-xs font-medium whitespace-normal"
                      >
                        {row.trackLabel}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-[15px]">
                      {href ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="text-navy underline-offset-4 hover:underline"
                        >
                          {row.whatsapp}
                        </a>
                      ) : (
                        row.whatsapp
                      )}
                    </TableCell>
                    <TableCell className="max-w-48 px-4 py-4 text-[15px] whitespace-normal text-muted-foreground">
                      {row.education}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-[15px] whitespace-nowrap text-muted-foreground">
                      {formatDate(row.createdAt)}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
