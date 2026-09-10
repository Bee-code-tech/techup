"use client"

import { useEffect, useState } from "react"
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  GripVerticalIcon,
  LoaderCircleIcon,
  PencilIcon,
  PlusCircleIcon,
  SaveIcon,
  XIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export type ModuleListItem = {
  id: string
  title: string
  access: string
  order: number
  videoUrl: string | null
  questionCount?: number
}

function SortableRow({
  moduleRow,
  onEdit,
}: {
  moduleRow: ModuleListItem
  onEdit: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: moduleRow.id })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className="flex items-center gap-2 rounded-xl border border-black/8 bg-white px-3 py-2.5"
    >
      <button
        type="button"
        className="touch-none text-muted-foreground"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
      >
        <GripVerticalIcon className="size-4" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[#001752]">
          {moduleRow.title}
        </p>
        <div className="mt-1 flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="rounded-md text-[10px]">
            {moduleRow.access}
          </Badge>
          <Badge
            variant="secondary"
            className={cn(
              "rounded-md text-[10px]",
              moduleRow.videoUrl
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700",
            )}
          >
            {moduleRow.videoUrl ? "Video ready" : "Needs video"}
          </Badge>
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 gap-1"
        onClick={() => onEdit(moduleRow.id)}
      >
        <PencilIcon className="size-3.5" />
        Edit
      </Button>
    </div>
  )
}

export function ModulesForm({
  modules,
  onAdd,
  onReorder,
  onEdit,
}: {
  modules: ModuleListItem[]
  onAdd: (title: string) => Promise<void> | void
  onReorder: (orderedIds: string[]) => Promise<void> | void
  onEdit: (id: string) => void
}) {
  const [creating, setCreating] = useState(false)
  const [draft, setDraft] = useState("")
  const [local, setLocal] = useState(modules)
  const [adding, setAdding] = useState(false)
  const [savingOrder, setSavingOrder] = useState(false)

  useEffect(() => setLocal(modules), [modules])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )

  const orderDirty =
    local.map((row) => row.id).join(",") !==
    modules.map((row) => row.id).join(",")

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setLocal((items) => {
      const oldIndex = items.findIndex((row) => row.id === active.id)
      const newIndex = items.findIndex((row) => row.id === over.id)
      return arrayMove(items, oldIndex, newIndex)
    })
  }

  async function handleAdd() {
    if (!draft.trim()) return
    setAdding(true)
    try {
      await onAdd(draft.trim())
      setDraft("")
      setCreating(false)
    } finally {
      setAdding(false)
    }
  }

  async function handleSaveOrder() {
    setSavingOrder(true)
    try {
      await onReorder(local.map((row) => row.id))
    } finally {
      setSavingOrder(false)
    }
  }

  return (
    <div className="rounded-xl border border-black/10 p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-[#001752]">Modules</p>
          {orderDirty ? (
            <Badge className="bg-amber-100 text-[10px] text-amber-800 hover:bg-amber-100">
              Unsaved order
            </Badge>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          {orderDirty ? (
            <Button
              type="button"
              size="sm"
              className="h-8 gap-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
              disabled={savingOrder}
              onClick={() => void handleSaveOrder()}
            >
              {savingOrder ? (
                <LoaderCircleIcon className="size-3.5 animate-spin" />
              ) : (
                <SaveIcon className="size-3.5" />
              )}
              Save order
            </Button>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5"
            onClick={() => setCreating((v) => !v)}
          >
            {creating ? (
              <>
                <XIcon className="size-3.5" /> Cancel
              </>
            ) : (
              <>
                <PlusCircleIcon className="size-3.5" /> Add module
              </>
            )}
          </Button>
        </div>
      </div>

      {creating ? (
        <div className="mt-3 flex gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="e.g. Introduction to Flexbox"
            className="h-10 rounded-lg border-black/10 bg-transparent"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                void handleAdd()
              }
            }}
          />
          <Button
            type="button"
            disabled={adding || draft.trim().length < 2}
            onClick={() => void handleAdd()}
            className="h-10 rounded-lg bg-[#00206F] text-white hover:bg-[#001752]"
          >
            {adding ? "Adding…" : "Add"}
          </Button>
        </div>
      ) : null}

      <div className="mt-4">
        {local.length === 0 ? (
          <div className="rounded-xl border border-dashed border-black/10 px-4 py-10 text-center text-sm text-muted-foreground">
            No modules yet. Add your first lesson.
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={local.map((row) => row.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {local.map((moduleRow) => (
                  <SortableRow
                    key={moduleRow.id}
                    moduleRow={moduleRow}
                    onEdit={onEdit}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  )
}
