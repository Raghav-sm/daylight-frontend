'use client'

import type { ComponentProps } from 'react'
import { useEffect, useRef, useState } from 'react'
import { KanbanStageHeader } from '@/components/boards/kanban-view'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanColumnHandle,
  KanbanItem,
  KanbanItemHandle,
  KanbanOverlay,
} from '@/components/ui/kanban'
import { cn } from '@/lib/utils'
import { CalendarClockIcon, GripVerticalIcon, Plus, Send } from 'lucide-react'
import styles from './kanban-2.module.css'

type ColumnId = 'todo' | 'inProgress' | 'done'
type Priority = 'low' | 'medium' | 'high'

interface Task {
  id: string
  code: string
  title: string
  priority: Priority
  description?: string
  assignee?: string
  assigneeAvatar?: string
  dueDate?: string
  estimate?: string
  labels?: string[]
}

const columnsMeta: Record<ColumnId, { title: string }> = {
  todo: { title: 'To Do' },
  inProgress: { title: 'In Progress' },
  done: { title: 'Completed' },
}

const priorityStyles: Record<Priority, string> = {
  low: 'border-border bg-muted text-muted-foreground',
  medium: 'border-stage-progress/30 bg-stage-progress/10 text-stage-progress',
  high: 'border-destructive/20 bg-destructive/10 text-destructive',
}

const initialColumns: Record<ColumnId, Task[]> = {
  todo: [
    { id: 'task-review', code: 'WEB-12', title: 'Review landing page', priority: 'medium', assignee: 'Maya Okafor', labels: ['Website'] },
    { id: 'task-announcement', code: 'MKT-08', title: 'Write launch announcement', priority: 'high', assignee: 'Alex Chen', dueDate: 'Nov 20', labels: ['Launch'] },
  ],
  inProgress: [
    { id: 'task-checklist', code: 'OPS-04', title: 'Prepare launch checklist', priority: 'medium', assignee: 'Sam Rivera', estimate: '3 pts', labels: ['Launch'] },
  ],
  done: [
    { id: 'task-scope', code: 'PLAN-02', title: 'Define project scope', priority: 'low', assignee: 'Maya Okafor', labels: ['Planning'] },
  ],
}

interface TaskCardProps extends Omit<ComponentProps<typeof KanbanItem>, 'value' | 'children'> {
  task: Task
  isOverlay?: boolean
}

function TaskCard({ task, isOverlay, ...props }: TaskCardProps) {
  const initials = task.assignee?.split(' ').map((part) => part[0]).join('')
  const content = (
    <article className={cn('relative overflow-hidden rounded-xl border border-border bg-background p-3 shadow-sm transition-shadow', !isOverlay && 'hover:shadow-md')}>
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              <span>{task.code}</span>
              {task.estimate && <><span className="size-1 rounded-full bg-current opacity-40" /><span>{task.estimate}</span></>}
            </div>
            <h3 className="mt-1 text-sm font-medium leading-snug">{task.title}</h3>
          </div>
          <Badge variant="outline" className={cn('px-1.5 py-0 text-[10px] capitalize', priorityStyles[task.priority])}>{task.priority}</Badge>
        </div>
        {task.description && <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{task.description}</p>}
        {task.labels?.length ? <div className="flex flex-wrap gap-1.5">{task.labels.map((label) => <span key={label} className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{label}</span>)}</div> : null}
        <div className="flex items-center justify-between gap-2 border-t border-border pt-2.5">
          {task.assignee && <div className="flex min-w-0 items-center gap-2"><Avatar size="sm" className="size-5"><AvatarImage src={task.assigneeAvatar} /><AvatarFallback className="text-[9px]">{initials}</AvatarFallback></Avatar><span className="truncate text-[10px] text-muted-foreground">{task.assignee}</span></div>}
          {task.dueDate && <time className="flex shrink-0 items-center gap-1 text-[10px] tabular-nums text-muted-foreground"><CalendarClockIcon className="size-3" />{task.dueDate}</time>}
        </div>
      </div>
    </article>
  )

  return <KanbanItem value={task.id} {...props}>{isOverlay ? content : <KanbanItemHandle>{content}</KanbanItemHandle>}</KanbanItem>
}

interface TaskColumnProps extends Omit<ComponentProps<typeof KanbanColumn>, 'children' | 'value'> {
  value: ColumnId
  tasks: Task[]
  onAddTask?: () => void
  isOverlay?: boolean
}

