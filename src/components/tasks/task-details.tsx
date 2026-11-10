'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { Project, Task } from '@/lib/task-types';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type TaskDetailsProps = {
  task: Task | null;
  projects: Project[];
  onSave: (task: Task) => Promise<Task | null>;
  onDelete: (taskId: string) => void;
};

function TaskDetailsForm({ task, projects, onSave, onDelete }: Omit<TaskDetailsProps, 'task'> & { task: Task }) {
  const [draft, setDraft] = useState<Task>(task);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const taskProject = projects.find((project) => project.id === draft.projectId);
  const completedSubtasks = draft.subtasks.filter((subtask) => subtask.completed).length;
  const hasChanges = JSON.stringify(draft) !== JSON.stringify(task);

  function updateDraft(changes: Partial<Task>) {
    setDraft((current) => ({ ...current, ...changes }));
    setSaveError('');
  }

  async function saveTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.title.trim()) return;
    setSaving(true);
    setSaveError('');
    try {
      const saved = await onSave({ ...draft, title: draft.title.trim() });
      if (saved) setDraft(saved);
      else setSaveError('Could not save this task. Please try again.');
    } catch {
      setSaveError('Could not save this task. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function addSubtask() {
    const title = newSubtaskTitle.trim();
    if (!title) return;
    updateDraft({ subtasks: [...draft.subtasks, { id: crypto.randomUUID(), title, completed: false }] });
    setNewSubtaskTitle('');
  }

  function updateSubtask(id: string, changes: Partial<Task['subtasks'][number]>) {
    updateDraft({ subtasks: draft.subtasks.map((item) => item.id === id ? { ...item, ...changes } : item) });
  }

  return (
    <form id="task-details-form" onSubmit={saveTask} className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink asChild><Link href="/dashboard">Dashboard</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink asChild><Link href="/projects">Projects</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink asChild><Link href={`/projects/${encodeURIComponent(task.projectId)}`}>{projects.find((project) => project.id === task.projectId)?.name ?? 'Project'}</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>{task.title}</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center gap-3">
          {saveError && <p role="alert" className="text-sm text-destructive">{saveError}</p>}
          {hasChanges && !saveError && <span className="text-xs text-muted-foreground">Unsaved changes</span>}
          <Button type="submit" size="sm" disabled={!draft.title.trim() || !hasChanges || saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
        </div>
      </div>

      <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="min-w-0 gap-6 rounded-lg p-5 shadow-none sm:p-6">
          <div className="flex items-center gap-3">
            <Checkbox
              aria-label={draft.completed ? 'Mark task incomplete' : 'Complete task'}
              className="size-6 rounded-full [&_[data-slot=checkbox-indicator]]:rounded-full"
              checked={draft.completed}
              onCheckedChange={(checked) => {
                const completed = checked === true;
                updateDraft({ completed, completedAt: completed ? new Date().toISOString() : null, stageId: taskProject?.stages[completed ? taskProject.stages.length - 1 : 0]?.id ?? draft.stageId });
              }}
            />
            <label htmlFor="task-title" className="sr-only">Task title</label>
            <Input
              id="task-title"
              className="h-auto min-w-0 flex-1 border-transparent bg-transparent px-0 py-1 text-2xl font-semibold tracking-tight shadow-none hover:border-transparent focus-visible:border-ring focus-visible:ring-2 md:text-3xl"
              value={draft.title}
              onChange={(event) => updateDraft({ title: event.target.value })}
              placeholder="Task title"
              required
            />
          </div>

          <section className="space-y-2.5" aria-labelledby="task-notes-heading">
            <h2 id="task-notes-heading" className="text-sm font-semibold">Notes</h2>
            <label htmlFor="task-notes" className="sr-only">Task notes</label>
            <Textarea id="task-notes" className="min-h-28 resize-y border-input bg-background px-3 py-2.5" value={draft.notes} onChange={(event) => updateDraft({ notes: event.target.value })} placeholder="Add notes, links, or context…" rows={4} />
          </section>

          <section className="space-y-3" aria-labelledby="task-subtasks-heading">
            <div className="flex items-center justify-between gap-3">
              <h2 id="task-subtasks-heading" className="text-sm font-semibold">Subtasks</h2>
              <span className="text-xs text-muted-foreground">{completedSubtasks}/{draft.subtasks.length}</span>
            </div>
            {draft.subtasks.length === 0 && <p className="text-sm text-muted-foreground">No subtasks yet.</p>}
            {draft.subtasks.length > 0 && (
              <ul className="space-y-1">
                {draft.subtasks.map((subtask) => (
                  <li key={subtask.id} className="flex items-center gap-2 rounded-md py-1">
                    <Checkbox aria-label={`Complete subtask ${subtask.title}`} checked={subtask.completed} onCheckedChange={(checked) => updateSubtask(subtask.id, { completed: checked === true })} />
                    <Input aria-label="Subtask title" className={`h-8 border-transparent bg-transparent px-2 shadow-none focus-visible:border-input ${subtask.completed ? 'text-muted-foreground line-through' : ''}`} value={subtask.title} onChange={(event) => updateSubtask(subtask.id, { title: event.target.value })} />
                    <Button type="button" variant="destructive" size="icon-sm" className="shrink-0 bg-transparent text-muted-foreground shadow-none hover:text-destructive" aria-label={`Remove subtask ${subtask.title}`} onClick={() => updateDraft({ subtasks: draft.subtasks.filter((item) => item.id !== subtask.id) })}>
                      <Trash2 aria-hidden="true" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-2">
              <Input aria-label="New subtask" placeholder="Add a subtask" value={newSubtaskTitle} onChange={(event) => setNewSubtaskTitle(event.target.value)} onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  addSubtask();
                }
              }} />
              <Button type="button" variant="secondary" size="sm" disabled={!newSubtaskTitle.trim()} onClick={addSubtask}><Plus aria-hidden="true" />Add</Button>
            </div>
          </section>
        </Card>

        <Card className="min-w-0 gap-0 rounded-lg p-5 shadow-none sm:p-6" aria-labelledby="task-properties-heading">
          <h2 id="task-properties-heading" className="mb-5 text-sm font-semibold">Details</h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="task-project" className="block text-sm font-medium">Project</label>
              <Select value={draft.projectId} onValueChange={(projectId) => {
                const nextProject = projects.find((project) => project.id === projectId);
                updateDraft({ projectId, stageId: nextProject?.stages[draft.completed ? nextProject.stages.length - 1 : 0]?.id ?? null });
              }}>
                <SelectTrigger id="task-project"><SelectValue /></SelectTrigger>
                <SelectContent>{projects.map((project) => <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="task-stage" className="block text-sm font-medium">Stage</label>
              <Select value={draft.stageId ?? 'unassigned'} onValueChange={(stageId) => updateDraft({ stageId: stageId === 'unassigned' ? null : stageId })}>
                <SelectTrigger id="task-stage"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">No stage</SelectItem>
                  {taskProject?.stages.map((stage) => <SelectItem key={stage.id} value={stage.id}>{stage.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid min-w-0 grid-cols-2 gap-2">
              <div className="min-w-0 space-y-1.5">
                <label htmlFor="task-due-date" className="block text-sm font-medium">Due date</label>
                <Input id="task-due-date" type="date" className="min-w-0 px-2" value={draft.dueDate ?? ''} onChange={(event) => updateDraft({ dueDate: event.target.value || null, dueTime: event.target.value ? draft.dueTime : null })} />
              </div>
              <div className="min-w-0 space-y-1.5">
                <label htmlFor="task-due-time" className="block text-sm font-medium">Due time</label>
                <Input id="task-due-time" type="time" className="min-w-0 px-2" value={draft.dueTime ?? ''} disabled={!draft.dueDate} onChange={(event) => updateDraft({ dueTime: event.target.value || null })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <span id="task-priority-label" className="block text-sm font-medium">Priority</span>
              <div role="group" aria-labelledby="task-priority-label" className="grid grid-cols-4 gap-1 rounded-lg bg-muted p-1">
                {([
                  { value: 'none', label: 'None' },
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Med' },
                  { value: 'high', label: 'High' },
                ] as const).map(({ value, label }) => (
                  <Button key={value} type="button" variant="secondary" size="sm" aria-pressed={draft.priority === value} className={draft.priority === value ? 'min-w-0 bg-card px-1 text-foreground shadow-sm hover:bg-card' : 'min-w-0 bg-transparent px-1 text-muted-foreground shadow-none hover:bg-background hover:text-foreground'} onClick={() => updateDraft({ priority: value })}>{label}</Button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-auto space-y-3 pt-8">
            <p className="text-xs text-muted-foreground">Created {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(task.createdAt))}</p>
            <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
              <AlertDialogTrigger asChild><Button type="button" variant="destructive" size="sm"><Trash2 aria-hidden="true" />Delete task</Button></AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete “{task.title}”?</AlertDialogTitle>
                  <AlertDialogDescription>This action cannot be undone. The task and its subtasks will be deleted.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel asChild><Button type="button" variant="secondary" size="sm">Cancel</Button></AlertDialogCancel>
                  <AlertDialogAction asChild><Button type="button" variant="destructive" size="sm" onClick={(event) => { event.preventDefault(); onDelete(draft.id); }}>Delete task</Button></AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </Card>
      </div>
    </form>
  );
}

export function TaskDetails({ task, projects, onSave, onDelete }: TaskDetailsProps) {
  return (
    <div className="mx-auto w-full max-w-6xl py-1">
      {task ? (
        <TaskDetailsForm key={task.id} task={task} projects={projects} onSave={onSave} onDelete={onDelete} />
      ) : (
        <>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink asChild><Link href="/dashboard">Dashboard</Link></BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbLink asChild><Link href="/projects">Projects</Link></BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>Task</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="py-16 text-center">
            <h2 className="text-lg font-semibold">Task not found</h2>
            <p className="mt-1 text-sm text-muted-foreground">This task may have been deleted.</p>
          </div>
        </>
      )}
    </div>
  );
}
