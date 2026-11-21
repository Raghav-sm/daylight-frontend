import { request } from '@/lib/api-client';
import type { Project, ProjectColor, ProjectStage, ProjectSummary } from '@/features/projects/types';

export const projectsApi = {
  getSummaries(signal?: AbortSignal) {
    return request<ProjectSummary[]>('/projects/summary', { signal });
  },

  getAll(signal?: AbortSignal) {
    return request<Project[]>('/projects', { signal });
  },

  getById(id: string, signal?: AbortSignal) {
    return request<Project>(`/projects/${encodeURIComponent(id)}`, { signal });
  },

  create(name: string, color: ProjectColor) {
    return request<Project>('/projects', {
      method: 'POST',
      body: { name, color },
    });
  },

  update(projectId: string, changes: { name?: string; color?: ProjectColor; initialStageId?: string; finalStageId?: string }) {
    return request<Project>(`/projects/${encodeURIComponent(projectId)}`, {
      method: 'PATCH',
      body: changes,
    });
  },

  delete(projectId: string) {
    return request<void>(`/projects/${encodeURIComponent(projectId)}`, { method: 'DELETE' });
  },

  createStage(projectId: string, name: string, color: ProjectColor) {
    return request<ProjectStage>(`/projects/${encodeURIComponent(projectId)}/stages`, {
      method: 'POST',
      body: { name, color },
    });
  },

  reorderStages(projectId: string, stageIds: string[]) {
    return request<Project>(`/projects/${encodeURIComponent(projectId)}/stages/order`, {
      method: 'PUT',
      body: { stageIds },
    });
  },

  deleteStage(projectId: string, stageId: string, targetStageId?: string) {
    const query = targetStageId ? `?target_stage_id=${encodeURIComponent(targetStageId)}` : '';
    return request<void>(
      `/projects/${encodeURIComponent(projectId)}/stages/${encodeURIComponent(stageId)}${query}`,
      { method: 'DELETE' },
    );
  },
};
