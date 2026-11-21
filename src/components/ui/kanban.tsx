'use client'

import * as React from 'react'
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DraggableAttributes,
  type DraggableSyntheticListeners,
  type UniqueIdentifier,
} from '@dnd-kit/core'
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Slot } from 'radix-ui'
import { cn } from '@/lib/utils'

type KanbanState<T> = Record<string, T[]>
type KanbanContextValue<T> = {
  value: KanbanState<T>
  onValueChange: (value: KanbanState<T>) => void
  getItemValue: (item: T) => string
  activeId: UniqueIdentifier | null
  isOverlay: boolean
  columnIds: string[]
  findContainer: (id: UniqueIdentifier) => string | undefined
}

const KanbanContext = React.createContext<KanbanContextValue<unknown> | null>(null)
const ColumnHandleContext = React.createContext<{ attributes: DraggableAttributes; listeners?: DraggableSyntheticListeners } | null>(null)
const ItemHandleContext = React.createContext<DraggableSyntheticListeners | undefined>(undefined)

function useKanban<T>() {
  const context = React.useContext(KanbanContext)
  if (!context) throw new Error('Kanban parts must be rendered inside <Kanban>.')
  return context as KanbanContextValue<T>
}

interface KanbanProps<T> extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: KanbanState<T>
  onValueChange: (value: KanbanState<T>) => void
  getItemValue: (item: T) => string
  allowSameColumnReorder?: boolean
  children: ReactNode
}

function Kanban<T>({ value, onValueChange, getItemValue, allowSameColumnReorder = true, children, className, ...props }: KanbanProps<T>) {
  const dndId = React.useId()
  const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null)
  const columnIds = React.useMemo(() => Object.keys(value), [value])
  const findContainer = React.useCallback((id: UniqueIdentifier) => {
    const key = String(id)
    if (columnIds.includes(key)) return key
    return columnIds.find((columnId) => value[columnId]?.some((item) => getItemValue(item) === key))
  }, [columnIds, getItemValue, value])
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const onDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return
    const activeKey = String(active.id)
    const overKey = String(over.id)
    const from = findContainer(active.id)
    const to = findContainer(over.id)
    if (!from || !to) return

    if (columnIds.includes(activeKey) && columnIds.includes(overKey)) {
      const reordered = arrayMove(columnIds, columnIds.indexOf(activeKey), columnIds.indexOf(overKey))
      onValueChange(Object.fromEntries(reordered.map((id) => [id, value[id]])))
      return
    }

    if (from === to && !allowSameColumnReorder) return

    const source = [...value[from]]
    const sourceIndex = source.findIndex((item) => getItemValue(item) === activeKey)
    if (sourceIndex < 0) return
    if (from === to) {
      const overIndex = source.findIndex((item) => getItemValue(item) === overKey)
      if (overIndex >= 0) onValueChange({ ...value, [from]: arrayMove(source, sourceIndex, overIndex) })
      return
    }

    const destination = [...value[to]]
    const [moved] = source.splice(sourceIndex, 1)
    const destinationIndex = destination.findIndex((item) => getItemValue(item) === overKey)
    destination.splice(destinationIndex < 0 ? destination.length : destinationIndex, 0, moved)
    onValueChange({ ...value, [from]: source, [to]: destination })
  }

  const context = React.useMemo(() => ({ value, onValueChange, getItemValue, activeId, isOverlay: false, columnIds, findContainer }), [value, onValueChange, getItemValue, activeId, columnIds, findContainer])

  return (
    <KanbanContext.Provider value={context as KanbanContextValue<unknown>}>
      <DndContext
        id={dndId}
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={({ active }) => setActiveId(active.id)}
        onDragCancel={() => setActiveId(null)}
        onDragEnd={onDragEnd}
      >
        <div data-slot="kanban" className={cn(activeId && 'cursor-grabbing', className)} {...props}>{children}</div>
      </DndContext>
    </KanbanContext.Provider>
  )
}

