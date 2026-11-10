'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import type { Project, ProjectColor } from '@/lib/task-types';
import { projectColors } from '@/lib/project-colors';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type ProjectCreateDialogProps = {
  projects: Project[];
  trigger: ReactNode;
  onCreate: (name: string, color: ProjectColor) => Promise<Project | null>;
};

export function ProjectCreateDialog({ projects, trigger, onCreate }: ProjectCreateDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState<ProjectColor>('blue');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function resetForm() {
    setName('');
    setColor('blue');
    setError('');
  }

  async function submitProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    if (projects.some((project) => project.name.toLocaleLowerCase() === trimmedName.toLocaleLowerCase())) {
      setError('A project with that name already exists.');
      return;
    }

    setSaving(true);
    const project = await onCreate(trimmedName, color);
    setSaving(false);
    if (!project) {
      setError('The project could not be created. Please try again.');
      return;
    }

    setOpen(false);
    resetForm();
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => {
      setOpen(nextOpen);
      if (!nextOpen) resetForm();
    }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create project</DialogTitle>
          <DialogDescription>Give related tasks a home. Each project starts with a Kanban board and default stages.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submitProject} className="space-y-4">
          <div>
            <label htmlFor="new-project-name" className="mb-1.5 block text-sm font-medium">Project name</label>
            <Input id="new-project-name" autoFocus placeholder="e.g. Home" value={name} onChange={(event) => setName(event.target.value)} required />
          </div>
          <div>
            <label htmlFor="new-project-color" className="mb-1.5 block text-sm font-medium">Project color</label>
            <Select value={color} onValueChange={(value: ProjectColor) => setColor(value)}>
              <SelectTrigger id="new-project-color" aria-label="Project color"><SelectValue /></SelectTrigger>
              <SelectContent>
                {projectColors.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    <span className="inline-flex items-center gap-2"><span data-project-color={item.value} className="project-color-dot size-2.5 rounded-full" />{item.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <DialogFooter className="border-t border-border pt-4">
            <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" size="sm" disabled={!name.trim() || saving}>{saving ? 'Creating…' : 'Create project'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
