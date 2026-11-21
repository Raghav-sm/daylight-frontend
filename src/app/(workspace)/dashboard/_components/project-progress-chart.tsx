import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ProjectSummary } from '@/features/projects/types';

export function ProjectProgressChart({ projects }: { projects: ProjectSummary[] }) {
  const ranked = [...projects].sort((a, b) => b.taskCount - a.taskCount).slice(0, 6);
  return (
    <Card className="gap-0 border border-border py-0 shadow-[0_12px_32px_-24px_rgba(32,25,16,0.5)] ring-0">
      <CardHeader className="px-4 pt-4 pb-2 sm:px-5"><CardTitle>Across your projects</CardTitle><p className="text-xs text-muted-foreground">Each block marks a share of the work completed</p></CardHeader>
      <CardContent className="space-y-3 px-4 pb-4 sm:px-5">
        {ranked.map((project) => {
          const completed = project.taskCount - project.incompleteTaskCount;
          const filled = project.taskCount ? Math.round(completed / project.taskCount * 12) : 0;
          return (
            <div key={project.id} data-project-color={project.color} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5">
              <Link href={`/projects/${encodeURIComponent(project.id)}`} className="flex min-w-0 items-center gap-2 text-sm font-medium hover:underline"><span className="project-color-dot size-2 shrink-0 rounded-full" /><span className="truncate">{project.name}</span><ArrowUpRight aria-hidden="true" className="size-3 shrink-0 text-muted-foreground" /></Link>
              <span className="text-xs tabular-nums text-muted-foreground">{completed} / {project.taskCount}</span>
              <div role="img" aria-label={`${project.name}: ${completed} of ${project.taskCount} tasks completed`} className="col-span-2 grid grid-cols-12 gap-1">
                {Array.from({ length: 12 }, (_, index) => <span key={index} className={`h-2 rounded-[2px] ${index < filled ? 'bg-[var(--project-color)]' : 'bg-muted'}`} />)}
              </div>
            </div>
          );
        })}
        {projects.length > ranked.length && <p className="text-xs text-muted-foreground">Showing {ranked.length} of {projects.length} projects.</p>}
      </CardContent>
    </Card>
  );
}
