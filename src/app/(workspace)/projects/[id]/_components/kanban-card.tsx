'use client';

import { CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task } from '@/lib/task-types';

function taskDate(task: Task) {
  if (!task.dueDate) return null;
  const [year, month, day] = task.dueDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const formatted = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);

  if (!task.dueTime) return formatted;

  const [hours, minutes] = task.dueTime.split(':').map(Number);
  const withTime = new Date(year, month - 1, day, hours, minutes);
  const time = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(withTime);

  return `${formatted} · ${time}`;
}

function taskInitial(task: Task) {
  const letter = task.title.trim().charAt(0);
  return letter ? letter.toUpperCase() : '?';
}

export function KanbanCard({
  task,
  className,
}: {
  task: Task;
  className?: string;
}) {
  const dateLabel = taskDate(task);

  return (
    <div
      className={cn(
        'bg-card flex w-full flex-col gap-3 rounded-xl p-3 shadow-sm',
        className,
      )}
    >
      <p
        className={cn(
          'text-sm wrap-break-word text-card-foreground',
          task.completed && 'text-muted-foreground line-through',
        )}
      >
        {task.title}
      </p>
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {task.priority !== 'none' && (
            <span className="capitalize">{task.priority} priority</span>
          )}
          {dateLabel && (
            <span className="inline-flex items-center gap-1">
              <CalendarDays aria-hidden="true" className="size-3.5 shrink-0" />
              <span className="truncate">{dateLabel}</span>
            </span>
          )}
          {task.subtasks.length > 0 && (
            <span>
              {task.subtasks.filter((subtask) => subtask.completed).length}/
              {task.subtasks.length} subtasks
            </span>
          )}
        </div>
        <span
          aria-hidden="true"
          className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground"
        >
          {taskInitial(task)}
        </span>
      </div>
    </div>
  );
}
