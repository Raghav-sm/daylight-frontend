'use client';

import { useDroppable } from '@dnd-kit/core';
import { Circle, CircleCheck, CircleDot, CircleEllipsis, Plus } from 'lucide-react';
import AddTaskDialogButton from '@/app/(workspace)/projects/[id]/_components/add-task-dialog-button';
import { TaskCard } from '@/app/(workspace)/projects/[id]/_components/task-card';
import { Button } from '@/components/ui/button';
import type { Project, ProjectStage, Task, TaskDraft } from '@/lib/task-types';

const KANBAN_TONES = ['muted', 'orange', 'violet', 'blue'] as const;

type KanbanTone = (typeof KANBAN_TONES)[number];

function kanbanTone(index: number): KanbanTone {
  return KANBAN_TONES[index % KANBAN_TONES.length];
}

function StageIcon({
  index,
  className,
}: {
  index: number;
  className?: string;
}) {
  const iconIndex = index % KANBAN_TONES.length;
  if (iconIndex === 0) return <Circle aria-hidden="true" className={className} />;
  if (iconIndex === 1) return <CircleDot aria-hidden="true" className={className} />;
  if (iconIndex === 2) return <CircleEllipsis aria-hidden="true" className={className} />;
  return <CircleCheck aria-hidden="true" className={className} />;
}

type BoardColumnProps = {
  stage: ProjectStage;
  stageIndex: number;
  tasks: Task[];
  project: Project;
  projects: Project[];
  onTaskSelect: (taskId: string) => void;
  onTaskCreate: (task: TaskDraft) => Promise<Task | null>;
};

export function BoardColumn({
  stage,
  stageIndex,
  tasks,
  project,
  projects,
  onTaskSelect,
  onTaskCreate,
}: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
    data: { type: 'stage', stageId: stage.id },
  });
  const count = String(tasks.length).padStart(2, '0');
  const tone = kanbanTone(stageIndex);

  return (
    <section
      data-kanban-tone={tone}
      aria-label={`${stage.name} stage`}
      className="kanban-column flex w-72 shrink-0 flex-col gap-2 rounded-2xl border p-2"
    >
      <div className="flex items-center gap-2 px-2 py-1.5">
        <div className="kanban-column-title flex min-w-0 flex-1 items-center gap-2">
          <StageIcon index={stageIndex} className="size-4 shrink-0" />
          <h3 className="truncate text-sm font-medium">{stage.name}</h3>
          <span className="kanban-count shrink-0 rounded-full border px-2 py-0.5 text-xs tabular-nums">
            {count}
          </span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={`flex min-h-32 flex-1 flex-col gap-2 ${isOver ? 'rounded-xl ring-2 ring-ring/40' : ''}`}
        aria-label={`Drop tasks in ${stage.name}`}
      >
        {tasks.length === 0 ? (
          <p className="px-2 py-5 text-center text-xs text-muted-foreground">Drop a task here</p>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} onSelect={onTaskSelect} />
          ))
        )}
      </div>

      <AddTaskDialogButton
        projects={projects}
        defaultProjectId={project.id}
        defaultStageId={stage.id}
        fixedProject
        onCreate={onTaskCreate}
        trigger={(
          <Button type="button" variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
            <Plus aria-hidden="true" />
            Add Task
          </Button>
        )}
      />
    </section>
  );
}
