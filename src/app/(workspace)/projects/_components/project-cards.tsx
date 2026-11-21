import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { ProjectSummary } from '@/features/projects/types';
import { ProjectFolderCard } from './project-folder-card';

type ProjectCardsProps = {
  projects?: ProjectSummary[];
  isLoading?: boolean;
  loadingCount?: number;
  error?: unknown;
  onRetry?: () => void;
  emptyMessage?: ReactNode;
};

export function ProjectCards({
  projects = [],
  isLoading = false,
  loadingCount = 4,
  error,
  onRetry,
  emptyMessage = 'No projects yet.',
}: ProjectCardsProps) {
  if (isLoading) {
    return (
      <div aria-label="Loading projects" className="grid gap-x-4 gap-y-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: loadingCount }, (_, index) => (
          <div key={`loading-card-${index}`} className="project-folder">
            <span className="project-folder-tab" aria-hidden="true" />
            <div className="project-folder-surface">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    const message = error instanceof Error ? error.message : 'Could not load projects.';
    return (
      <div
        role="alert"
        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive-soft px-4 py-3 text-sm text-destructive"
      >
        <span>{message}</span>
        {onRetry && (
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        )}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <Card className="rounded-xl px-6 py-12 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </Card>
    );
  }

  return (
    <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {projects.map((project) => <ProjectFolderCard key={project.id} project={project} />)}
    </div>
  );
}
