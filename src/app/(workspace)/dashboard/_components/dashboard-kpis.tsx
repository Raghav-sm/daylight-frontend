import { CalendarDays, CircleCheck, FolderKanban, ListTodo } from 'lucide-react';
import type { ProjectSummary } from '@/features/projects/types';
import type { TaskSummary } from '@/features/tasks/types';

type Metric = { label: string; value: number; detail: string; icon: typeof FolderKanban };

function MetricCard({ label, value, detail, icon: Icon }: Metric) {
  return (
    <div className="min-w-0 px-4 py-3.5 sm:px-5 [&:not(:first-child)]:border-t [&:not(:first-child)]:border-border sm:[&:not(:first-child)]:border-l sm:[&:nth-child(3)]:border-l-0 xl:[&:nth-child(3)]:border-l sm:[&:nth-child(n+3)]:border-t xl:[&:nth-child(n+3)]:border-t-0">
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground"><span>{label}</span><Icon aria-hidden="true" className="size-4 opacity-70" /></div>
      <div className="mt-2 flex items-baseline gap-2"><strong className="font-heading text-[28px] leading-none font-normal tabular-nums">{value}</strong><span className="truncate text-[11px] text-muted-foreground">{detail}</span></div>
    </div>
  );
}

export function DashboardKpis({ projects, tasks, today, overdueCount }: {
  projects: ProjectSummary[]; tasks: TaskSummary[]; today: string; overdueCount: number;
}) {
  const open = tasks.filter((task) => !task.completed);
  const metrics: Metric[] = [
    { label: 'Projects', value: projects.length, detail: 'Across your workspace', icon: FolderKanban },
    { label: 'Open tasks', value: open.length, detail: `${tasks.length} tasks in total`, icon: ListTodo },
    { label: 'Completed', value: tasks.length - open.length, detail: 'Across all projects', icon: CircleCheck },
    { label: 'Due today', value: open.filter((task) => task.dueDate === today).length, detail: overdueCount ? `${overdueCount} overdue` : 'No overdue tasks', icon: CalendarDays },
  ];
  return <section aria-label="Dashboard totals" className="grid overflow-hidden rounded-xl border border-border bg-card shadow-[0_12px_32px_-24px_rgba(32,25,16,0.5)] sm:grid-cols-2 xl:grid-cols-4">{metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}</section>;
}
