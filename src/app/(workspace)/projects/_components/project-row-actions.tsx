'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, Pencil, Trash2 } from 'lucide-react';
import { ProjectSettingsDialog } from '@/components/projects/project-settings-dialog';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  useDeleteProject,
  useProject,
  useProjects,
  useUpdateProject,
} from '@/features/projects/data';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { ProjectSummary } from '@/features/projects/types';

export function ProjectRowActions({ project }: { project: ProjectSummary }) {
  const router = useRouter();
  const { data: allSummaries = [] } = useProjects();
  const { data: projectDetail } = useProject(project.id);
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const settingsProject = projectDetail ?? {
    id: project.id,
    name: project.name,
    color: project.color,
  };

  const projectsForUniqueness = allSummaries.map((item) => ({
    id: item.id,
    name: item.name,
    color: item.color,
  }));

  function openProject() {
    router.push(`/projects/${encodeURIComponent(project.id)}`);
  }

  async function handleSave(projectId: string, name: string, color: ProjectSummary['color']) {
    try {
      await updateProject.mutateAsync({ projectId, changes: { name, color } });
      return true;
    } catch {
      return false;
    }
  }

  async function handleDelete(projectId: string) {
    if (project.taskCount > 0) return false;
    try {
      await deleteProject.mutateAsync(projectId);
      return true;
    } catch {
      return false;
    }
  }

  async function confirmDelete() {
    setDeleteError('');
    const deleted = await handleDelete(project.id);
    if (deleted) setDeleteOpen(false);
    else setDeleteError('This project could not be deleted. Move or delete its tasks first.');
  }

  return (
    <>
      <TooltipProvider>
        <div className="inline-flex items-center justify-center gap-1" role="group" aria-label={`Actions for ${project.name}`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="ghost" size="icon-sm" aria-label={`Open ${project.name}`} onClick={openProject}>
                <ArrowUpRight aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Open</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="ghost" size="icon-sm" aria-label={`Edit ${project.name}`} onClick={() => setSettingsOpen(true)}>
                <Pencil aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="ghost" size="icon-sm" className="text-destructive hover:bg-destructive-soft hover:text-destructive" aria-label={`Delete ${project.name}`} onClick={() => setDeleteOpen(true)}>
                <Trash2 aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      <AlertDialog open={deleteOpen} onOpenChange={(open) => { setDeleteOpen(open); if (!open) setDeleteError(''); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{project.name}”?</AlertDialogTitle>
            <AlertDialogDescription>This permanently deletes the project. Projects with tasks cannot be deleted.</AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && <p role="alert" className="text-sm text-destructive">{deleteError}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button type="button" variant="destructive" disabled={deleteProject.isPending} onClick={() => void confirmDelete()}>
              {deleteProject.isPending ? 'Deleting…' : 'Delete project'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {settingsOpen && (
        <ProjectSettingsDialog
          key={project.id}
          project={settingsProject}
          projects={projectsForUniqueness}
          defaultOpen
          hideTrigger
          onOpenChange={(open) => {
            if (!open) setSettingsOpen(false);
          }}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}
