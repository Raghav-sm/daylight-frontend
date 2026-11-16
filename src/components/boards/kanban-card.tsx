'use client';

import { CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TaskSummary } from '@/features/tasks/types';

function taskDate(task: TaskSummary) {
  if (!task.dueDate) return null;
  const [year, month, day] = task.dueDate.split('-').map(Number);
  const formatted = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(year, month - 1, day));
  if (!task.dueTime) return formatted;
  const [hours, minutes] = task.dueTime.split(':').map(Number);
  return `${formatted} · ${new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(new Date(year, month - 1, day, hours, minutes))}`;
}

export function KanbanCard({ task, className }: { task: TaskSummary; className?: string }) {
  const dateLabel = taskDate(task);
  const initial = task.title.trim().charAt(0).toUpperCase() || '?';
  return (
    <div className={cn('bg-card flex w-full flex-col gap-3 rounded-xl p-3 shadow-sm', className)}>
      <p className={cn('text-sm wrap-break-word text-card-foreground', task.completed && 'text-muted-foreground line-through')}>{task.title}</p>
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {task.priority !== 'none' && <span className="capitalize">{task.priority} priority</span>}
          {dateLabel && <span className="inline-flex items-center gap-1"><CalendarDays aria-hidden="true" className="size-3.5 shrink-0" /><span className="truncate">{dateLabel}</span></span>}
          {task.subtaskCount > 0 && <span>{task.completedSubtaskCount}/{task.subtaskCount} subtasks</span>}
        </div>
        <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">{initial}</span>
      </div>
    </div>
  );
}
