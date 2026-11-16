import { request } from '@/lib/api-client';
import type { Task, TaskDraft, TaskSummary, TaskUpdatePayload } from '@/features/tasks/types';

function jsonBody(value: unknown): RequestInit {
  return { body: JSON.stringify(value) };
}

export const tasksApi = {
  getById(id: string, signal?: AbortSignal) {
    return request<Task>(`/tasks/${encodeURIComponent(id)}`, { signal });
  },

  getProjectSummaries(projectId: string, signal?: AbortSignal) {
    return request<TaskSummary[]>(
      `/projects/${encodeURIComponent(projectId)}/tasks/summary`,
      { signal },
    );
  },

  create(projectId: string, draft: TaskDraft) {
    const { projectId: draftProjectId, ...taskData } = draft;
    void draftProjectId;
    return request<Task>(`/projects/${encodeURIComponent(projectId)}/tasks`, {
      method: 'POST',
      ...jsonBody(taskData),
    });
  },

  update(taskId: string, payload: TaskUpdatePayload) {
    return request<Task>(`/tasks/${encodeURIComponent(taskId)}`, {
      method: 'PATCH',
      ...jsonBody(payload),
    });
  },

  delete(taskId: string) {
    return request<void>(`/tasks/${encodeURIComponent(taskId)}`, { method: 'DELETE' });
  },
};
