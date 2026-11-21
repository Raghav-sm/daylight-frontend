'use client';

import { useMemo } from 'react';
import { BoardColumn, BoardTaskItem } from '@/app/(workspace)/projects/[id]/_components/board-column';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Kanban, KanbanBoard, KanbanOverlay } from '@/components/ui/kanban';
import { Skeleton } from '@/components/ui/skeleton';
import type { Project } from '@/features/projects/types';
import type { TaskDraft, TaskSummary } from '@/features/tasks/types';

type BoardProps = {
  project?: Project;
  projects?: Array<Pick<Project, 'id' | 'name'>>;
  tasks?: TaskSummary[];
  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  moveError?: string | null;
  onDismissMoveError?: () => void;
  pendingMoveTaskId?: string | null;
  onTaskSelect: (taskId: string) => void;
  onTaskMove: (taskId: string, stageId: string) => void;
  onTaskCreate: (task: TaskDraft) => Promise<{ id: string } | null>;
};

export function Board({
  project,
  projects = [],
  tasks = [],
  isLoading = false,
  error,
  onRetry,
  moveError,
  onDismissMoveError,
  pendingMoveTaskId = null,
  onTaskSelect,
  onTaskMove,
  onTaskCreate,
}: BoardProps) {
  const tasksByStage = useMemo<Record<string, TaskSummary[]>>(() => {
    if (!project) return {};
    const grouped = Object.fromEntries(
      project.stages.map((stage) => [stage.id, [] as TaskSummary[]]),
    );
    for (const task of tasks) {
      if (task.stageId && grouped[task.stageId]) grouped[task.stageId].push(task);
    }
    return grouped;
  }, [project, tasks]);

  if (isLoading) {
    return (
      <div aria-label="Loading board" className="grid grid-flow-col auto-cols-[14rem] gap-3 overflow-x-auto pb-4 lg:auto-cols-[18rem]">
        {[0, 1, 2].map((index) => (
          <div key={index} className="flex flex-col gap-2.5 rounded-2xl border border-border/60 bg-muted/40 p-2.5">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    const message = error instanceof Error ? error.message : 'Could not load this board.';
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

  if (!project) {
    return (
      <Card className="rounded-xl px-6 py-12 text-center text-sm text-muted-foreground">
        Project not found. Choose another project from the sidebar.
      </Card>
    );
  }

  function handleBoardChange(nextColumns: Record<string, TaskSummary[]>) {
    if (!project) return;
    for (const stage of project.stages) {
      for (const task of nextColumns[stage.id] ?? []) {
        if (task.stageId !== stage.id && pendingMoveTaskId !== task.id) {
          onTaskMove(task.id, stage.id);
          return;
        }
      }
    }
  }

  return (
    <>
      {moveError && (
        <div
          role="alert"
          className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-destructive/30 bg-destructive-soft px-4 py-3 text-sm text-destructive"
        >
          <span>{moveError}</span>
          {onDismissMoveError && (
            <button type="button" className="underline" onClick={onDismissMoveError}>
              Dismiss
            </button>
          )}
        </div>
      )}

      <Kanban
        value={tasksByStage}
        onValueChange={handleBoardChange}
        getItemValue={(task) => task.id}
        allowSameColumnReorder={false}
        className="overflow-x-auto pb-4"
      >
        <KanbanBoard className="w-max grid-flow-col grid-cols-none auto-cols-[14rem] lg:auto-cols-[18rem]">
          {project.stages.map((stage, index) => (
            <BoardColumn
              key={stage.id}
              stage={stage}
              stageIndex={index}
              tasks={tasksByStage[stage.id] ?? []}
              project={project}
              projects={projects}
              pendingMoveTaskId={pendingMoveTaskId}
              onTaskSelect={onTaskSelect}
              onTaskCreate={onTaskCreate}
            />
          ))}
        </KanbanBoard>
        <KanbanOverlay>
          {({ value, variant }) => {
            if (variant !== 'item') return null;
            const task = tasks.find((item) => item.id === String(value));
            return task ? <BoardTaskItem task={task} onSelect={onTaskSelect} isOverlay /> : null;
          }}
        </KanbanOverlay>
      </Kanban>
    </>
  );
}
