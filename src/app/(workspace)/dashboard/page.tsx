'use client';

import { useQueries } from '@tanstack/react-query';
import { DashboardKpis } from './_components/dashboard-kpis';
import { ProjectProgressChart } from './_components/project-progress-chart';
import { DashboardTaskList } from './_components/dashboard-task-list';
import { DeadlineRhythm } from './_components/deadline-rhythm';
import { PageLayout } from '@/components/layout/page-layout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useProjects } from '@/features/projects/data';
import { tasksApi } from '@/features/tasks/api';
import { taskKeys } from '@/features/tasks/data';

function localDate(date: Date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

export default function DashboardPage() {
  const allProjects = useProjects();
  const projects = allProjects.data ?? [];
  const taskQueries = useQueries({ queries: projects.map((project) => ({
    queryKey: taskKeys.byProject(project.id),
    queryFn: ({ signal }: { signal: AbortSignal }) => tasksApi.getProjectSummaries(project.id, signal),
  })) });
  const loading = allProjects.isPending || taskQueries.some((query) => query.isPending);
  const failed = allProjects.isError || taskQueries.some((query) => query.isError);
  const tasks = taskQueries.flatMap((query) => query.data ?? []);
  const today = localDate(new Date());
  const openTasks = tasks.filter((task) => !task.completed);
  const overdue = openTasks.filter((task) => task.dueDate && task.dueDate < today)
    .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''));
  const upcoming = openTasks.filter((task) => task.dueDate && task.dueDate >= today)
    .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? '') || (a.dueTime ?? '23:59').localeCompare(b.dueTime ?? '23:59'));
  const projectNames = Object.fromEntries(projects.map((project) => [project.id, project.name]));

  return (
    <>
      <PageLayout
        maxWidthClassName="max-w-6xl"
        header={(
          <header className="flex items-end justify-between gap-4">
            <div><p className="text-xs font-medium text-muted-foreground">Your workspace</p><h1 className="font-heading text-[28px] leading-tight tracking-tight">Dashboard</h1></div>
            <p className="hidden text-xs text-muted-foreground sm:block">{new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())}</p>
          </header>
        )}
      />

      <div className="mx-auto w-full max-w-6xl">
        {failed ? (
          <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive-soft p-5 text-sm text-destructive">
            Could not load your dashboard.
            <Button type="button" variant="outline" size="sm" className="ml-3" onClick={() => {
              void allProjects.refetch();
              taskQueries.filter((query) => query.isError).forEach((query) => void query.refetch());
            }}>Retry</Button>
          </div>
        ) : loading ? (
          <div aria-label="Loading dashboard" className="space-y-3">
            <Skeleton className="h-28" />
            <div className="grid gap-3 lg:grid-cols-2"><Skeleton className="h-72" /><Skeleton className="h-72" /></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-xl border border-border bg-card px-5 py-10 text-center shadow-[0_12px_32px_-24px_rgba(32,25,16,0.5)]">
            <h2 className="font-heading text-xl">Nothing on the board yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">Your projects and deadlines will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <DashboardKpis projects={projects} tasks={tasks} today={today} overdueCount={overdue.length} />
            <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(19rem,1fr)]">
              <DeadlineRhythm tasks={openTasks} />
              <DashboardTaskList title="Next on the calendar" description="The closest dates on your boards" tasks={upcoming.slice(0, 4)} projectNames={projectNames} emptyMessage="Nothing scheduled." />
            </div>
            <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(19rem,1fr)]">
              <ProjectProgressChart projects={projects} />
              <DashboardTaskList title="Needs attention" description="Past their due date" tasks={overdue.slice(0, 4)} projectNames={projectNames} emptyMessage="All caught up." overdue />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
