"use client"

import { forwardRef } from "react"

import { BrandLogo } from "@/components/admin/brand-logo"

export type CertificateData = {
  code: string
  studentName: string
  courseTitle: string
  tutorName: string | null
  completedAt: string
}

function formatDate(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

/** Landscape certificate visual (~A4 / 1123×794). Capture via ref for PNG/PDF. */
export const CertificateCanvas = forwardRef<
  HTMLDivElement,
  { certificate: CertificateData }
>(function CertificateCanvas({ certificate }, ref) {
  return (
    <div
      ref={ref}
      className="relative overflow-hidden bg-[#f7f4ee] text-[#001752]"
      style={{ width: 1123, height: 794 }}
    >
      {/* Outer frame */}
      <div className="absolute inset-[18px] rounded-[4px] border-[3px] border-[#00206F]" />
      <div className="absolute inset-[28px] rounded-[2px] border border-[#FB7801]/70" />

      {/* Corner accents */}
      <div className="absolute top-[40px] left-[40px] size-10 border-t-2 border-l-2 border-[#FB7801]" />
      <div className="absolute top-[40px] right-[40px] size-10 border-t-2 border-r-2 border-[#FB7801]" />
      <div className="absolute bottom-[40px] left-[40px] size-10 border-b-2 border-l-2 border-[#FB7801]" />
      <div className="absolute right-[40px] bottom-[40px] size-10 border-r-2 border-b-2 border-[#FB7801]" />

      {/* Soft navy wash */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, #00206F 0%, transparent 55%), radial-gradient(ellipse at 80% 100%, #FB7801 0%, transparent 40%)",
        }}
      />

      <div className="relative flex h-full flex-col px-[72px] pt-[56px] pb-[48px]">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <BrandLogo
              size={52}
              priority
              className="rounded-full ring-2 ring-[#00206F]/15"
            />
            <div>
              <p className="text-[11px] font-semibold tracking-[0.22em] text-[#FB7801] uppercase">
                TechUp Academy
              </p>
              <p className="mt-0.5 text-[15px] font-semibold tracking-wide text-[#00206F]">
                Certificate of Completion
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold tracking-[0.18em] text-[#00206F]/45 uppercase">
              Certificate ID
            </p>
            <p className="mt-1 font-mono text-[13px] font-semibold tracking-wider text-[#00206F]">
              {certificate.code}
            </p>
          </div>
        </header>

        <div className="mt-10 flex flex-1 flex-col items-center justify-center text-center">
          <p className="text-[12px] font-medium tracking-[0.28em] text-[#00206F]/55 uppercase">
            This certifies that
          </p>
          <h1
            className="mt-4 max-w-[820px] text-[42px] leading-[1.15] font-bold tracking-tight text-[#00206F]"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            {certificate.studentName}
          </h1>
          <div className="mt-5 h-px w-40 bg-gradient-to-r from-transparent via-[#FB7801] to-transparent" />
          <p className="mt-5 max-w-[640px] text-[15px] leading-relaxed text-[#001752]/75">
            has successfully completed the course
          </p>
          <p className="mt-2 text-[22px] font-semibold tracking-tight text-[#00206F]">
            {certificate.courseTitle}
          </p>
          <p className="mt-3 text-[13px] text-[#001752]/55">
            and demonstrated the skills required for course completion at TechUp
            Academy.
          </p>
        </div>

        <footer className="mt-auto grid grid-cols-3 items-end gap-8 border-t border-[#00206F]/12 pt-7">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.16em] text-[#00206F]/45 uppercase">
              Completed
            </p>
            <p className="mt-2 text-[15px] font-semibold text-[#001752]">
              {formatDate(certificate.completedAt)}
            </p>
          </div>
          <div className="text-center">
            <p
              className="text-[20px] text-[#00206F]"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              {certificate.tutorName || "TechUp Faculty"}
            </p>
            <div className="mx-auto mt-1 h-px w-36 bg-[#00206F]/25" />
            <p className="mt-2 text-[10px] font-semibold tracking-[0.16em] text-[#00206F]/45 uppercase">
              Tutor signature
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold tracking-[0.16em] text-[#00206F]/45 uppercase">
              Issued by
            </p>
            <p className="mt-2 text-[15px] font-semibold text-[#001752]">
              TechUp Academy
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
})
