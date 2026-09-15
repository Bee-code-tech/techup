"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toPng } from "html-to-image"
import { jsPDF } from "jspdf"
import toast from "react-hot-toast"

import {
  CertificateCanvas,
  type CertificateData,
} from "@/components/dashboard/certificates/certificate-canvas"
import { SolarIcon } from "@/components/icons/solar-icon"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type CourseCertificateItem = {
  courseId: string
  courseTitle: string
  progress: { passed: number; total: number }
  complete: boolean
  certificate: CertificateData | null
}

type ApiPayload = {
  earnedCount?: number
  totalCourses?: number
  courses?: CourseCertificateItem[]
  error?: string
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a")
  link.download = filename
  link.href = dataUrl
  link.click()
}

export function CertificatesPanel() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState<"png" | "pdf" | null>(null)
  const [courses, setCourses] = useState<CourseCertificateItem[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/student/certificates")
      const payload = (await response.json().catch(() => ({}))) as ApiPayload
      if (!response.ok) {
        toast.error(payload.error || "Could not load certificates.")
        return
      }

      const rows = payload.courses || []
      setCourses(rows)
      setSelectedCourseId((current) => {
        if (current && rows.some((row) => row.courseId === current)) {
          return current
        }
        return (
          rows.find((row) => row.certificate)?.courseId ??
          rows[0]?.courseId ??
          null
        )
      })
    } catch {
      toast.error("Network error while loading certificates.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const selected = useMemo(
    () => courses.find((row) => row.courseId === selectedCourseId) ?? null,
    [courses, selectedCourseId],
  )
  const certificate = selected?.certificate ?? null
  const earnedCount = courses.filter((row) => row.certificate).length

  const capturePng = useCallback(async () => {
    const node = canvasRef.current
    if (!node) throw new Error("Certificate not ready")
    return toPng(node, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#f7f4ee",
    })
  }, [])

  const handleDownloadPng = useCallback(async () => {
    if (!certificate) return
    setExporting("png")
    try {
      const dataUrl = await capturePng()
      downloadDataUrl(
        dataUrl,
        `techup-certificate-${certificate.code}.png`,
      )
      toast.success("PNG downloaded.")
    } catch {
      toast.error("Could not export PNG.")
    } finally {
      setExporting(null)
    }
  }, [capturePng, certificate])

  const handleDownloadPdf = useCallback(async () => {
    if (!certificate) return
    setExporting("pdf")
    try {
      const dataUrl = await capturePng()
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [1123, 794],
        hotfixes: ["px_scaling"],
      })
      pdf.addImage(dataUrl, "PNG", 0, 0, 1123, 794)
      pdf.save(`techup-certificate-${certificate.code}.pdf`)
      toast.success("PDF downloaded.")
    } catch {
      toast.error("Could not export PDF.")
    } finally {
      setExporting(null)
    }
  }, [capturePng, certificate])

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6 md:py-8">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.14em] text-[#FB7801] uppercase">
          Achievement
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#001752]">
          Certificates
        </h2>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Earn a certificate for each course you complete. Finish every module
          quiz in a course to unlock its certificate.
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-black/8 bg-white px-5 py-12 text-sm text-muted-foreground">
          Loading certificates…
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-2xl border border-black/8 bg-white px-5 py-12 text-center">
          <SolarIcon
            name="diploma"
            className="mx-auto size-8 text-[#00206F]/35"
          />
          <p className="mt-3 text-sm font-medium text-[#001752]">
            No published courses yet
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Certificates appear here once courses are published in your track.
          </p>
          <Link
            href="/dashboard/learn"
            className="admin-press mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-[#00206F] px-4 text-sm font-semibold text-white hover:bg-[#001752]"
          >
            Go to learning
            <SolarIcon name="alt-arrow-right" className="size-4" />
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {courses.map((row) => {
              const pct =
                row.progress.total > 0
                  ? Math.min(
                      100,
                      Math.round(
                        (row.progress.passed / row.progress.total) * 100,
                      ),
                    )
                  : 0
              const earned = Boolean(row.certificate)
              const active = row.courseId === selectedCourseId

              return (
                <button
                  key={row.courseId}
                  type="button"
                  onClick={() => setSelectedCourseId(row.courseId)}
                  className={cn(
                    "admin-press rounded-2xl border bg-white p-4 text-left transition-[border-color,box-shadow,transform] duration-150",
                    active
                      ? "border-[#00206F]/25 shadow-[0_0_0_3px_rgba(0,32,111,0.08)]"
                      : "border-black/8 hover:border-[#00206F]/15",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-semibold text-[#001752]">
                        {row.courseTitle}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {row.progress.passed}/{row.progress.total} modules
                        passed
                      </p>
                    </div>
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-xl",
                        earned
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-[#eef2f9] text-[#00206F]",
                      )}
                    >
                      <SolarIcon
                        name={earned ? "diploma" : "lock-keyhole"}
                        className="size-4"
                      />
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="mb-1.5 flex items-center justify-between text-[11px]">
                      <span
                        className={cn(
                          "font-semibold uppercase tracking-[0.12em]",
                          earned ? "text-emerald-700" : "text-[#00206F]/55",
                        )}
                      >
                        {earned ? "Earned" : "In progress"}
                      </span>
                      <span className="tabular-nums text-muted-foreground">
                        {pct}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#eef2f9]">
                      <div
                        className={cn(
                          "h-full rounded-full transition-[width] duration-500",
                          earned ? "bg-emerald-500" : "bg-[#00206F]",
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {selected && certificate ? (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-4 rounded-2xl border border-[#00206F]/12 bg-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#00206F] text-white">
                    <SolarIcon name="diploma" className="size-5 text-white" />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold tracking-[0.14em] text-[#FB7801] uppercase">
                      Course certificate
                    </p>
                    <p className="mt-1 text-lg font-semibold text-[#001752]">
                      {certificate.courseTitle}
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Code {certificate.code} · {earnedCount} of{" "}
                      {courses.length} earned
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={exporting !== null}
                    onClick={() => void handleDownloadPng()}
                    className="gap-2"
                  >
                    <SolarIcon name="gallery-download" className="size-4" />
                    {exporting === "png" ? "Exporting…" : "Download PNG"}
                  </Button>
                  <Button
                    type="button"
                    disabled={exporting !== null}
                    onClick={() => void handleDownloadPdf()}
                    className="gap-2 bg-[#00206F] text-white hover:bg-[#001752]"
                  >
                    <SolarIcon name="download-minimalistic" className="size-4" />
                    {exporting === "pdf" ? "Exporting…" : "Download PDF"}
                  </Button>
                </div>
              </div>

              <div
                aria-hidden
                className="pointer-events-none fixed top-0 -left-[10000px]"
              >
                <CertificateCanvas ref={canvasRef} certificate={certificate} />
              </div>

              <div className="overflow-x-auto rounded-2xl border border-black/8 bg-[#e8e4dc] p-3 sm:p-4">
                <div className="mx-auto w-fit min-w-[1123px]">
                  <CertificateCanvas certificate={certificate} />
                </div>
              </div>
            </div>
          ) : selected ? (
            <div className="rounded-2xl border border-black/8 bg-white px-5 py-8 sm:px-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#eef2f9] text-[#00206F]">
                  <SolarIcon name="lock-keyhole" className="size-7" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold tracking-[0.14em] text-[#00206F]/55 uppercase">
                    Not earned yet
                  </p>
                  <h3 className="mt-1 text-xl font-semibold text-[#001752]">
                    {selected.courseTitle}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {selected.progress.total === 0
                      ? "This course has no modules yet."
                      : selected.progress.passed >= selected.progress.total
                        ? "Almost there — refresh if your last quiz just passed."
                        : `${Math.max(0, selected.progress.total - selected.progress.passed)} module${selected.progress.total - selected.progress.passed === 1 ? "" : "s"} left with a passing quiz.`}
                  </p>
                  <Link
                    href="/dashboard/learn"
                    className="admin-press mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-[#FB7801] px-4 text-sm font-semibold text-white hover:brightness-105"
                  >
                    Continue learning
                    <SolarIcon name="alt-arrow-right" className="size-4" />
                  </Link>
                </div>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
