'use client';

import { CalendarDays } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { TaskSummary } from '@/features/tasks/types';

const priorityStyles = {
  low: 'border-border bg-muted text-muted-foreground',
  medium: 'border-stage-progress/30 bg-stage-progress/10 text-stage-progress',
  high: 'border-destructive/25 bg-destructive/10 text-destructive',
} as const;

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
      <div className="flex items-start justify-between gap-2">
        <p className={cn('min-w-0 text-sm wrap-break-word text-card-foreground', task.completed && 'text-muted-foreground line-through')}>{task.title}</p>
        {task.priority !== 'none' && (
          <Badge variant="outline" className={cn('shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize', priorityStyles[task.priority])}>
            {task.priority}
          </Badge>
        )}
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {dateLabel && <span className="inline-flex items-center gap-1"><CalendarDays aria-hidden="true" className="size-3.5 shrink-0" /><span className="truncate">{dateLabel}</span></span>}
          {task.subtaskCount > 0 && <span>{task.completedSubtaskCount}/{task.subtaskCount} subtasks</span>}
        </div>
        <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">{initial}</span>
      </div>
    </div>
  );
}
