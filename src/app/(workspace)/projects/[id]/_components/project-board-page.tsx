'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Board } from '@/app/(workspace)/projects/[id]/_components/board';
import BoardToolbar from '@/app/(workspace)/projects/[id]/_components/toolbar';
import { PageLayout } from '@/components/layout/page-layout';
import {
  useAddStage,
  useDeleteProject,
  useProjectDetail,
  useProjectSummaries,
  useUpdateProject,
} from '@/features/projects/data';
import { useCreateTask, useMoveTaskStage, useProjectTaskSummaries } from '@/features/tasks/data';
import type { ProjectSummary } from '@/features/projects/types';
import type { TaskDraft } from '@/features/tasks/types';

export function ProjectBoardPage({ projectId }: { projectId: string }) {
  const router = useRouter();
  const {
    data: project,
    isLoading: projectLoading,
    isError: projectError,
    refetch: refetchProject,
  } = useProjectDetail(projectId);
  const {
    data: tasks = [],
    isLoading: tasksLoading,
    isError: tasksError,
    refetch: refetchTasks,
  } = useProjectTaskSummaries(projectId);
  const { data: summaries = [] } = useProjectSummaries();

  const createTask = useCreateTask();
  const moveTaskStage = useMoveTaskStage();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const addStage = useAddStage();

  const [moveError, setMoveError] = useState<string | null>(null);
  const [pendingMoveTaskId, setPendingMoveTaskId] = useState<string | null>(null);

  const projectsForDialogs = summaries.map((item) => ({ id: item.id, name: item.name }));
  const projectsForSettings = summaries.map((item: ProjectSummary) => ({
    id: item.id,
    name: item.name,
    color: item.color,
  }));

  if (projectLoading || tasksLoading) {
    return (
      <PageLayout
        maxWidthClassName="max-w-6xl"
        title="Loading board…"
        subtitle="Fetching project stages and tasks."
      >
        <p className="text-sm text-muted-foreground">Loading…</p>
      </PageLayout>
    );
  }

  if (projectError || tasksError) {
    return (
      <PageLayout
        maxWidthClassName="max-w-6xl"
        title="Could not load board"
        subtitle="Something went wrong while loading this project."
      >
        <p role="alert" className="text-sm text-destructive">
          The board could not be loaded.{' '}
          <button
            type="button"
            className="underline"
            onClick={() => {
              void refetchProject();
              void refetchTasks();
            }}
          >
            Retry
          </button>
        </p>
      </PageLayout>
    );
  }

  if (!project) {
    return (
      <PageLayout
        maxWidthClassName="max-w-6xl"
        title="Project not found"
        subtitle="This project may have been deleted."
      >
        <p className="text-sm text-muted-foreground">Choose another project from the list.</p>
      </PageLayout>
    );
  }

  const summary = summaries.find((item) => item.id === projectId);

  async function handleTaskCreate(draft: TaskDraft) {
    try {
      const task = await createTask.mutateAsync({ projectId: draft.projectId, draft });
      return task;
    } catch {
      return null;
    }
  }

  async function handleTaskMove(taskId: string, stageId: string) {
    if (pendingMoveTaskId === taskId) return;
    setMoveError(null);
    setPendingMoveTaskId(taskId);
    try {
      await moveTaskStage.mutateAsync({ taskId, stageId });
    } catch (error) {
      setMoveError(error instanceof Error ? error.message : 'Could not move this task. Try again.');
    } finally {
      setPendingMoveTaskId((current) => (current === taskId ? null : current));
    }
  }

  return (
    <PageLayout
      maxWidthClassName="max-w-6xl"
      title={`${project.name} board`}
      subtitle="Move tasks between stages by dragging them."
      headerActions={(
        <BoardToolbar
          project={project}
          projects={projectsForSettings}
          onAddStage={async (name, color) => {
            try {
              await addStage.mutateAsync({ projectId: project.id, name, color });
              return true;
            } catch {
              return false;
            }
          }}
          onProjectSave={async (id, name, color) => {
            try {
              await updateProject.mutateAsync({ projectId: id, changes: { name, color } });
              return true;
            } catch {
              return false;
            }
          }}
          onProjectDelete={async (id) => {
            if (summary && summary.taskCount > 0) return false;
            try {
              await deleteProject.mutateAsync(id);
              router.push('/projects');
              return true;
            } catch {
              return false;
            }
          }}
        />
      )}
    >
      <div className="border-t border-border/70 pt-4">
        {moveError && (
          <div
            role="alert"
            className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-destructive/30 bg-destructive-soft px-4 py-3 text-sm text-destructive"
          >
            <span>{moveError}</span>
            <button type="button" className="underline" onClick={() => setMoveError(null)}>
              Dismiss
            </button>
          </div>
        )}
        <Board
          project={project}
          projects={projectsForDialogs}
          tasks={tasks}
          pendingMoveTaskId={pendingMoveTaskId}
          onTaskSelect={(taskId) => router.push(`/tasks/${encodeURIComponent(taskId)}`)}
          onTaskMove={handleTaskMove}
          onTaskCreate={handleTaskCreate}
        />
      </div>
    </PageLayout>
  );
}
