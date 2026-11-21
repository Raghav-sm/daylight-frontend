import Link from 'next/link';
import { ArrowUpRight, CalendarDays } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TaskSummary } from '@/features/tasks/types';

function dueLabel(task: TaskSummary) {
  if (!task.dueDate) return '';
  const [year, month, day] = task.dueDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const label = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date);
  if (!task.dueTime) return label;
  const [hours, minutes] = task.dueTime.split(':').map(Number);
  const time = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })
    .format(new Date(year, month - 1, day, hours, minutes));
  return `${label} · ${time}`;
}

export function DashboardTaskList({ title, description, tasks, projectNames, emptyMessage, overdue = false }: {
  title: string; description: string; tasks: TaskSummary[]; projectNames: Record<string, string>; emptyMessage: string; overdue?: boolean;
}) {
  return (
    <Card className="gap-0 border border-border py-0 shadow-[0_12px_32px_-24px_rgba(32,25,16,0.5)] ring-0">
      <CardHeader className="px-4 pt-4 pb-2 sm:px-5"><CardTitle>{title}</CardTitle><p className="text-xs text-muted-foreground">{description}</p></CardHeader>
      <CardContent className="divide-y divide-border px-4 pb-3 sm:px-5">
        {tasks.length === 0 && <p className="py-8 text-sm text-muted-foreground">{emptyMessage}</p>}
        {tasks.map((task) => (
          <Link key={task.id} href={`/tasks/${encodeURIComponent(task.id)}`} className="group flex items-start justify-between gap-3 py-3 focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-ring">
            <div className="min-w-0"><span className="flex items-center gap-1 text-sm font-medium group-hover:underline"><span className="truncate">{task.title}</span><ArrowUpRight aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" /></span><span className="mt-1 block truncate text-xs text-muted-foreground">{projectNames[task.projectId] ?? 'Project'}</span></div>
            <span className={`flex shrink-0 items-center gap-1 text-xs tabular-nums ${overdue ? 'text-destructive' : 'text-muted-foreground'}`}><CalendarDays aria-hidden="true" className="size-3.5" />{dueLabel(task)}</span>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
