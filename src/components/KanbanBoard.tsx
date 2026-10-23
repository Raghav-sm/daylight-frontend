'use client';

import { useState, type FormEvent } from 'react';
import { CalendarDays, Plus } from 'lucide-react';
import type { Project, ProjectColor, Task, TaskDraft } from '@/lib/task-types';
import { projectColors } from '@/lib/project-colors';
import { AddTaskDialog } from '@/components/add-task-dialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type KanbanBoardProps = {
  project: Project;
  projects: Project[];
  tasks: Task[];
  onTaskSelect: (taskId: string) => void;
  onTaskMove: (taskId: string, stageId: string) => void;
  onAddStage: (name: string, color: ProjectColor) => boolean;
  onTaskCreate: (task: TaskDraft) => void;
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

export function KanbanBoard({ project, projects, tasks, onTaskSelect, onTaskMove, onAddStage, onTaskCreate }: KanbanBoardProps) {
  const [addingStage, setAddingStage] = useState(false);
  const [stageName, setStageName] = useState('');
  const [stageColor, setStageColor] = useState<ProjectColor>('violet');
  const [stageError, setStageError] = useState('');

  function submitStage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = stageName.trim();
    if (!name) return;
    if (!onAddStage(name, stageColor)) {
      setStageError('A stage with that name already exists.');
      return;
    }
    setStageName('');
    setStageColor('violet');
    setStageError('');
    setAddingStage(false);
  }

  function closeStageDialog() {
    setAddingStage(false);
    setStageName('');
    setStageColor('violet');
    setStageError('');
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-5 flex items-center justify-between border-b border-border/70 pb-4">
        <div>
          <h2 className="text-base font-semibold">{project.name} board</h2>
          <p className="mt-1 text-sm text-muted-foreground">Move tasks between stages by dragging them.</p>
        </div>
        <Dialog open={addingStage} onOpenChange={(open) => {
          setAddingStage(open);
          if (!open) { setStageName(''); setStageColor('violet'); setStageError(''); }
        }}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline"><Plus aria-hidden="true" /> Add stage</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add stage</DialogTitle>
              <DialogDescription>Add a column to the {project.name} board.</DialogDescription>
            </DialogHeader>
            <form onSubmit={submitStage} className="space-y-4">
              <div>
                <label htmlFor="project-stage-name" className="mb-1.5 block text-sm font-medium">Stage name</label>
                <Input autoFocus id="project-stage-name" placeholder="e.g. Review" value={stageName} onChange={(event) => setStageName(event.target.value)} required />
              </div>
              <div>
                <label htmlFor="project-stage-color" className="mb-1.5 block text-sm font-medium">Stage color</label>
                <Select value={stageColor} onValueChange={(value: ProjectColor) => setStageColor(value)}>
                  <SelectTrigger id="project-stage-color" aria-label="Stage color"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {projectColors.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <span className="inline-flex items-center gap-2"><span data-project-color={color.value} className="project-color-dot size-2.5 rounded-full" />{color.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {stageError && <p role="alert" className="text-sm text-destructive">{stageError}</p>}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeStageDialog}>Cancel</Button>
                <Button type="submit" disabled={!stageName.trim()}>Add stage</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
                  <Button type="button" variant="ghost" size="sm" className="w-full justify-start rounded-sm text-muted-foreground hover:text-foreground">
                    <Plus aria-hidden="true" /> Add task
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
