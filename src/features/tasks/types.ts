export type TaskPriority = 'none' | 'low' | 'medium' | 'high';

export type Subtask = {
  id: string;
  title: string;
  completed: boolean;
};

export type SubtaskWrite = {
  id?: string;
  title: string;
  completed: boolean;
};

export type Task = {
  id: string;
  title: string;
  notes: string;
  projectId: string;
  dueDate: string | null;
  dueTime: string | null;
  priority: TaskPriority;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
  stageId: string | null;
  subtasks: Subtask[];
};

export type TaskSummary = {
  id: string;
  projectId: string;
  title: string;
  dueDate: string | null;
  dueTime: string | null;
  priority: TaskPriority;
  completed: boolean;
  stageId: string | null;
  subtaskCount: number;
  completedSubtaskCount: number;
};

export type TaskDraft = Pick<Task, 'title' | 'notes' | 'dueDate' | 'dueTime' | 'priority'> & {
  projectId: string;
  stageId?: string | null;
};

export type TaskUpdatePayload = Partial<{
  title: string;
  notes: string;
  projectId: string;
  dueDate: string | null;
  dueTime: string | null;
  priority: TaskPriority;
  completed: boolean;
  stageId: string | null;
  subtasks: SubtaskWrite[];
}>;
