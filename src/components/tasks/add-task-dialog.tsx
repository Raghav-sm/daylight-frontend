'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import { Plus } from 'lucide-react';
import type { Project, Task, TaskDraft } from '@/lib/task-types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type AddTaskDialogProps = {
  projects: Project[];
  defaultProjectId: string | null;
  defaultStageId?: string | null;
  fixedProject?: boolean;
  trigger?: ReactNode;
  onCreate: (task: TaskDraft) => Promise<Task | null> | void;
};

export function AddTaskDialog({ projects, defaultProjectId, defaultStageId = null, fixedProject = false, trigger, onCreate }: AddTaskDialogProps) {
  const initialProjectId = defaultProjectId ?? projects[0]?.id ?? '';
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [projectId, setProjectId] = useState(initialProjectId);
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState<TaskDraft['priority']>('none');
  const [saving, setSaving] = useState(false);

  function resetDraft() {
    setTitle('');
    setNotes('');
    setProjectId(defaultProjectId ?? projects[0]?.id ?? '');
    setDueDate('');
    setDueTime('');
    setPriority('none');
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) resetDraft();
  }

  async function submitTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle || !projectId) return;
    setSaving(true);
    const createdTask = await onCreate({
      title: trimmedTitle,
      notes: notes.trim(),
      projectId,
      stageId: fixedProject ? defaultStageId : null,
      dueDate: dueDate || null,
      dueTime: dueDate ? dueTime || null : null,
      priority,
    });
    setSaving(false);
    if (createdTask === null) return;
    resetDraft();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? <Button type="button" size="sm"><Plus aria-hidden="true" />Add task</Button>}
      </DialogTrigger>
      <DialogContent className="flex max-h-[min(90vh,46rem)] max-w-xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Add task</DialogTitle>
          <DialogDescription>Create a task and set its details. You can add subtasks after creating it.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submitTask} className="flex min-h-0 flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto py-1 pr-1">
            <div>
              <label htmlFor="new-task-title" className="mb-1.5 block text-sm font-medium">Title</label>
              <Input id="new-task-title" autoFocus placeholder="What needs to get done?" value={title} onChange={(event) => setTitle(event.target.value)} required />
            </div>
            <div>
              <label htmlFor="new-task-notes" className="mb-1.5 block text-sm font-medium">Notes</label>
              <Textarea id="new-task-notes" placeholder="Add notes (optional)" rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} />
            </div>
            {!fixedProject && projects.length > 0 && <div>
              <label htmlFor="new-task-project" className="mb-1.5 block text-sm font-medium">Project</label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger id="new-task-project" aria-label="Project"><SelectValue placeholder="Choose a project" /></SelectTrigger>
                <SelectContent>
                  {projects.map((project) => <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>}
            {projects.length === 0 && <p className="text-sm text-muted-foreground">Create a project before adding a task.</p>}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label htmlFor="new-task-due-date" className="mb-1.5 block text-sm font-medium">Due date</label>
                <Input id="new-task-due-date" type="date" value={dueDate} onChange={(event) => { setDueDate(event.target.value); if (!event.target.value) setDueTime(''); }} />
              </div>
              <div>
                <label htmlFor="new-task-due-time" className="mb-1.5 block text-sm font-medium">Time</label>
                <Input id="new-task-due-time" type="time" value={dueTime} disabled={!dueDate} onChange={(event) => setDueTime(event.target.value)} />
              </div>
            </div>
            <div>
              <label htmlFor="new-task-priority" className="mb-1.5 block text-sm font-medium">Priority</label>
              <Select value={priority} onValueChange={(value: TaskDraft['priority']) => setPriority(value)}>
                <SelectTrigger id="new-task-priority" aria-label="Priority"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-4 shrink-0 border-t border-border pt-4">
            <Button type="button" variant="secondary" size="sm" onClick={() => handleOpenChange(false)}>Cancel</Button>
            <Button type="submit" size="sm" disabled={!title.trim() || !projectId || saving}>{saving ? 'Creating…' : 'Create task'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
