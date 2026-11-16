'use client';

import AddStageDialogButton from '@/app/(workspace)/projects/[id]/_components/add-stage-dialog-button';
import { ProjectSettingsDialog } from '@/components/projects/project-settings-dialog';
import type { Project, ProjectColor } from '@/features/projects/types';

type BoardToolbarProps = {
  project: Project;
  projects: Array<Pick<Project, 'id' | 'name' | 'color'>>;
  onAddStage: (name: string, color: ProjectColor) => Promise<boolean>;
  onProjectSave: (projectId: string, name: string, color: ProjectColor) => Promise<boolean>;
  onProjectDelete: (projectId: string) => Promise<boolean>;
};

export default function BoardToolbar({
  project,
  projects,
  onAddStage,
  onProjectSave,
  onProjectDelete,
}: BoardToolbarProps) {
  return (
    <div className="flex items-center gap-2">
      <ProjectSettingsDialog
        project={project}
        projects={projects}
        onSave={onProjectSave}
        onDelete={onProjectDelete}
      />
      <AddStageDialogButton projectName={project.name} onCreate={onAddStage} />
    </div>
  );
}
