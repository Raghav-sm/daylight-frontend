'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Ellipsis, Files, Trash2 } from 'lucide-react';
import { useCreateTask, useDeleteTask, useUpdateTask } from '@/features/tasks/data';
import type { Task } from '@/features/tasks/types';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function TaskHeaderMenu({ task }: { task: Task | undefined }) {
  const router = useRouter();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [status, setStatus] = useState('');

  if (!task) return null;
  const currentTask = task;

  async function duplicateTask() {
    setStatus('');
    try {
      const duplicate = await createTask.mutateAsync({
        projectId: currentTask.projectId,
        draft: {
          title: `${currentTask.title} (copy)`,
          notes: currentTask.notes,
          projectId: currentTask.projectId,
          stageId: currentTask.stageId,
          dueDate: currentTask.dueDate,
          dueTime: currentTask.dueTime,
          priority: currentTask.priority,
        },
      });
      if (currentTask.completed || currentTask.subtasks.length > 0) {
        await updateTask.mutateAsync({
          taskId: duplicate.id,
          sourceProjectId: currentTask.projectId,
          payload: {
            completed: currentTask.completed,
            subtasks: currentTask.subtasks.map(({ title, completed }) => ({ title, completed })),
          },
        });
      }
      setStatus('Task duplicated.');
    } catch {
      setStatus('Could not duplicate this task. Try again.');
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setStatus('Task link copied.');
    } catch {
      setStatus('Could not copy the task link.');
    }
  }

  async function confirmDelete() {
    setDeleteError('');
    try {
      await deleteTask.mutateAsync({ taskId: currentTask.id, projectId: currentTask.projectId });
      setDeleteOpen(false);
      router.push(`/projects/${encodeURIComponent(currentTask.projectId)}`);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Could not delete this task.');
    }
  }

  return (
    <>
      <div className="flex shrink-0 items-center gap-2">
        <span role="status" aria-live="polite" className="max-w-40 truncate text-xs text-muted-foreground">{status}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Task actions">
              <Ellipsis aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onSelect={() => void duplicateTask()} disabled={createTask.isPending || updateTask.isPending}>
              <Files aria-hidden="true" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => void copyLink()}>
              <Copy aria-hidden="true" />
              Copy link
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => {
                setDeleteError('');
                setDeleteOpen(true);
              }}
            >
              <Trash2 aria-hidden="true" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &apos;{currentTask.title}&apos;?</AlertDialogTitle>
            <AlertDialogDescription>This task and its subtasks will be removed.</AlertDialogDescription>
            {deleteError && <p role="alert" className="text-sm text-destructive">{deleteError}</p>}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button type="button" variant="secondary" size="sm" disabled={deleteTask.isPending}>Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={deleteTask.isPending}
                onClick={(event) => {
                  event.preventDefault();
                  void confirmDelete();
                }}
              >
                {deleteTask.isPending ? 'Deleting…' : 'Delete'}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
