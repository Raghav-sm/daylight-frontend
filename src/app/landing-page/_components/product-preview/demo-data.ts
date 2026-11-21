import type { Project, ProjectStage } from '@/features/projects/types';
import type { TaskSummary } from '@/features/tasks/types';

export const demoProject: Project = {
  id: 'demo-project',
  name: 'Product launch',
  color: 'orange',
  initialStageId: 'todo',
  finalStageId: 'done',
  stages: [
    { id: 'todo', name: 'To Do', color: 'orange' },
    { id: 'progress', name: 'In Progress', color: 'orange' },
    { id: 'done', name: 'Completed', color: 'violet' },
  ],
};

export const demoStages = demoProject.stages as ProjectStage[];

export const demoProjects = [
  {
    id: demoProject.id,
    name: demoProject.name,
    color: demoProject.color,
    taskCount: 6,
    incompleteTaskCount: 5,
    stageCount: 3,
  },
  {
    id: 'personal',
    name: 'Personal',
    color: 'teal' as const,
    taskCount: 3,
    incompleteTaskCount: 2,
    stageCount: 3,
  },
  {
    id: 'reading',
    name: 'Reading list',
    color: 'violet' as const,
    taskCount: 2,
    incompleteTaskCount: 2,
    stageCount: 3,
  },
];

function makeTask(
  id: string,
  title: string,
  stageId: string,
  priority: TaskSummary['priority'] = 'none',
  dueDate: string | null = null,
): TaskSummary {
  return {
    id,
    title,
    projectId: demoProject.id,
    stageId,
    completed: stageId === 'done',
    priority,
    dueDate,
    dueTime: null,
    subtaskCount: 0,
    completedSubtaskCount: 0,
  };
}

export const demoPrompt =
  'Move Review landing page to In Progress and add a task to write the launch email for Friday.';

export const initialDemoTasks: TaskSummary[] = [
  makeTask('t1', 'Write launch announcement', 'todo', 'high'),
  makeTask('t2', 'Polish the onboarding', 'todo', 'medium'),
  makeTask('t5', 'Review landing page', 'todo', 'medium'),
  makeTask('t3', 'Prepare launch checklist', 'progress', 'high'),
  makeTask('t4', 'Define the project scope', 'done'),
];

export const finalDemoTasks: TaskSummary[] = [
  ...initialDemoTasks.map((task) =>
    task.id === 't5' ? { ...task, stageId: 'progress' } : task,
  ),
  makeTask('t6', 'Write the launch email', 'todo', 'medium', '2026-11-20'),
];
