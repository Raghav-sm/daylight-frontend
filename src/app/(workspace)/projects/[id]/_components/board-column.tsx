'use client';

import { Plus } from 'lucide-react';
import AddTaskDialogButton from '@/app/(workspace)/projects/[id]/_components/add-task-dialog-button';
import { KanbanCard } from '@/components/boards/kanban-card';
import { KanbanStageHeader } from '@/components/boards/kanban-view';
import {
  KanbanColumn,
  KanbanColumnContent,
  KanbanItem,
  KanbanItemHandle,
} from '@/components/ui/kanban';
import { Button } from '@/components/ui/button';
import type { Project, ProjectStage } from '@/features/projects/types';
import type { TaskDraft, TaskSummary } from '@/features/tasks/types';

type BoardColumnProps = {
  stage: ProjectStage;
  stageIndex: number;
  tasks: TaskSummary[];
  project: Project;
  projects: Array<Pick<Project, 'id' | 'name'>>;
  pendingMoveTaskId?: string | null;
  onTaskSelect: (taskId: string) => void;
  onTaskCreate: (task: TaskDraft) => Promise<{ id: string } | null>;
};

export function BoardColumn({
  stage,
  stageIndex,
  tasks,
  project,
  projects,
  pendingMoveTaskId,
  onTaskSelect,
  onTaskCreate,
}: BoardColumnProps) {
  const count = String(tasks.length).padStart(2, '0');
  return (
    <KanbanColumn value={stage.id} data-kanban-stage-color={stageIndex % 6} className="w-full">
      <section
        aria-label={`${stage.name} stage`}
        className="kanban-stage-column flex h-full min-w-0 flex-col gap-2 rounded-2xl p-2.5 shadow-xs"
      >
        <KanbanStageHeader
          title={stage.name}
          count={count}
        />

        <KanbanColumnContent
          value={stage.id}
          aria-label={`Drop tasks in ${stage.name}`}
          className="min-h-[18rem] flex-1 gap-2.5"
        >
          {tasks.map((task) => (
            <BoardTaskItem
              key={task.id}
              task={task}
              onSelect={onTaskSelect}
              disabled={task.id === pendingMoveTaskId}
            />
          ))}
          {tasks.length === 0 && (
            <p className="kanban-stage-empty rounded-xl border border-dashed px-3 py-6 text-center text-xs text-muted-foreground">
              Drop a task here
            </p>
          )}
        </KanbanColumnContent>

        <AddTaskDialogButton
          projects={projects}
          defaultProjectId={project.id}
          defaultStageId={stage.id}
          fixedProject
          onCreate={onTaskCreate}
          trigger={(
            <Button type="button" variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
              <Plus aria-hidden="true" />
              Add task
            </Button>
          )}
        />
      </section>
    </KanbanColumn>
  );
}

export function BoardTaskItem({
  task,
  onSelect,
  disabled = false,
  isOverlay = false,
}: {
  task: TaskSummary;
  onSelect: (taskId: string) => void;
  disabled?: boolean;
  isOverlay?: boolean;
}) {
  return (
    <KanbanItem
      value={task.id}
      disabled={disabled || isOverlay}
      onClick={isOverlay ? undefined : () => onSelect(task.id)}
      className={!isOverlay ? 'cursor-pointer text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2' : undefined}
    >
      {isOverlay ? (
        <KanbanCard task={task} className="border border-border shadow-md" />
      ) : (
        <KanbanItemHandle>
          <KanbanCard task={task} className="border border-border shadow-sm transition-shadow hover:shadow-md" />
        </KanbanItemHandle>
      )}
    </KanbanItem>
  );
}
