'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Project, ProjectColor, Task, TaskDraft } from '@/lib/task-types';

type WorkspaceData = {
  projects: Project[];
  tasks: Task[];
  createTask: (draft: TaskDraft) => Task;
  updateTask: (task: Task) => void;
  setTaskCompletion: (taskId: string, completed: boolean) => void;
  deleteTask: (taskId: string) => void;
  createProject: (name: string, color: ProjectColor) => Project;
  renameProject: (projectId: string, name: string) => void;
  changeProjectColor: (projectId: string, color: ProjectColor) => void;
  addProjectStage: (projectId: string, name: string, color: ProjectColor) => boolean;
  moveTaskToStage: (taskId: string, stageId: string) => void;
  deleteProject: (projectId: string) => void;
};

const WorkspaceDataContext = createContext<WorkspaceData | null>(null);

function createId() {
  return crypto.randomUUID();
}

export function WorkspaceDataProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const value = useMemo<WorkspaceData>(() => ({
    projects,
    tasks,
    createTask(draft) {
      const targetProject = projects.find((project) => project.id === draft.projectId);
      const task: Task = {
        id: createId(),
        ...draft,
        completed: false,
        completedAt: null,
        createdAt: new Date().toISOString(),
        stageId: draft.stageId ?? targetProject?.stages[0]?.id ?? null,
        subtasks: [],
      };
      setTasks((currentTasks) => [task, ...currentTasks]);
      return task;
    },
    updateTask(updatedTask) {
      setTasks((currentTasks) => currentTasks.map((task) => {
        if (task.id !== updatedTask.id) return task;
        if (task.projectId === updatedTask.projectId) return updatedTask;
        const project = projects.find((item) => item.id === updatedTask.projectId);
        return { ...updatedTask, stageId: project?.stages[updatedTask.completed ? 2 : 0]?.id ?? null };
      }));
    },
    setTaskCompletion(taskId, completed) {
      setTasks((currentTasks) => currentTasks.map((task) => task.id === taskId
        ? {
          ...task,
          completed,
          completedAt: completed ? new Date().toISOString() : null,
          stageId: task.projectId
            ? projects.find((project) => project.id === task.projectId)?.stages[completed ? 2 : 0]?.id ?? task.stageId
            : task.stageId,
        }
        : task));
    },
    deleteTask(taskId) {
      setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
    },
    createProject(name, color) {
      const project: Project = {
        id: createId(),
        name,
        color,
        stages: [
          { id: createId(), name: 'To Do', color: 'blue' },
          { id: createId(), name: 'In Progress', color: 'amber' },
          { id: createId(), name: 'Completed', color: 'green' },
        ],
      };
      setProjects((currentProjects) => [...currentProjects, project]);
      return project;
    },
    renameProject(projectId, name) {
      setProjects((currentProjects) => currentProjects.map((project) => project.id === projectId ? { ...project, name } : project));
    },
    changeProjectColor(projectId, color) {
      setProjects((currentProjects) => currentProjects.map((project) => project.id === projectId ? { ...project, color } : project));
    },
    addProjectStage(projectId, name, color) {
      const project = projects.find((item) => item.id === projectId);
      if (!project || project.stages.some((stage) => stage.name.toLocaleLowerCase() === name.toLocaleLowerCase())) {
        return false;
      }
      setProjects((currentProjects) => currentProjects.map((item) => item.id === projectId
        ? { ...item, stages: [...item.stages, { id: createId(), name, color }] }
        : item));
      return true;
    },
    moveTaskToStage(taskId, stageId) {
      const task = tasks.find((item) => item.id === taskId);
      const project = task && projects.find((item) => item.id === task.projectId);
      const stage = project?.stages.find((item) => item.id === stageId);
      if (!task || !project || !stage) return;
      const completed = stage.name === 'Completed';
      setTasks((currentTasks) => currentTasks.map((item) => item.id === taskId
        ? {
          ...item,
          stageId,
          completed,
          completedAt: completed ? new Date().toISOString() : null,
        }
        : item));
    },
    deleteProject(projectId) {
      setProjects((currentProjects) => currentProjects.filter((project) => project.id !== projectId));
      setTasks((currentTasks) => currentTasks.map((task) => task.projectId === projectId ? { ...task, projectId: null, stageId: null } : task));
    },
  }), [projects, tasks]);

  return <WorkspaceDataContext.Provider value={value}>{children}</WorkspaceDataContext.Provider>;
}

export function useWorkspaceData() {
  const context = useContext(WorkspaceDataContext);
  if (!context) throw new Error('useWorkspaceData must be used within WorkspaceDataProvider');
  return context;
}
