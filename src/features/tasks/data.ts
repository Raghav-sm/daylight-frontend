'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectKeys } from '@/features/projects/data';
import { tasksApi } from '@/features/tasks/api';
import type { TaskDraft, TaskUpdatePayload } from '@/features/tasks/types';

export const taskKeys = {
  all: ['tasks'] as const,
  detail: (id: string) => [...taskKeys.all, 'detail', id] as const,
  projectSummaries: (projectId: string) =>
    [...taskKeys.all, 'projectSummaries', projectId] as const,
};

export function useTaskDetail(id: string | undefined) {
  return useQuery({
    queryKey: taskKeys.detail(id ?? ''),
    queryFn: ({ signal }) => tasksApi.getById(id!, signal),
    enabled: Boolean(id),
  });
}

export function useProjectTaskSummaries(projectId: string | undefined) {
  return useQuery({
    queryKey: taskKeys.projectSummaries(projectId ?? ''),
    queryFn: ({ signal }) => tasksApi.getProjectSummaries(projectId!, signal),
    enabled: Boolean(projectId),
  });
}

function invalidateTaskListCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  projectIds: string[],
) {
  queryClient.invalidateQueries({ queryKey: projectKeys.summaries() });
  for (const projectId of projectIds) {
    if (projectId) {
      queryClient.invalidateQueries({ queryKey: taskKeys.projectSummaries(projectId) });
    }
  }
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, draft }: { projectId: string; draft: TaskDraft }) =>
      tasksApi.create(projectId, draft),
    onSuccess: (task) => {
      queryClient.setQueryData(taskKeys.detail(task.id), task);
      invalidateTaskListCaches(queryClient, [task.projectId]);
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      taskId: string;
      payload: TaskUpdatePayload;
      sourceProjectId?: string;
    }) => tasksApi.update(vars.taskId, vars.payload),
    onSuccess: (task, variables) => {
      queryClient.setQueryData(taskKeys.detail(task.id), task);
      const projectIds = new Set<string>();
      if (variables.sourceProjectId) projectIds.add(variables.sourceProjectId);
      if (task.projectId) projectIds.add(task.projectId);
      if (variables.payload.projectId) projectIds.add(variables.payload.projectId);
      invalidateTaskListCaches(queryClient, [...projectIds]);
      if (task.projectId !== variables.sourceProjectId && variables.sourceProjectId) {
        queryClient.invalidateQueries({ queryKey: projectKeys.detail(task.projectId) });
        queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.sourceProjectId) });
      }
    },
  });
}

export function useMoveTaskStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, stageId }: { taskId: string; stageId: string }) =>
      tasksApi.update(taskId, { stageId }),
    onSuccess: (task) => {
      queryClient.setQueryData(taskKeys.detail(task.id), task);
      invalidateTaskListCaches(queryClient, [task.projectId]);
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { taskId: string; projectId: string }) =>
      tasksApi.delete(vars.taskId),
    onSuccess: (_data, { taskId, projectId }) => {
      queryClient.removeQueries({ queryKey: taskKeys.detail(taskId) });
      invalidateTaskListCaches(queryClient, [projectId]);
    },
  });
}
