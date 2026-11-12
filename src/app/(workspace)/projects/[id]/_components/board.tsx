'use client';

import { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { BoardColumn } from '@/app/(workspace)/projects/[id]/_components/board-column';
import { TaskCardPreview } from '@/app/(workspace)/projects/[id]/_components/task-card';
import type { Project, Task, TaskDraft } from '@/lib/task-types';

type BoardProps = {
  project: Project;
  projects: Project[];
  tasks: Task[];
  onTaskSelect: (taskId: string) => void;
  onTaskMove: (taskId: string, stageId: string) => void;
  onTaskCreate: (task: TaskDraft) => Promise<Task | null>;
};

export function Board({
  project,
  projects,
  tasks,
  onTaskSelect,
  onTaskMove,
  onTaskCreate,
}: BoardProps) {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const tasksByStage = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const stage of project.stages) {
      map.set(stage.id, []);
    }
    for (const task of tasks) {
      if (!task.stageId) continue;
      const stageTasks = map.get(task.stageId);
      if (stageTasks) stageTasks.push(task);
    }
    return map;
  }, [project.stages, tasks]);

  const activeTask = activeTaskId
    ? tasks.find((task) => task.id === activeTaskId) ?? null
    : null;

  function resolveStageId(overId: string | number | undefined) {
    if (overId == null) return null;
    const id = String(overId);
    if (project.stages.some((stage) => stage.id === id)) return id;
    return tasks.find((task) => task.id === id)?.stageId ?? null;
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveTaskId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTaskId(null);
    if (!over) return;

    const taskId = String(active.id);
    const task = tasks.find((item) => item.id === taskId);
    const targetStageId = resolveStageId(over.id);
    if (!task || !targetStageId || task.stageId === targetStageId) return;

    onTaskMove(taskId, targetStageId);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveTaskId(null)}
    >
      <div className="flex min-h-[60vh] items-start gap-4 overflow-x-auto pb-4">
        {project.stages.map((stage, index) => (
          <BoardColumn
            key={stage.id}
            stage={stage}
            stageIndex={index}
            tasks={tasksByStage.get(stage.id) ?? []}
            project={project}
            projects={projects}
            onTaskSelect={onTaskSelect}
            onTaskCreate={onTaskCreate}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? (
          <TaskCardPreview task={activeTask} className="w-72 rotate-2 shadow-md" />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
