import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { ProjectSummary } from '@/features/projects/types';

export function ProjectCards({ projects }: { projects: ProjectSummary[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {projects.map((project) => {
        const taskCount = project.taskCount;
        const stageCount = project.stageCount;
        return (
          <Link
            key={project.id}
            href={`/projects/${encodeURIComponent(project.id)}`}
            className="group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Card
              data-project-color={project.color}
              className="gap-3 rounded-xl px-4 py-3.5 transition-colors group-hover:border-foreground/30 group-hover:bg-secondary/40"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span aria-hidden="true" className="project-color-dot size-2.5 shrink-0 rounded-full" />
                  <h3 className="font-heading truncate text-base">{project.name}</h3>
                </div>
                <ChevronRight
                  aria-hidden="true"
                  className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {taskCount} {taskCount === 1 ? 'task' : 'tasks'} <span aria-hidden="true">·</span> {stageCount}{' '}
                {stageCount === 1 ? 'stage' : 'stages'}
              </p>
              <div className="flex h-1.5 gap-1" aria-label={`${stageCount} stages`}>
                {Array.from({ length: stageCount }, (_, index) => (
                  <span
                    key={`${project.id}-stage-${index}`}
                    data-stage-color={index < 3 ? index : 3 + ((index - 3) % 3)}
                    className="min-w-0 flex-1 rounded-[3px] bg-[var(--stage)]"
                  />
                ))}
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
