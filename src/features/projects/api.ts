import { request } from '@/lib/api-client';
import type { Project, ProjectColor, ProjectStage, ProjectSummary } from '@/features/projects/types';

function jsonBody(value: unknown): RequestInit {
  return { body: JSON.stringify(value) };
}

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
      ...jsonBody({ name, color }),
    });
  },

  update(projectId: string, changes: { name?: string; color?: ProjectColor }) {
    return request<Project>(`/projects/${encodeURIComponent(projectId)}`, {
      method: 'PATCH',
      ...jsonBody(changes),
    });
  },

  delete(projectId: string) {
    return request<void>(`/projects/${encodeURIComponent(projectId)}`, { method: 'DELETE' });
  },

  createStage(projectId: string, name: string, color: ProjectColor) {
    return request<ProjectStage>(`/projects/${encodeURIComponent(projectId)}/stages`, {
      method: 'POST',
      ...jsonBody({ name, color }),
    });
  },
};
