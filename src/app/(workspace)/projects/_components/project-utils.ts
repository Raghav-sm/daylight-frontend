import type { Task } from '@/lib/task-types';

export function projectTaskCount(tasks: Task[], projectId: string) {
  return tasks.filter((task) => task.projectId === projectId).length;
}
