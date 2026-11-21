'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Board as ProjectKanban } from '@/app/(workspace)/projects/[id]/_components/board';
import AddStageDialog from '@/app/(workspace)/projects/[id]/_components/add-stage-dialog-button';
import {
  ProjectSettingsDialog as EditProjectDialog,
  type ProjectSettingsView,
} from '@/components/projects/project-settings-dialog';
import { PageLayout } from '@/components/layout/page-layout';
import {
  useAddStage,
  useDeleteStage,
  useDeleteProject,
  useProject,
  useProjects,
  useReorderStages,
  useUpdateProject,
} from '@/features/projects/data';
import { useCreateTask, useMoveTaskStage, useProjectTasks } from '@/features/tasks/data';
import type { ProjectColor } from '@/features/projects/types';
import type { TaskDraft } from '@/features/tasks/types';

async function tryAction(action: Promise<unknown>) {
  try {
    await action;
    return true;
  } catch {
    return false;
  }
}

export default function ProjectBoardPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const router = useRouter();

  const currentProject = useProject(projectId);
  const boardTasks = useProjectTasks(projectId);
  const allProjects = useProjects();

  const createTask = useCreateTask();
  const moveTaskStage = useMoveTaskStage();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const addStage = useAddStage();
  const deleteStage = useDeleteStage();
  const reorderStages = useReorderStages();

  const [settingsView, setSettingsView] = useState<ProjectSettingsView>('settings');
  const [moveError, setMoveError] = useState<string | null>(null);
  const [pendingMoveTaskId, setPendingMoveTaskId] = useState<string | null>(null);

  const project = currentProject.data;
  const projectSummary = allProjects.data?.find((item) => item.id === projectId);
  const stageTaskCounts = (boardTasks.data ?? []).reduce<Record<string, number>>((counts, task) => {
    if (task.stageId) counts[task.stageId] = (counts[task.stageId] ?? 0) + 1;
    return counts;
  }, {});

  async function handleTaskCreate(draft: TaskDraft) {
    try {
      return await createTask.mutateAsync({ projectId: draft.projectId, draft });
    } catch {
      return null;
    }
  }

  async function handleTaskMove(taskId: string, stageId: string) {
    if (pendingMoveTaskId === taskId) return;
    setMoveError(null);
    setPendingMoveTaskId(taskId);
    try {
      await moveTaskStage.mutateAsync({ taskId, projectId, stageId });
    } catch (error) {
      setMoveError(error instanceof Error ? error.message : 'Could not move this task. Try again.');
    } finally {
      setPendingMoveTaskId((current) => (current === taskId ? null : current));
    }
  }

  function handleAddStage(name: string, color: ProjectColor) {
    return tryAction(addStage.mutateAsync({ projectId, name, color }));
  }

  function handleProjectSave(id: string, name: string, color: ProjectColor) {
    return tryAction(updateProject.mutateAsync({ projectId: id, changes: { name, color } }));
  }

  function handleStageDelete(stageId: string, targetStageId?: string) {
    return tryAction(deleteStage.mutateAsync({ projectId, stageId, targetStageId }));
  }

  function handleStageRole(role: 'initialStageId' | 'finalStageId', stageId: string) {
    return tryAction(updateProject.mutateAsync({ projectId, changes: { [role]: stageId } }));
  }

  function handleStageOrder(stageIds: string[]) {
    return tryAction(reorderStages.mutateAsync({ projectId, stageIds }));
  }

  async function handleProjectDelete(id: string) {
    if (projectSummary && projectSummary.taskCount > 0) return false;
    const deleted = await tryAction(deleteProject.mutateAsync(id));
    if (deleted) router.push('/projects');
    return deleted;
  }

  return (
    <>
      <div className="mx-auto mb-5 flex w-full max-w-6xl flex-wrap items-end justify-between gap-4">
        <PageLayout
          maxWidthClassName="max-w-6xl"
          className="mx-0 mb-0 min-w-0 max-w-none flex-1"
          title={project ? `${project.name} board` : 'Board'}
          subtitle="Move tasks between stages by dragging them."
        />

        {project && (
          <div
            role="toolbar"
            aria-label="Project actions"
            className="flex shrink-0 items-center gap-2"
          >
            <EditProjectDialog
              project={project}
              projects={allProjects.data ?? []}
              onSave={handleProjectSave}
              onDelete={handleProjectDelete}
              stageTaskCounts={stageTaskCounts}
              stageTaskCountsReady={boardTasks.isSuccess}
              onStageDelete={handleStageDelete}
              onStageRoleChange={handleStageRole}
              onStageReorder={handleStageOrder}
              view={settingsView}
              onViewChange={setSettingsView}
            />
            <AddStageDialog
              projectName={project.name}
              onCreate={handleAddStage}
            />
          </div>
        )}
      </div>

      <div className="mx-auto w-full max-w-6xl">
        <ProjectKanban
          project={project}
          projects={allProjects.data}
          tasks={boardTasks.data}
          isLoading={currentProject.isLoading || boardTasks.isLoading}
          error={currentProject.error ?? boardTasks.error}
          onRetry={() => {
            void currentProject.refetch();
            void boardTasks.refetch();
          }}
          moveError={moveError}
          onDismissMoveError={() => setMoveError(null)}
          pendingMoveTaskId={pendingMoveTaskId}
          onTaskSelect={(taskId) => router.push(`/tasks/${encodeURIComponent(taskId)}`)}
          onTaskMove={handleTaskMove}
          onTaskCreate={handleTaskCreate}
        />
      </div>
    </>
  );
}
