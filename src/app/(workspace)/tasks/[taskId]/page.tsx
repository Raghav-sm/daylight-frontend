'use client';

import { useParams } from 'next/navigation';
import { TaskDetails } from '@/app/(workspace)/tasks/[taskId]/_components/task-details';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTask } from '@/features/tasks/data';

export default function TaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const currentTask = useTask(taskId);
  const task = currentTask.data;

  return (
    <div className="mx-auto flex min-h-[calc(100svh-7rem)] w-full max-w-6xl flex-col">
      {currentTask.isLoading ? (
        <div aria-label="Loading task" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-56 w-full rounded-xl" />
          </div>
        </div>
      ) : currentTask.error ? (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive-soft px-4 py-3 text-sm text-destructive"
        >
          <span>
            {currentTask.error instanceof Error
              ? currentTask.error.message
              : 'Could not load this task.'}
          </span>
          <Button type="button" variant="outline" size="sm" onClick={() => void currentTask.refetch()}>
            Retry
          </Button>
        </div>
      ) : !task ? (
        <Card className="rounded-xl px-6 py-12 text-center text-sm text-muted-foreground">
          Task not found. It may have been deleted.
        </Card>
      ) : (
        <TaskDetails key={task.id} task={task} />
      )}
    </div>
  );
}
