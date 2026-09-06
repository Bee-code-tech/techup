import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function SiteHeader({ title }: { title: string }) {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b border-black/[0.05] bg-white/80 backdrop-blur-xl transition-[width,height] duration-200 ease-[var(--ease-out)] group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="admin-press -ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <h1 className="text-[1.05rem] font-semibold tracking-tight text-[#001752]">
          {title}
        </h1>
      </div>
    </header>
  )
}
