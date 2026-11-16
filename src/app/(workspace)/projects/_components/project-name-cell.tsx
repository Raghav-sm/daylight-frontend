import type { ProjectSummary } from '@/features/projects/types';

export function ProjectNameCell({ project }: { project: ProjectSummary }) {
  return (
    <span className="flex max-w-full items-center gap-2.5 font-medium">
      <span
        data-project-color={project.color}
        aria-hidden="true"
        className="project-color-dot size-2.5 shrink-0 rounded-full"
      />
      <span className="truncate">{project.name}</span>
    </span>
  );
}
