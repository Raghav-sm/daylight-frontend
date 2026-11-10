'use client';

import { useRouter } from 'next/navigation';
import { TaskDetails } from '@/components/tasks/task-details';
import { useWorkspaceData } from '@/providers/workspace-data-provider';

export function TaskDetailsView({ taskId }: { taskId: string }) {
  const router = useRouter();
  const { tasks, projects, updateTask, deleteTask } = useWorkspaceData();
  const task = tasks.find((item) => item.id === taskId) ?? null;
  const returnToProject = () => router.push(task ? `/projects/${encodeURIComponent(task.projectId)}` : '/projects');

  return (
    <TaskDetails
      task={task}
      projects={projects}
      onSave={updateTask}
      onDelete={async (id) => {
        if (await deleteTask(id)) returnToProject();
      }}
    />
  );
}
