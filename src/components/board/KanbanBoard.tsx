'use client';

import Link from 'next/link';
import { CalendarDays, Plus } from 'lucide-react';
import type { Project, ProjectColor, Task, TaskDraft } from '@/lib/task-types';
import { AddTaskDialog } from '@/components/tasks/add-task-dialog';
import { AddStageDialog } from '@/components/board/add-stage-dialog';
import { ProjectSettingsDialog } from '@/components/projects/project-settings-dialog';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

type KanbanBoardProps = {
  project: Project;
  projects: Project[];
  tasks: Task[];
  onTaskSelect: (taskId: string) => void;
  onTaskMove: (taskId: string, stageId: string) => void;
  onAddStage: (name: string, color: ProjectColor) => Promise<boolean>;
  onTaskCreate: (task: TaskDraft) => Promise<Task | null>;
  onProjectSave: (projectId: string, name: string, color: ProjectColor) => Promise<boolean>;
  onProjectDelete: (projectId: string) => Promise<boolean>;
};

function taskDate(task: Task) {
  if (!task.dueDate) return null;
  const [year, month, day] = task.dueDate.split('-').map(Number);
  const formatted = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(year, month - 1, day));
  return task.dueTime ? `${formatted}, ${task.dueTime}` : formatted;
}

function TaskCard({
  task,
  onSelect,
}: {
  task: Task;
  onSelect: (taskId: string) => void;
}) {
  return (
    <article
      draggable
      onDragStart={(event) => event.dataTransfer.setData('text/daylight-task', task.id)}
      className="cursor-pointer rounded-md border border-border/70 bg-card p-3 shadow-sm shadow-black/[0.03] active:cursor-grabbing"
    >
      <button type="button" onClick={() => onSelect(task.id)} className="w-full cursor-pointer text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        <span className={`block text-sm font-medium ${task.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{task.title}</span>
      </button>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {task.priority !== 'none' && <span className="capitalize">{task.priority} priority</span>}
        {taskDate(task) && <span className="inline-flex items-center gap-1"><CalendarDays aria-hidden="true" className="size-3.5" />{taskDate(task)}</span>}
        {task.subtasks.length > 0 && <span>{task.subtasks.filter((subtask) => subtask.completed).length}/{task.subtasks.length} subtasks</span>}
      </div>
    </article>
  );
}

export function KanbanBoard({ project, projects, tasks, onTaskSelect, onTaskMove, onAddStage, onTaskCreate, onProjectSave, onProjectDelete }: KanbanBoardProps) {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link href="/dashboard">Dashboard</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink asChild><Link href="/projects">Projects</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>{project.name}</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mb-5 flex items-center justify-between border-b border-border/70 pb-4">
        <div>
          <h2 className="text-base font-semibold">{project.name} board</h2>
          <p className="mt-1 text-sm text-muted-foreground">Move tasks between stages by dragging them.</p>
        </div>
        <div className="flex items-center gap-2">
          <ProjectSettingsDialog project={project} projects={projects} onSave={onProjectSave} onDelete={onProjectDelete} />
          <AddStageDialog projectName={project.name} onCreate={onAddStage} />
        </div>
      </div>

      <div className="flex min-h-[60vh] items-start gap-4 overflow-x-auto pb-4">
        {project.stages.map((stage) => {
          const stageTasks = tasks.filter((task) => task.stageId === stage.id);
          return (
            <section
              key={stage.id}
              aria-label={`${stage.name} stage`}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const taskId = event.dataTransfer.getData('text/daylight-task');
                if (taskId) onTaskMove(taskId, stage.id);
              }}
              className="flex min-h-[60vh] w-72 shrink-0 flex-col gap-2"
            >
              <div data-project-color={stage.color} className="stage-color-header flex items-center justify-between rounded-sm border px-3 py-2.5">
                <h3 className="text-sm font-semibold">{stage.name}</h3>
                <span className="rounded-sm bg-muted px-2 py-0.5 text-xs text-muted-foreground">{stageTasks.length}</span>
              </div>
              <div className="min-h-32 flex-1 space-y-2 rounded-sm border border-border/70 bg-background p-2" aria-label={`Drop tasks in ${stage.name}`}>
                {stageTasks.length === 0 ? (
                  <p className="px-2 py-5 text-center text-xs text-muted-foreground">Drop a task here</p>
                ) : stageTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onSelect={onTaskSelect} />
                ))}
              </div>
              <AddTaskDialog
                projects={projects}
                defaultProjectId={project.id}
                defaultStageId={stage.id}
                fixedProject
                onCreate={onTaskCreate}
                trigger={(
                  <Button type="button" variant="secondary" size="sm" className="w-full hover:bg-muted">
                    <Plus aria-hidden="true" />Add task
                  </Button>
                )}
              />
            </section>
          );
        })}
      </div>
    </div>
  );
}
