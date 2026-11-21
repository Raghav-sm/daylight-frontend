'use client';

import { useState } from 'react';
import AddStageDialogButton from '@/app/(workspace)/projects/[id]/_components/add-stage-dialog-button';
import { ProjectSettingsDialog, type ProjectSettingsView } from '@/components/projects/project-settings-dialog';
import type { Project, ProjectColor } from '@/features/projects/types';

type BoardToolbarProps = {
  project: Project;
  projects: Array<Pick<Project, 'id' | 'name' | 'color'>>;
  onAddStage: (name: string, color: ProjectColor) => Promise<boolean>;
  onProjectSave: (projectId: string, name: string, color: ProjectColor) => Promise<boolean>;
  onProjectDelete: (projectId: string) => Promise<boolean>;
  stageTaskCounts: Record<string, number>;
  stageTaskCountsReady: boolean;
  onStageDelete: (stageId: string, targetStageId?: string) => Promise<boolean>;
};

export default function BoardToolbar({
  project,
  projects,
  onAddStage,
  onProjectSave,
  onProjectDelete,
  stageTaskCounts,
  stageTaskCountsReady,
  onStageDelete,
}: BoardToolbarProps) {
  const [settingsView, setSettingsView] = useState<ProjectSettingsView>('settings');

  return (
    <div className="flex items-center gap-2">
      <ProjectSettingsDialog
        project={project}
        projects={projects}
        onSave={onProjectSave}
        onDelete={onProjectDelete}
        stageTaskCounts={stageTaskCounts}
        stageTaskCountsReady={stageTaskCountsReady}
        onStageDelete={onStageDelete}
        view={settingsView}
        onViewChange={setSettingsView}
      />
      <AddStageDialogButton projectName={project.name} onCreate={onAddStage} />
    </div>
  );
}
