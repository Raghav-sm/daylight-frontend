'use client';

import { useDraggable } from '@dnd-kit/core';
import { KanbanCard } from '@/app/(workspace)/projects/[id]/_components/kanban-card';
import { cn } from '@/lib/utils';
import type { Task } from '@/lib/task-types';

export function TaskCardPreview({
  task,
  className,
}: {
  task: Task;
  className?: string;
}) {
  return <KanbanCard task={task} className={className} />;
}

export function TaskCard({
  task,
  onSelect,
}: {
  task: Task;
  onSelect: (taskId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { type: 'task', stageId: task.stageId },
  });

  return (
    <article
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        'w-full cursor-grab touch-none active:cursor-grabbing',
        isDragging && 'opacity-40',
      )}
    >
      <button
        type="button"
        onClick={() => onSelect(task.id)}
        className="w-full cursor-pointer text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <KanbanCard task={task} />
      </button>
    </article>
  );
}
