'use client';

import { CalendarDays, Flag, ListChecks } from 'lucide-react';
import type { Project, Task } from '@/lib/task-types';
import { Checkbox } from '@/components/ui/checkbox';

type TaskItemProps = {
  task: Task;
  project?: Project;
  selected: boolean;
  onSelect: (taskId: string) => void;
  onCompletionChange: (taskId: string, completed: boolean) => void;
};

function formatDueDate(value: string, time: string | null) {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date(year, month - 1, day));
  return time ? `${date} · ${time}` : date;
}

export function TaskItem({ task, project, selected, onSelect, onCompletionChange }: TaskItemProps) {
  const completedSubtasks = task.subtasks.filter((subtask) => subtask.completed).length;

  return (
    <li className={`group flex min-h-[4.5rem] items-center gap-4 px-3 transition-colors hover:bg-muted/40 ${selected ? 'bg-muted/60' : ''}`}>
      <Checkbox
        aria-label={`${task.completed ? 'Reopen' : 'Complete'} ${task.title}`}
        checked={task.completed}
        onCheckedChange={(checked) => onCompletionChange(task.id, checked === true)}
      />
      <button
        type="button"
        onClick={() => onSelect(task.id)}
        className="flex min-w-0 flex-1 items-center justify-between gap-4 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <span className="min-w-0 flex-1">
          <span className={`block truncate text-sm font-medium ${task.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
            {task.title}
          </span>
          <span className="mt-1 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {project && (
              <span className="inline-flex items-center gap-1.5">
                <span data-project-color={project.color} className="project-color-dot size-2 rounded-full" aria-hidden="true" />
                {project.name}
              </span>
            )}
            {task.dueDate && <span className="inline-flex items-center gap-1"><CalendarDays aria-hidden="true" className="size-3.5" />{formatDueDate(task.dueDate, task.dueTime)}</span>}
            {task.subtasks.length > 0 && <span className="inline-flex items-center gap-1"><ListChecks aria-hidden="true" className="size-3.5" />{completedSubtasks}/{task.subtasks.length}</span>}
            {task.notes && <span className="hidden truncate sm:inline">{task.notes}</span>}
          </span>
        </span>
        {task.priority !== 'none' && (
          <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs capitalize ${task.priority === 'high' ? 'bg-destructive/10 text-destructive' : 'bg-secondary text-secondary-foreground'}`}>
            <Flag aria-hidden="true" className="size-3" />{task.priority}
          </span>
        )}
      </button>
    </li>
  );
}
