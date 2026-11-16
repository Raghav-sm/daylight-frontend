'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/features/projects/api';
import type { ProjectColor } from '@/features/projects/types';

export const projectKeys = {
  all: ['projects'] as const,
  summaries: () => [...projectKeys.all, 'summaries'] as const,
  detail: (id: string) => [...projectKeys.all, 'detail', id] as const,
};

export function useProjectSummaries() {
  return useQuery({
    queryKey: projectKeys.summaries(),
    queryFn: ({ signal }) => projectsApi.getSummaries(signal),
  });
}

export function useProjectDetail(id: string | undefined) {
  return useQuery({
    queryKey: projectKeys.detail(id ?? ''),
    queryFn: ({ signal }) => projectsApi.getById(id!, signal),
    enabled: Boolean(id),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, color }: { name: string; color: ProjectColor }) =>
      projectsApi.create(name, color),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.summaries() });
      queryClient.setQueryData(projectKeys.detail(project.id), project);
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      changes,
    }: {
      projectId: string;
      changes: { name?: string; color?: ProjectColor };
    }) => projectsApi.update(projectId, changes),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.summaries() });
      queryClient.setQueryData(projectKeys.detail(project.id), project);
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) => projectsApi.delete(projectId),
    onSuccess: (_data, projectId) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.summaries() });
      queryClient.removeQueries({ queryKey: projectKeys.detail(projectId) });
    },
  });
}

export function useAddStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      name,
      color,
    }: {
      projectId: string;
      name: string;
      color: ProjectColor;
    }) => projectsApi.createStage(projectId, name, color),
    onSuccess: (_stage, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.summaries() });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
    },
  });
}
