"use client"

import { useMemo, useState } from "react"
import { ChevronDownIcon } from "lucide-react"

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search name, email, WhatsApp, or track"
          className="h-11 px-3.5 text-[15px] md:text-[15px] sm:flex-1"
        />
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
      <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="h-12 text-[15px]">Student</TableHead>
              <TableHead className="h-12 text-[15px]">Track</TableHead>
              <TableHead className="h-12 text-[15px]">WhatsApp</TableHead>
              <TableHead className="h-12 text-[15px]">Education</TableHead>
              <TableHead className="h-12 text-[15px]">Registered</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  No registrations match your filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="py-3.5">
                    <div className="text-[15px] font-medium">{row.fullName}</div>
                    <div className="text-sm text-muted-foreground">{row.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-sm">
                      {row.trackLabel}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[15px]">{row.whatsapp}</TableCell>
                  <TableCell className="text-[15px]">{row.education}</TableCell>
                  <TableCell className="whitespace-nowrap text-[15px]">
                    {formatDate(row.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
