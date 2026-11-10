import type { Project, ProjectColor, ProjectStage, Task, TaskDraft } from '@/lib/task-types';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
    cache: 'no-store',
  });

  if (response.status === 204) return undefined as T;

  const body = await response.json().catch(() => null) as { detail?: unknown } | null;
  if (!response.ok) {
    const detail = body?.detail;
    const message = typeof detail === 'string'
      ? detail
      : Array.isArray(detail)
        ? detail.map((item) => typeof item === 'object' && item !== null && 'msg' in item ? item.msg : String(item)).join(', ')
        : 'The request could not be completed.';
    throw new ApiError(message, response.status);
  }

  return body as T;
}

function jsonBody(value: unknown): RequestInit {
  return { body: JSON.stringify(value) };
}

export const workspaceApi = {
  getProjects() {
    return request<Project[]>('/projects');
  },

  getTasks() {
    return request<Task[]>('/tasks');
  },

  createProject(name: string, color: ProjectColor) {
    return request<Project>('/projects', {
      method: 'POST',
      ...jsonBody({ name, color }),
    });
  },

  updateProject(projectId: string, changes: { name: string; color: ProjectColor }) {
    return request<Project>(`/projects/${encodeURIComponent(projectId)}`, {
      method: 'PATCH',
      ...jsonBody(changes),
    });
  },

  deleteProject(projectId: string) {
    return request<void>(`/projects/${encodeURIComponent(projectId)}`, { method: 'DELETE' });
  },

  createTask(draft: TaskDraft) {
    const { projectId, ...taskData } = draft;
    return request<Task>(`/projects/${encodeURIComponent(projectId)}/tasks`, {
      method: 'POST',
      ...jsonBody(taskData),
    });
  },

  updateTask(task: Task) {
    const { id, ...taskData } = task;
    return request<Task>(`/tasks/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      ...jsonBody(taskData),
    });
  },

  updateTaskStage(taskId: string, stageId: string) {
    return request<Task>(`/tasks/${encodeURIComponent(taskId)}`, {
      method: 'PATCH',
      ...jsonBody({ stageId }),
    });
  },

  deleteTask(taskId: string) {
    return request<void>(`/tasks/${encodeURIComponent(taskId)}`, { method: 'DELETE' });
  },

  createStage(projectId: string, name: string, color: ProjectColor) {
    return request<ProjectStage>(`/projects/${encodeURIComponent(projectId)}/stages`, {
      method: 'POST',
      ...jsonBody({ name, color }),
    });
  },
};

export { ApiError };
