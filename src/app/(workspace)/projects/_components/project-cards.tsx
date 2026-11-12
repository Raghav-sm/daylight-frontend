import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { projectTaskCount } from '@/app/(workspace)/projects/_components/project-utils';
import { Card } from '@/components/ui/card';
import type { Project, Task } from '@/lib/task-types';

export function ProjectCards({ projects, tasks }: { projects: Project[]; tasks: Task[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {projects.map((project) => {
        const taskCount = projectTaskCount(tasks, project.id);
        return (
          <Link
            key={project.id}
            href={`/projects/${encodeURIComponent(project.id)}`}
            className="group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Card
              data-project-color={project.color}
              className="gap-3 rounded-lg px-5 py-4 shadow-none transition-colors group-hover:border-foreground/25 group-hover:bg-muted/20"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span aria-hidden="true" className="project-color-dot size-2.5 shrink-0 rounded-full" />
                  <h3 className="truncate text-base font-medium">{project.name}</h3>
                </div>
                <ChevronRight
                  aria-hidden="true"
                  className="size-4 shrink-0 text-muted-foreground/60 transition-colors group-hover:text-foreground"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {taskCount} {taskCount === 1 ? 'task' : 'tasks'} <span aria-hidden="true">·</span> {project.stages.length}{' '}
                {project.stages.length === 1 ? 'stage' : 'stages'}
              </p>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
