import { BrandLogo } from "@/components/admin/brand-logo"

export function AuthShell({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-navy text-white lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(251,120,1,0.28),transparent_38%),radial-gradient(circle_at_88%_84%,rgba(255,255,255,0.08),transparent_36%)]" />
        <div className="relative z-10 flex flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <BrandLogo size={44} priority />
            <span className="text-lg font-semibold tracking-tight">
              TechUp Academy
            </span>
          </div>
          <div className="max-w-md space-y-5">
            <h1 className="font-display text-4xl leading-[1.15] font-semibold tracking-tight">
              {title}
            </h1>
            <p className="text-base leading-7 text-white/72">
              Registrations, student analytics, and broadcasts — in one
              quiet, focused workspace.
            </p>
          </div>
          <p className="text-sm text-white/50">
            Built for Nigeria&apos;s next generation of tech talent.
          </p>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center bg-[#f7f9fc] p-6 md:p-10">
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <BrandLogo size={40} priority />
          <span className="text-lg font-semibold tracking-tight text-navy">
            TechUp Academy
          </span>
        </div>
        <div className="w-full max-w-[420px]">{children}</div>
      </div>
    </div>
  )
}
