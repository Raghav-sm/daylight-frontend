'use client';

import { useState, type FormEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { Project, Task } from '@/lib/task-types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type TaskDetailsProps = {
  task: Task | null;
  projects: Project[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (task: Task) => void;
  onDelete: (taskId: string) => void;
};

type TaskDetailsFormProps = {
  task: Task;
  projects: Project[];
  onSave: (task: Task) => void;
  onDelete: (taskId: string) => void;
};

function TaskDetailsForm({
  task,
  projects,
  onSave,
  onDelete,
}: TaskDetailsFormProps) {
  const [draft, setDraft] = useState<Task>(task);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const taskProject = projects.find((project) => project.id === draft.projectId);
  const hasChanges = JSON.stringify(draft) !== JSON.stringify(task);

  function updateDraft(changes: Partial<Task>) {
    setDraft((currentDraft) => ({ ...currentDraft, ...changes }));
  }

  function saveTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.title.trim()) return;
    const savedTask = { ...draft, title: draft.title.trim() };
    onSave(savedTask);
    setDraft(savedTask);
  }

  function addSubtask() {
    const title = newSubtaskTitle.trim();
    if (!title) return;
    updateDraft({ subtasks: [...draft.subtasks, { id: crypto.randomUUID(), title, completed: false }] });
    setNewSubtaskTitle('');
  }

  function updateSubtask(subtaskId: string, changes: Partial<Task['subtasks'][number]>) {
    updateDraft({ subtasks: draft.subtasks.map((subtask) => subtask.id === subtaskId ? { ...subtask, ...changes } : subtask) });
  }

  return (
    <form onSubmit={saveTask} className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        <div>
          <label htmlFor="task-title" className="mb-1.5 block text-xs font-medium text-muted-foreground">Title</label>
          <Input id="task-title" value={draft.title} onChange={(event) => updateDraft({ title: event.target.value })} required />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={draft.completed} onCheckedChange={(checked) => {
            const completed = checked === true;
            updateDraft({ completed, completedAt: completed ? new Date().toISOString() : null, stageId: taskProject?.stages[completed ? 2 : 0]?.id ?? draft.stageId });
          }} />
          <span>{draft.completed ? 'Completed' : 'Mark as completed'}</span>
        </label>

        <div>
          <label htmlFor="task-notes" className="mb-1.5 block text-xs font-medium text-muted-foreground">Notes</label>
          <textarea
            id="task-notes"
            value={draft.notes}
            onChange={(event) => updateDraft({ notes: event.target.value })}
            placeholder="Add notes"
            rows={4}
            className="w-full resize-y rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>

        <div>
          <label htmlFor="task-project" className="mb-1.5 block text-xs font-medium text-muted-foreground">Project</label>
            <Select value={draft.projectId ?? 'inbox'} onValueChange={(value) => {
              const nextProjectId = value === 'inbox' ? null : value;
              const nextProject = projects.find((project) => project.id === nextProjectId);
              updateDraft({ projectId: nextProjectId, stageId: nextProject?.stages[draft.completed ? 2 : 0]?.id ?? null });
            }}>
            <SelectTrigger id="task-project" aria-label="Project"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="inbox">Inbox</SelectItem>
              {projects.map((project) => <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="task-due-date" className="mb-1.5 block text-xs font-medium text-muted-foreground">Due date</label>
            <Input id="task-due-date" type="date" value={draft.dueDate ?? ''} onChange={(event) => updateDraft({ dueDate: event.target.value || null, dueTime: event.target.value ? draft.dueTime : null })} />
          </div>
          <div>
            <label htmlFor="task-due-time" className="mb-1.5 block text-xs font-medium text-muted-foreground">Time</label>
            <Input id="task-due-time" type="time" value={draft.dueTime ?? ''} disabled={!draft.dueDate} onChange={(event) => updateDraft({ dueTime: event.target.value || null })} />
          </div>
        </div>

        <div>
          <label htmlFor="task-priority" className="mb-1.5 block text-xs font-medium text-muted-foreground">Priority</label>
          <Select value={draft.priority} onValueChange={(priority: Task['priority']) => updateDraft({ priority })}>
            <SelectTrigger id="task-priority" aria-label="Priority"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-medium text-muted-foreground">Subtasks</h3>
            {draft.subtasks.length > 0 && <span className="text-xs text-muted-foreground">{draft.subtasks.filter((subtask) => subtask.completed).length} of {draft.subtasks.length}</span>}
          </div>
          <ul className="space-y-2">
            {draft.subtasks.map((subtask) => (
              <li key={subtask.id} className="flex items-center gap-2">
                <Checkbox
                  aria-label={`Complete subtask ${subtask.title}`}
                  checked={subtask.completed}
                  onCheckedChange={(checked) => updateSubtask(subtask.id, { completed: checked === true })}
                />
                <Input
                  aria-label="Subtask title"
                  className={`h-8 ${subtask.completed ? 'text-muted-foreground line-through' : ''}`}
                  value={subtask.title}
                  onChange={(event) => updateSubtask(subtask.id, { title: event.target.value })}
                />
                <Button type="button" variant="ghost" size="icon-sm" aria-label={`Delete subtask ${subtask.title}`} onClick={() => updateDraft({ subtasks: draft.subtasks.filter((item) => item.id !== subtask.id) })}>
                  <Trash2 aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex gap-2">
            <Input aria-label="New subtask" placeholder="Add a subtask" value={newSubtaskTitle} onChange={(event) => setNewSubtaskTitle(event.target.value)} />
            <Button type="button" variant="outline" size="icon" aria-label="Add subtask" disabled={!newSubtaskTitle.trim()} onClick={addSubtask}>
              <Plus aria-hidden="true" />
            </Button>
          </div>
        </div>

        {confirmDelete && (
          <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
            <p>Delete “{task.title}”? This can’t be undone.</p>
            <div className="mt-2 flex gap-2">
              <Button type="button" variant="destructive" size="sm" onClick={() => onDelete(draft.id)}>Delete task</Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>Keep task</Button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-border/70 p-4">
        <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmDelete(true)}>
          <Trash2 aria-hidden="true" /> Delete
        </Button>
        <div className="flex items-center gap-2">
          {hasChanges && <span className="text-xs text-muted-foreground">Unsaved changes</span>}
          <Button type="submit" disabled={!draft.title.trim() || !hasChanges}>Save</Button>
        </div>
      </div>
    </form>
  );
}

export function TaskDetails({ task, projects, open, onOpenChange, onSave, onDelete }: TaskDetailsProps) {
  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-border/70 p-5 pr-12">
          <DialogTitle>Task details</DialogTitle>
          <DialogDescription>Edit the selected task.</DialogDescription>
        </DialogHeader>
        <TaskDetailsForm key={task.id} task={task} projects={projects} onSave={onSave} onDelete={onDelete} />
      </DialogContent>
    </Dialog>
  );
}
