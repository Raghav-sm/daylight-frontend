'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectKeys } from '@/features/projects/data';
import { tasksApi } from '@/features/tasks/api';
import type { TaskDraft, TaskSummary, TaskUpdatePayload } from '@/features/tasks/types';

export const taskKeys = {
  byId: (id: string) => ['tasks', id],
  byProject: (projectId: string) => ['tasks', 'project', projectId],
};

type CreateTaskInput = {
  projectId: string;
  draft: TaskDraft;
};

type UpdateTaskInput = {
  taskId: string;
  payload: TaskUpdatePayload;
  sourceProjectId?: string;
};

type MoveTaskStageInput = {
  taskId: string;
  projectId: string;
  stageId: string;
};

type DeleteTaskInput = {
  taskId: string;
  projectId: string;
};

export function useTask(id: string | undefined) {
  return useQuery({
    queryKey: taskKeys.byId(id ?? ''),
    queryFn: ({ signal }) => tasksApi.getById(id!, signal),
    enabled: Boolean(id),
  });
}

export function useProjectTasks(projectId: string | undefined) {
  return useQuery({
    queryKey: taskKeys.byProject(projectId ?? ''),
    queryFn: ({ signal }) => tasksApi.getProjectSummaries(projectId!, signal),
    enabled: Boolean(projectId),
  });
}

function invalidateTaskLists(
  queryClient: ReturnType<typeof useQueryClient>,
  projectIds: string[],
) {
  queryClient.invalidateQueries({ queryKey: projectKeys.list() });
  for (const projectId of projectIds) {
    if (projectId) {
      queryClient.invalidateQueries({ queryKey: taskKeys.byProject(projectId) });
    }
  }
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTaskInput) => tasksApi.create(input.projectId, input.draft),
    onSuccess: (task) => {
      const taskCacheKey = taskKeys.byId(task.id);
      queryClient.setQueryData(taskCacheKey, task);
      invalidateTaskLists(queryClient, [task.projectId]);
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateTaskInput) => tasksApi.update(input.taskId, input.payload),
    onSuccess: (task, input) => {
      const taskCacheKey = taskKeys.byId(task.id);
      queryClient.setQueryData(taskCacheKey, task);

      const affectedProjects = new Set<string>();
      if (input.sourceProjectId) affectedProjects.add(input.sourceProjectId);
      if (task.projectId) affectedProjects.add(task.projectId);
      if (input.payload.projectId) affectedProjects.add(input.payload.projectId);
      invalidateTaskLists(queryClient, [...affectedProjects]);

      if (input.sourceProjectId && task.projectId !== input.sourceProjectId) {
        queryClient.invalidateQueries({ queryKey: projectKeys.byId(task.projectId) });
        queryClient.invalidateQueries({ queryKey: projectKeys.byId(input.sourceProjectId) });
      }
    },
  });
}

export function useMoveTaskStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: MoveTaskStageInput) => tasksApi.update(input.taskId, { stageId: input.stageId }),

    onMutate: async (input) => {
      const boardCacheKey = taskKeys.byProject(input.projectId);
      await queryClient.cancelQueries({ queryKey: boardCacheKey });

      const previousTasks = queryClient.getQueryData<TaskSummary[]>(boardCacheKey);

      queryClient.setQueryData<TaskSummary[]>(boardCacheKey, (current = []) =>
        current.map((task) => (task.id === input.taskId ? { ...task, stageId: input.stageId } : task)),
      );

      return { previousTasks };
    },

    onError: (_error, input, context) => {
      if (context?.previousTasks) {
        const boardCacheKey = taskKeys.byProject(input.projectId);
        queryClient.setQueryData(boardCacheKey, context.previousTasks);
      }
    },

    onSuccess: (task) => {
      const taskCacheKey = taskKeys.byId(task.id);
      queryClient.setQueryData(taskCacheKey, task);
    },

    onSettled: (_data, _error, input) => {
      invalidateTaskLists(queryClient, [input.projectId]);
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DeleteTaskInput) => tasksApi.delete(input.taskId),
    onSuccess: (_data, input) => {
      const taskCacheKey = taskKeys.byId(input.taskId);
      queryClient.removeQueries({ queryKey: taskCacheKey });
      invalidateTaskLists(queryClient, [input.projectId]);
    },
  });
}
