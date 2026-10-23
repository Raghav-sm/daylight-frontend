'use client';

import { AddTaskDialog } from '@/components/add-task-dialog';
import { ProjectSettingsDialog } from '@/components/project-settings-dialog';
import { TaskItem } from '@/components/task-item';
import type { Project, ProjectColor, Task, TaskDraft } from '@/lib/task-types';
import { Button } from '@/components/ui/button';

type TaskGroup = {
  label: string;
  tasks: Task[];
};

type TaskListProps = {
  title: string;
  projects: Project[];
  defaultProjectId: string | null;
  groups: TaskGroup[];
  completedProjectTaskCount: number;
  showCompletedProjectTasks: boolean;
  selectedTaskId: string | null;
  onToggleCompletedProjectTasks: () => void;
  onTaskSelect: (taskId: string) => void;
  onTaskCompletionChange: (taskId: string, completed: boolean) => void;
  onTaskCreate: (task: TaskDraft) => void;
  onProjectRename: (projectId: string, name: string) => void;
  onProjectColorChange: (projectId: string, color: ProjectColor) => void;
  onProjectDelete: (projectId: string) => void;
};

function EmptyState({ title }: { title: string }) {
  return (
    <div className="px-6 py-16 text-center">
      <h2 className="text-sm font-medium">No tasks in {title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">Add a task to start organizing this view.</p>
    </div>
  );
}

export function TaskList({
  title,
  projects,
  defaultProjectId,
  groups,
  completedProjectTaskCount,
  showCompletedProjectTasks,
  selectedTaskId,
  onToggleCompletedProjectTasks,
  onTaskSelect,
  onTaskCompletionChange,
  onTaskCreate,
  onProjectRename,
  onProjectColorChange,
  onProjectDelete,
}: TaskListProps) {
  const taskCount = groups.reduce((count, group) => count + group.tasks.length, 0);
  const selectedProject = projects.find((project) => project.id === defaultProjectId) ?? null;

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-5 flex items-start justify-between gap-4 border-b border-border/70 pb-4">
        <div>
          <h2 className="text-base font-semibold">Tasks</h2>
          <p className="text-sm text-muted-foreground">{taskCount} {taskCount === 1 ? 'task' : 'tasks'}</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedProject && (
            <ProjectSettingsDialog
              project={selectedProject}
              projects={projects}
              onRename={onProjectRename}
              onColorChange={onProjectColorChange}
              onDelete={onProjectDelete}
            />
          )}
          <AddTaskDialog projects={projects} defaultProjectId={defaultProjectId} onCreate={onTaskCreate} />
        </div>
      </div>

      {completedProjectTaskCount > 0 && (
        <div className="mb-4">
          <Button type="button" variant="outline" size="sm" onClick={onToggleCompletedProjectTasks}>
            {showCompletedProjectTasks ? 'Hide' : 'Show'} completed ({completedProjectTaskCount})
          </Button>
        </div>
      )}

      {taskCount === 0 ? (
        <EmptyState title={title} />
      ) : (
        <div className="space-y-6">
          {groups.map((group, groupIndex) => group.tasks.length > 0 && (
            <section key={group.label || `tasks-${groupIndex}`} aria-label={group.label || `${title} tasks`}>
              {group.label && <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{group.label}</h2>}
              <ul className="divide-y divide-border/70">
                {group.tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    project={projects.find((project) => project.id === task.projectId)}
                    selected={selectedTaskId === task.id}
                    onSelect={onTaskSelect}
                    onCompletionChange={onTaskCompletionChange}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
