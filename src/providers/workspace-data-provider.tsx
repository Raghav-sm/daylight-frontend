'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ApiError, workspaceApi } from '@/lib/api';
import type { Project, ProjectColor, Task, TaskDraft } from '@/lib/task-types';

type WorkspaceData = {
  projects: Project[];
  tasks: Task[];
  loading: boolean;
  error: string | null;
  clearError: () => void;
  createTask: (draft: TaskDraft) => Promise<Task | null>;
  updateTask: (task: Task) => Promise<Task | null>;
  setTaskCompletion: (taskId: string, completed: boolean) => Promise<void>;
  deleteTask: (taskId: string) => Promise<boolean>;
  createProject: (name: string, color: ProjectColor) => Promise<Project | null>;
  updateProject: (projectId: string, name: string, color: ProjectColor) => Promise<boolean>;
  addProjectStage: (projectId: string, name: string, color: ProjectColor) => Promise<boolean>;
  moveTaskToStage: (taskId: string, stageId: string) => Promise<void>;
  deleteProject: (projectId: string) => Promise<boolean>;
};

const WorkspaceDataContext = createContext<WorkspaceData | null>(null);

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

export function WorkspaceDataProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    Promise.all([workspaceApi.getProjects(), workspaceApi.getTasks()])
      .then(([loadedProjects, loadedTasks]) => {
        if (!active) return;
        setProjects(loadedProjects);
        setTasks(loadedTasks);
      })
      .catch((loadError: unknown) => {
        if (active) setError(errorMessage(loadError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<WorkspaceData>(() => ({
    projects,
    tasks,
    loading,
    error,
    clearError() {
      setError(null);
    },
    async createTask(draft) {
      setError(null);
      try {
        const createdTask = await workspaceApi.createTask(draft);
        setTasks((currentTasks) => [createdTask, ...currentTasks]);
        return createdTask;
      } catch (requestError) {
        setError(errorMessage(requestError));
        return null;
      }
    },
    async updateTask(updatedTask) {
      setError(null);
      try {
        const savedTask = await workspaceApi.updateTask(updatedTask);
        setTasks((currentTasks) => currentTasks.map((task) => task.id === savedTask.id ? savedTask : task));
        return savedTask;
      } catch (requestError) {
        setError(errorMessage(requestError));
        return null;
      }
    },
    async setTaskCompletion(taskId, completed) {
      const task = tasks.find((item) => item.id === taskId);
      if (!task) return;
      const project = projects.find((item) => item.id === task.projectId);
      const stageName = completed ? 'completed' : 'to do';
      const targetStage = project?.stages.find((stage) => stage.name.toLocaleLowerCase() === stageName);

      setError(null);
      try {
        const savedTask = await workspaceApi.updateTask({
          ...task,
          completed,
          stageId: targetStage?.id ?? task.stageId,
        });
        setTasks((currentTasks) => currentTasks.map((item) => item.id === taskId ? savedTask : item));
      } catch (requestError) {
        setError(errorMessage(requestError));
      }
    },
    async deleteTask(taskId) {
      setError(null);
      try {
        await workspaceApi.deleteTask(taskId);
        setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
        return true;
      } catch (requestError) {
        setError(errorMessage(requestError));
        return false;
      }
    },
    async createProject(name, color) {
      setError(null);
      try {
        const project = await workspaceApi.createProject(name, color);
        setProjects((currentProjects) => [...currentProjects, project]);
        return project;
      } catch (requestError) {
        setError(errorMessage(requestError));
        return null;
      }
    },
    async updateProject(projectId, name, color) {
      setError(null);
      try {
        const updatedProject = await workspaceApi.updateProject(projectId, { name, color });
        setProjects((currentProjects) => currentProjects.map((project) => project.id === projectId ? updatedProject : project));
        return true;
      } catch (requestError) {
        setError(errorMessage(requestError));
        return false;
      }
    },
    async addProjectStage(projectId, name, color) {
      setError(null);
      try {
        const stage = await workspaceApi.createStage(projectId, name, color);
        setProjects((currentProjects) => currentProjects.map((project) => project.id === projectId
          ? { ...project, stages: [...project.stages, stage] }
          : project));
        return true;
      } catch (requestError) {
        if (requestError instanceof ApiError && requestError.status === 409) return false;
        setError(errorMessage(requestError));
        return false;
      }
    },
    async moveTaskToStage(taskId, stageId) {
      setError(null);
      try {
        const savedTask = await workspaceApi.updateTaskStage(taskId, stageId);
        setTasks((currentTasks) => currentTasks.map((task) => task.id === taskId ? savedTask : task));
      } catch (requestError) {
        setError(errorMessage(requestError));
      }
    },
    async deleteProject(projectId) {
      if (tasks.some((task) => task.projectId === projectId)) return false;

      setError(null);
      try {
        await workspaceApi.deleteProject(projectId);
        setProjects((currentProjects) => currentProjects.filter((project) => project.id !== projectId));
        return true;
      } catch (requestError) {
        setError(errorMessage(requestError));
        return false;
      }
    },
  }), [projects, tasks, loading, error]);

  return <WorkspaceDataContext.Provider value={value}>{children}</WorkspaceDataContext.Provider>;
}

export function useWorkspaceData() {
  const context = useContext(WorkspaceDataContext);
  if (!context) throw new Error('useWorkspaceData must be used within WorkspaceDataProvider');
  return context;
}
