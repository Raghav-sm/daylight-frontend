'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/features/projects/api';
import type { ProjectColor } from '@/features/projects/types';

export const projectKeys = {
  list: () => ['projects', 'list'],
  byId: (id: string) => ['projects', id],
};

type CreateProjectInput = {
  name: string;
  color: ProjectColor;
};

type UpdateProjectInput = {
  projectId: string;
  changes: { name?: string; color?: ProjectColor; initialStageId?: string; finalStageId?: string };
};

type AddStageInput = {
  projectId: string;
  name: string;
  color: ProjectColor;
};

type DeleteStageInput = {
  projectId: string;
  stageId: string;
  targetStageId?: string;
};

export function useProjects() {
  return useQuery({
    queryKey: projectKeys.list(),
    queryFn: ({ signal }) => projectsApi.getSummaries(signal),
  });
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: projectKeys.byId(id ?? ''),
    queryFn: ({ signal }) => projectsApi.getById(id!, signal),
    enabled: Boolean(id),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProjectInput) => projectsApi.create(input.name, input.color),
    onSuccess: (project) => {
      const projectCacheKey = projectKeys.byId(project.id);
      queryClient.setQueryData(projectCacheKey, project);
      queryClient.invalidateQueries({ queryKey: projectKeys.list() });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProjectInput) => projectsApi.update(input.projectId, input.changes),
    onSuccess: (project) => {
      const projectCacheKey = projectKeys.byId(project.id);
      queryClient.setQueryData(projectCacheKey, project);
      queryClient.invalidateQueries({ queryKey: ['tasks', 'project', project.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'], exact: false });
      queryClient.invalidateQueries({ queryKey: projectKeys.list() });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) => projectsApi.delete(projectId),
    onSuccess: (_data, projectId) => {
      const projectCacheKey = projectKeys.byId(projectId);
      queryClient.removeQueries({ queryKey: projectCacheKey });
      queryClient.invalidateQueries({ queryKey: projectKeys.list() });
    },
  });
}

export function useAddStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AddStageInput) =>
      projectsApi.createStage(input.projectId, input.name, input.color),
    onSuccess: (_stage, input) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.list() });
      queryClient.invalidateQueries({ queryKey: projectKeys.byId(input.projectId) });
    },
  });
}

export function useDeleteStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DeleteStageInput) =>
      projectsApi.deleteStage(input.projectId, input.stageId, input.targetStageId),
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.list() });
      queryClient.invalidateQueries({ queryKey: projectKeys.byId(input.projectId) });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'project', input.projectId] });
    },
  });
}

export function useReorderStages() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { projectId: string; stageIds: string[] }) =>
      projectsApi.reorderStages(input.projectId, input.stageIds),
    onSuccess: (project) => {
      queryClient.setQueryData(projectKeys.byId(project.id), project);
    },
  });
}
