'use client';

import { useRef, useState, type FormEvent } from 'react';
import { Pencil } from 'lucide-react';
import type { Project, ProjectColor } from '@/lib/task-types';
import { projectColors } from '@/lib/project-colors';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type ProjectSettingsDialogProps = {
  project: Project;
  projects: Project[];
  onSave: (projectId: string, name: string, color: ProjectColor) => Promise<boolean>;
  onDelete: (projectId: string) => Promise<boolean>;
  defaultOpen?: boolean;
  hideTrigger?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function ProjectSettingsDialog({
  project,
  projects,
  onSave,
  onDelete,
  defaultOpen = false,
  hideTrigger = false,
  onOpenChange,
}: ProjectSettingsDialogProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [name, setName] = useState(project.name);
  const [color, setColor] = useState<ProjectColor>(project.color);
  const [error, setError] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const editTriggerRef = useRef<HTMLButtonElement>(null);
  const openDeleteAfterSettingsClose = useRef(false);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      setName(project.name);
      setColor(project.color);
      setError('');
      setDeleteError('');
      onOpenChange?.(true);
      return;
    }
    if (!openDeleteAfterSettingsClose.current) {
      onOpenChange?.(false);
    }
  }

  async function saveProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    if (projects.some((item) => item.id !== project.id && item.name.toLocaleLowerCase() === trimmedName.toLocaleLowerCase())) {
      setError('A project with that name already exists.');
      return;
    }
    const saved = await onSave(project.id, trimmedName, color);
    if (!saved) {
      setError('The project could not be saved. Please try again.');
      return;
    }
    handleOpenChange(false);
  }

  async function deleteProject() {
    setDeleting(true);
    const deleted = await onDelete(project.id);
    setDeleting(false);
    if (!deleted) {
      setDeleteError('This project could not be deleted. Move or delete its tasks first.');
      return;
    }
    setDeleteOpen(false);
    onOpenChange?.(false);
  }

  return (
    <>
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!hideTrigger && (
        <DialogTrigger asChild>
          <Button ref={editTriggerRef} type="button" variant="secondary" size="sm"><Pencil aria-hidden="true" />Edit project</Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-md" onCloseAutoFocus={(event) => {
        if (openDeleteAfterSettingsClose.current) {
          event.preventDefault();
          openDeleteAfterSettingsClose.current = false;
          setDeleteOpen(true);
        }
      }}>
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
          <DialogFooter className="border-t border-border pt-4 sm:justify-between">
            <Button type="button" variant="destructive" size="sm" onClick={() => {
              openDeleteAfterSettingsClose.current = true;
              setDeleteError('');
              handleOpenChange(false);
            }}>Delete project</Button>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => handleOpenChange(false)}>Cancel</Button>
              <Button type="submit" size="sm" disabled={!name.trim()}>Save changes</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    <AlertDialog
      open={deleteOpen}
      onOpenChange={(nextOpen) => {
        setDeleteOpen(nextOpen);
        if (!nextOpen && !open) onOpenChange?.(false);
      }}
    >
      <AlertDialogContent onCloseAutoFocus={(event) => {
        event.preventDefault();
        editTriggerRef.current?.focus();
      }}>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{project.name}”?</AlertDialogTitle>
          <AlertDialogDescription>This permanently deletes the project. Projects with tasks cannot be deleted.</AlertDialogDescription>
          {deleteError && <p role="alert" className="text-sm text-destructive">{deleteError}</p>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button type="button" variant="secondary" size="sm" disabled={deleting}>Cancel</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button type="button" variant="destructive" size="sm" disabled={deleting} onClick={(event) => {
              event.preventDefault();
              void deleteProject();
            }}>{deleting ? 'Deleting…' : 'Delete project'}</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