function KanbanBoard({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { columnIds } = useKanban<unknown>()
  return <SortableContext items={columnIds} strategy={rectSortingStrategy}><div data-slot="kanban-board" className={cn('grid gap-3', className)} {...props}>{children}</div></SortableContext>
}

interface SortablePartProps extends HTMLAttributes<HTMLDivElement> { value: string; disabled?: boolean }
function KanbanColumn({ value, disabled, className, children, ...props }: SortablePartProps) {
  const { isOverlay } = useKanban<unknown>()
  const { setNodeRef, transform, transition, attributes, listeners, isDragging, isOver } = useSortable({ id: value, disabled: disabled || isOverlay })
  const style: CSSProperties = { transform: CSS.Transform.toString(transform), transition }
  return (
    <ColumnHandleContext.Provider value={{ attributes, listeners: listeners ?? undefined }}>
      <div ref={setNodeRef} style={style} data-slot="kanban-column" data-dragging={isDragging} data-over={isOver} className={cn('min-w-0', isDragging && 'z-10 opacity-60', isOver && 'rounded-2xl ring-2 ring-ring/40', className)} {...props}>{children}</div>
    </ColumnHandleContext.Provider>
  )
}

function KanbanColumnHandle({ asChild, className, children, ...props }: HTMLAttributes<HTMLDivElement> & { asChild?: boolean }) {
  const context = React.useContext(ColumnHandleContext)
  const Comp = asChild ? Slot.Root : 'div'
  return <Comp {...context?.attributes} {...context?.listeners} className={cn('cursor-grab touch-none', className)} {...props}>{children}</Comp>
}

function KanbanColumnContent({ value, className, children, ...props }: SortablePartProps) {
  const { value: columns, getItemValue } = useKanban<unknown>()
  const ids = (columns[value] ?? []).map(getItemValue)
  return <SortableContext items={ids} strategy={verticalListSortingStrategy}><div data-slot="kanban-column-content" className={cn('flex min-h-40 flex-col gap-2.5', className)} {...props}>{children}</div></SortableContext>
}

function KanbanItem({ value, disabled, className, children, ...props }: SortablePartProps) {
  const { isOverlay } = useKanban<unknown>()
  const { setNodeRef, transform, transition, attributes, listeners, isDragging, isOver } = useSortable({ id: value, disabled: disabled || isOverlay })
  const style: CSSProperties = { transform: CSS.Transform.toString(transform), transition }
  const context = isOverlay ? undefined : listeners
  return (
    <ItemHandleContext.Provider value={context}>
      <div ref={setNodeRef} style={style} data-slot="kanban-item" data-dragging={isDragging} data-over={isOver} className={cn(isDragging && 'opacity-40', isOver && 'rounded-xl ring-2 ring-ring/40', className)} {...(isOverlay ? {} : attributes)} {...props}>{children}</div>
    </ItemHandleContext.Provider>
  )
}

function KanbanItemHandle({ asChild, className, children, ...props }: HTMLAttributes<HTMLDivElement> & { asChild?: boolean }) {
  const context = React.useContext(ItemHandleContext)
  const Comp = asChild ? Slot.Root : 'div'
  return <Comp {...context} className={cn('cursor-grab touch-none', className)} {...props}>{children}</Comp>
}

function KanbanOverlay({ children, ...props }: Omit<React.ComponentProps<typeof DragOverlay>, 'children'> & { children?: (args: { value: UniqueIdentifier; variant: 'column' | 'item' }) => ReactNode }) {
  const context = useKanban<unknown>()
  const { activeId, columnIds } = context
  const overlayContext = React.useMemo(() => ({ ...context, isOverlay: true }), [context])
  if (!activeId) return null
  const variant = columnIds.includes(String(activeId)) ? 'column' : 'item'
  return <DragOverlay {...props}><KanbanContext.Provider value={overlayContext}>{children?.({ value: activeId, variant })}</KanbanContext.Provider></DragOverlay>
}

export { Kanban, KanbanBoard, KanbanColumn, KanbanColumnContent, KanbanColumnHandle, KanbanItem, KanbanItemHandle, KanbanOverlay }
