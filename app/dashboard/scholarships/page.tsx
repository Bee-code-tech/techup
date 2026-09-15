"use client"

import { useCallback, useEffect, useState } from "react"
import toast from "react-hot-toast"

import {
  ScholarshipsStatCards,
  type ScholarshipStats,
} from "@/components/dashboard/scholarships/scholarships-stat-cards"
import {
  ScholarshipsTable,
  type ScholarshipRow,
} from "@/components/dashboard/scholarships/scholarships-table"
import { StatCardsSkeleton } from "@/components/dashboard/page-skeletons"

export default function ScholarshipsPage() {
  const [stats, setStats] = useState<ScholarshipStats | null>(null)
  const [rows, setRows] = useState<ScholarshipRow[]>([])
  const [page, setPage] = useState(1)
  const [pageCount, setPageCount] = useState(1)
  const [total, setTotal] = useState(0)
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(true)
  const pageSize = 20

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim())
      setPage(1)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [query])

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true)
      try {
        const params = new URLSearchParams({
          page: String(page),
          pageSize: String(pageSize),
        })
        if (debouncedQuery) params.set("q", debouncedQuery)
        if (status) params.set("status", status)

        const response = await fetch(
          `/api/admin/scholarships?${params.toString()}`,
        )
        const payload = (await response.json()) as {
          stats?: ScholarshipStats
          rows?: ScholarshipRow[]
          page?: number
          pageCount?: number
          total?: number
          error?: string
        }
        if (!response.ok) {
          if (!silent) {
            toast.error(payload.error || "Could not load scholarships.")
          }
          return
        }
        setStats(payload.stats || null)
        setRows(payload.rows || [])
        setPageCount(payload.pageCount || 1)
        setTotal(payload.total || 0)
      } catch {
        if (!silent) toast.error("Network error while loading scholarships.")
      } finally {
        setLoading(false)
      }
    },
    [debouncedQuery, page, pageSize, status],
  )

  useEffect(() => {
    void load(false)
  }, [load])

  return (
    <div className="flex flex-col gap-6 py-6 md:py-8">
      <div className="px-4 lg:px-6">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-[#FB7801] uppercase">
          Admin
        </p>
        <h1 className="mt-1 text-[1.65rem] font-semibold tracking-tight text-[#001752]">
          Scholarships
        </h1>
        <p className="mt-1.5 max-w-2xl text-[14.5px] leading-relaxed text-muted-foreground">
          Review awards, track remnant payments, and revoke access when needed.
        </p>
      </div>
      {loading && !stats ? (
        <StatCardsSkeleton count={4} />
      ) : (
        <ScholarshipsStatCards stats={stats} loading={loading} />
      )}
      <ScholarshipsTable
        rows={rows}
        page={page}
        pageSize={pageSize}
        pageCount={pageCount}
        total={total}
        query={query}
        status={status}
        loading={loading}
        onQueryChange={setQuery}
        onStatusChange={(value) => {
          setStatus(value)
          setPage(1)
        }}
        onPageChange={setPage}
        onChanged={() => void load(true)}
      />
    </div>
  )
}
