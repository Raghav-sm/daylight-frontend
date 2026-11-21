import Link from 'next/link';
import type { ProjectSummary } from '@/features/projects/types';
import './project-folder-card.css';

type ProjectFolderCardProps = {
  project: ProjectSummary;
};

export function ProjectFolderCard({ project }: ProjectFolderCardProps) {
  return (
    <Link
      href={`/projects/${encodeURIComponent(project.id)}`}
      data-project-color={project.color}
      className="project-folder"
      aria-label={`${project.name}, ${project.taskCount} tasks, ${project.stageCount} stages`}
    >
      <span className="project-folder-tab" aria-hidden="true" />
      <div className="project-folder-surface">
        <h3 className="project-folder-name">{project.name}</h3>
        <div className="project-folder-meta" aria-hidden="true">
          <span>{project.taskCount} {project.taskCount === 1 ? 'task' : 'tasks'}</span>
          <span>{project.stageCount} {project.stageCount === 1 ? 'stage' : 'stages'}</span>
        </div>
      </div>
    </Link>
  );
}
