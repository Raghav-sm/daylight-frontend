'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { TaskDetails } from '@/app/(workspace)/tasks/[taskId]/_components/task-details';
import { PageLayout } from '@/components/layout/page-layout';
import { useDeleteTask, useTaskDetail } from '@/features/tasks/data';

export function TaskPage({ taskId }: { taskId: string }) {
  const router = useRouter();
  const { data: task, isLoading, isError, refetch } = useTaskDetail(taskId);
  const deleteTask = useDeleteTask();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const deleteGeneration = useRef(0);

  if (isLoading) {
    return (
      <PageLayout
        maxWidthClassName="max-w-6xl"
        title="Loading task…"
        subtitle="Fetching task details."
      >
        <p className="text-sm text-muted-foreground">Loading…</p>
      </PageLayout>
    );
  }

  if (isError) {
    return (
      <PageLayout
        maxWidthClassName="max-w-6xl"
        title="Could not load task"
        subtitle="Something went wrong."
      >
        <p role="alert" className="text-sm text-destructive">
          The task could not be loaded.{' '}
          <button type="button" className="underline" onClick={() => void refetch()}>
            Retry
          </button>
        </p>
      </PageLayout>
    );
  }

  if (!task) {
    return (
      <PageLayout
        maxWidthClassName="max-w-6xl"
        title="Task not found"
        subtitle="This task may have been deleted."
      />
    );
  }

  const currentTask = task;

  async function handleDelete() {
    const projectId = currentTask.projectId;
    const generation = ++deleteGeneration.current;
    setDeleteError(null);
    try {
      await deleteTask.mutateAsync({ taskId: currentTask.id, projectId });
      if (generation !== deleteGeneration.current) return;
      router.push(`/projects/${encodeURIComponent(projectId)}`);
    } catch (error) {
      if (generation !== deleteGeneration.current) return;
      setDeleteError(error instanceof Error ? error.message : 'Could not delete this task.');
      throw error;
    }
  }

  return (
    <PageLayout maxWidthClassName="max-w-6xl">
      <TaskDetails
        key={task.id}
        task={task}
        deletePending={deleteTask.isPending}
        deleteError={deleteError}
        onDeleteDialogOpenChange={(open) => {
          if (open) {
            deleteGeneration.current += 1;
            setDeleteError(null);
          }
        }}
        onDelete={handleDelete}
      />
    </PageLayout>
  );
}
