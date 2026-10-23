'use client';

import { useState, type FormEvent } from 'react';
import { Pencil } from 'lucide-react';
import type { Project, ProjectColor } from '@/lib/task-types';
import { projectColors } from '@/lib/project-colors';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type ProjectSettingsDialogProps = {
  project: Project;
  projects: Project[];
  onRename: (projectId: string, name: string) => void;
  onColorChange: (projectId: string, color: ProjectColor) => void;
  onDelete: (projectId: string) => void;
};

export function ProjectSettingsDialog({ project, projects, onRename, onColorChange, onDelete }: ProjectSettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(project.name);
  const [color, setColor] = useState<ProjectColor>(project.color);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      setName(project.name);
      setColor(project.color);
      setError('');
      setConfirmDelete(false);
    }
  }

  function saveProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    if (projects.some((item) => item.id !== project.id && item.name.toLocaleLowerCase() === trimmedName.toLocaleLowerCase())) {
      setError('A project with that name already exists.');
      return;
    }
    onRename(project.id, trimmedName);
    onColorChange(project.id, color);
    setOpen(false);
  }

  function deleteProject() {
    onDelete(project.id);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm"><Pencil aria-hidden="true" /> Edit project</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Project settings</DialogTitle>
          <DialogDescription>Update the project name and color, or delete this project.</DialogDescription>
        </DialogHeader>
        <form onSubmit={saveProject} className="space-y-4">
          <div>
            <label htmlFor="project-name" className="mb-1.5 block text-sm font-medium">Project name</label>
            <Input id="project-name" autoFocus value={name} onChange={(event) => setName(event.target.value)} required />
          </div>
          <div>
            <label htmlFor="project-color" className="mb-1.5 block text-sm font-medium">Project color</label>
            <Select value={color} onValueChange={(value: ProjectColor) => setColor(value)}>
              <SelectTrigger id="project-color" aria-label="Project color"><SelectValue /></SelectTrigger>
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
          <DialogFooter className="justify-between sm:justify-between">
            {!confirmDelete ? (
              <Button type="button" variant="destructive" onClick={() => setConfirmDelete(true)}>Delete</Button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Move its tasks to Inbox?</span>
                <Button type="button" variant="destructive" size="sm" onClick={deleteProject}>Confirm</Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>Cancel</Button>
              </div>
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={!name.trim()}>Save changes</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