function TaskColumn({ value, tasks, onAddTask, isOverlay, ...props }: TaskColumnProps) {
  const meta = columnsMeta[value]
  const colorIndex = value === 'todo' ? 0 : value === 'inProgress' ? 1 : 2
  return (
    <KanbanColumn value={value} data-kanban-stage-color={colorIndex} className="w-full" {...props}>
      <section className="kanban-stage-column flex min-h-[260px] h-full flex-col rounded-2xl p-2.5 shadow-sm sm:min-h-[335px]">
        <KanbanStageHeader
          title={meta.title}
          count={String(tasks.length).padStart(2, '0')}
          action={(
            <KanbanColumnHandle asChild>
              <Button size="icon-xs" variant="ghost" aria-label={'Move ' + meta.title + ' column'}>
                <GripVerticalIcon />
              </Button>
            </KanbanColumnHandle>
          )}
        />
        <KanbanColumnContent value={value} className="min-h-[18rem] flex-1 gap-2">
          {tasks.filter((task) => isOverlay || task.id !== 'task-draft-email').map((task) => <TaskCard key={task.id} task={task} isOverlay={isOverlay} />)}
          {value === 'todo' && !isOverlay && <div className={styles.newTask} data-added={tasks.some((task) => task.id === 'task-draft-email')}><div className="min-h-0 overflow-hidden">{tasks.some((task) => task.id === 'task-draft-email') && <TaskCard task={tasks.find((task) => task.id === 'task-draft-email')!} />}</div></div>}
        </KanbanColumnContent>
        <button type="button" onClick={onAddTask} className="mt-1 flex h-8 w-full items-center gap-1.5 rounded-lg px-2 text-xs text-muted-foreground transition-colors hover:bg-background/70 hover:text-foreground"><Plus className="size-3.5" />Add task</button>
      </section>
    </KanbanColumn>
  )
}

function KanbanDemoModern() {
  const root = useRef<HTMLDivElement>(null)
  const [columns, setColumns] = useState<Record<ColumnId, Task[]>>(initialColumns)
  const [draft, setDraft] = useState('')

  useEffect(() => {
    const node = root.current
    if (!node) return
    const title = 'Draft the launch email'
    const addedTask: Task = { id: 'task-draft-email', code: 'MKT-11', title, priority: 'medium', assignee: 'Maya Okafor', dueDate: 'Nov 20', labels: ['Launch'] }
    const timers: number[] = []
    let typing: number | undefined
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        timers.push(window.setTimeout(() => setColumns((current) => ({ ...current, todo: [...current.todo, addedTask] })), 1400))
        return
      }
      timers.push(window.setTimeout(() => {
        let index = 0
        typing = window.setInterval(() => {
          index += 1
          setDraft(title.slice(0, index))
          if (index >= title.length) {
            window.clearInterval(typing)
            timers.push(window.setTimeout(() => {
              setDraft('')
              setColumns((current) => ({ ...current, todo: [...current.todo, addedTask] }))
            }, 380))
          }
        }, 65)
      }, 650))
    }, { threshold: 0.25 })
    observer.observe(node)
    return () => { observer.disconnect(); timers.forEach(window.clearTimeout); if (typing) window.clearInterval(typing) }
  }, [])

  return (
    <div ref={root} className="w-full">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium">Product launch</p>
        <span className="text-xs text-muted-foreground">Drag cards between stages</span>
      </div>
      <Kanban value={columns} onValueChange={(nextColumns) => setColumns(nextColumns as Record<ColumnId, Task[]>)} getItemValue={(task) => task.id} className="overflow-x-auto pb-2">
        <KanbanBoard className="w-max grid-flow-col grid-cols-none auto-cols-[14rem] lg:auto-cols-[18rem]">
          {(Object.keys(columns) as ColumnId[]).map((columnId) => (
            <TaskColumn
              key={columnId}
              value={columnId}
              tasks={columns[columnId]}
              onAddTask={() => setColumns((current) => ({
                ...current,
                [columnId]: [...current[columnId], {
                  id: 'task-' + columnId + '-' + Date.now(),
                  code: 'TASK-NEW',
                  title: 'Untitled task',
                  priority: 'low',
                }],
              }))}
            />
          ))}
        </KanbanBoard>
        <KanbanOverlay>
          {({ value, variant }) => {
            const activeValue = String(value)
            if (variant === 'column') return <TaskColumn value={activeValue as ColumnId} tasks={columns[activeValue as ColumnId] ?? []} isOverlay />
            const task = Object.values(columns).flat().find((item) => item.id === activeValue)
            return task ? <TaskCard task={task} isOverlay /> : null
          }}
        </KanbanOverlay>
      </Kanban>
      <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 shadow-sm">
        <input aria-label="Add a task to To Do" readOnly value={draft} placeholder="Add a task to To Do…" className="h-8 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
        <Button size="icon-sm" variant="secondary" disabled aria-label="Add task"><Send className="size-3.5" /></Button>
      </div>
    </div>
  )
}

export default KanbanDemoModern
