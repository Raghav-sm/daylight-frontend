export type TaskPriority = 'none' | 'low' | 'medium' | 'high';
export type ProjectColor = 'red' | 'orange' | 'amber' | 'green' | 'teal' | 'blue' | 'violet';

export type Subtask = {
  id: string;
  title: string;
  completed: boolean;
};

export type Task = {
  id: string;
  title: string;
  notes: string;
  projectId: string | null;
  dueDate: string | null;
  dueTime: string | null;
  priority: TaskPriority;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
  stageId: string | null;
  subtasks: Subtask[];
};

export type TaskDraft = Pick<Task, 'title' | 'notes' | 'projectId' | 'dueDate' | 'dueTime' | 'priority'> & {
  stageId?: string | null;
};

export type ProjectStage = {
  id: string;
  name: string;
  color: ProjectColor;
};

export type Project = {
  id: string;
  name: string;
  color: ProjectColor;
  stages: ProjectStage[];
};

export type BuiltInView = 'Inbox' | 'Today' | 'Upcoming' | 'All Tasks' | 'Completed';
