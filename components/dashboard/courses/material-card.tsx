"use client"

import Image from "next/image"
import {
  ExternalLinkIcon,
  FileArchiveIcon,
  FileIcon,
  FileTextIcon,
  ImageIcon,
  Link2Icon,
  Trash2Icon,
  VideoIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  getMaterialKind,
  materialHostname,
  materialLabel,
  type MaterialItem,
} from "@/lib/materials"
import { cn } from "@/lib/utils"

export function MaterialCard({
  item,
  onRemove,
  className,
}: {
  item: MaterialItem
  onRemove?: () => void
  className?: string
}) {
  const kind = getMaterialKind(item)
  const title = item.name?.trim() || materialHostname(item.url) || "Material"
  const subtitle =
    kind === "link"
      ? materialHostname(item.url)
      : materialLabel(kind)

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group relative flex overflow-hidden rounded-xl border border-black/8 bg-white transition-[border-color,box-shadow] duration-150 hover:border-[#00206F]/20 hover:shadow-[0_8px_24px_-16px_rgba(0,32,111,0.35)]",
        className,
      )}
    >
      <div className="relative h-[88px] w-[112px] shrink-0 overflow-hidden border-r border-black/6 bg-[#f4f6fa]">
        <MaterialPreview item={item} kind={kind} title={title} />
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[#001752]">
            {title}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <KindBadge kind={kind} />
            <span className="truncate">{subtitle}</span>
          </p>
        </div>
        <ExternalLinkIcon className="size-3.5 shrink-0 text-muted-foreground opacity-70 transition-opacity group-hover:opacity-100" />
        {onRemove ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 shrink-0 text-destructive hover:bg-red-50"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              onRemove()
            }}
          >
            <Trash2Icon className="size-3.5" />
          </Button>
        ) : null}
      </div>
    </a>
  )
}

function KindBadge({ kind }: { kind: ReturnType<typeof getMaterialKind> }) {
  const Icon =
    kind === "pdf"
      ? FileTextIcon
      : kind === "image"
        ? ImageIcon
        : kind === "zip"
          ? FileArchiveIcon
          : kind === "video"
            ? VideoIcon
            : kind === "link"
              ? Link2Icon
              : FileIcon

  return (
    <span
      className={cn(
        "inline-flex size-4 items-center justify-center rounded-[3px]",
        kind === "pdf" && "bg-[#E53935] text-white",
        kind === "image" && "bg-[#43A047] text-white",
        kind === "zip" && "bg-[#FB7801] text-white",
        kind === "video" && "bg-[#00206F] text-white",
        kind === "link" && "bg-[#5C6BC0] text-white",
        kind === "file" && "bg-[#78909C] text-white",
      )}
    >
      <Icon className="size-2.5" aria-hidden />
    </span>
  )
}

function MaterialPreview({
  item,
  kind,
  title,
}: {
  item: MaterialItem
  kind: ReturnType<typeof getMaterialKind>
  title: string
}) {
  if (kind === "image") {
    return (
      <Image
        src={item.url}
        alt={title}
        fill
        className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
        unoptimized
      />
    )
  }

  if (kind === "pdf") {
    return (
      <div className="absolute inset-0 bg-[#f7f8fb]">
        <iframe
          src={`${item.url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
          title={title}
          className="pointer-events-none h-[160%] w-[160%] origin-top-left scale-[0.625] border-0 bg-white"
          loading="lazy"
        />
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-[#001028]/70 px-2 py-1.5">
          <span className="rounded bg-[#E53935] px-1 py-0.5 text-[9px] font-bold tracking-wide text-white">
            PDF
          </span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-1.5",
        kind === "zip" && "bg-[#fff6ee]",
        kind === "video" && "bg-[#eef2f9]",
        kind === "link" && "bg-[#eef0fa]",
        kind === "file" && "bg-[#f4f6fa]",
      )}
    >
      {kind === "zip" ? (
        <FileArchiveIcon className="size-7 text-[#FB7801]" />
      ) : kind === "video" ? (
        <VideoIcon className="size-7 text-[#00206F]" />
      ) : kind === "link" ? (
        <Link2Icon className="size-7 text-[#5C6BC0]" />
      ) : (
        <FileIcon className="size-7 text-[#78909C]" />
      )}
      <span className="text-[10px] font-semibold tracking-wide text-[#001752]/70 uppercase">
        {materialLabel(kind)}
      </span>
    </div>
  )
}
