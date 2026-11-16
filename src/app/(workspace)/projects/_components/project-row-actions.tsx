'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal } from 'lucide-react';
import { ProjectSettingsDialog } from '@/components/projects/project-settings-dialog';
import {
  useDeleteProject,
  useProjectDetail,
  useProjectSummaries,
  useUpdateProject,
} from '@/features/projects/data';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ProjectSummary } from '@/features/projects/types';

export function ProjectRowActions({ project }: { project: ProjectSummary }) {
  const router = useRouter();
  const { data: allSummaries = [] } = useProjectSummaries();
  const { data: projectDetail } = useProjectDetail(project.id);
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const [settingsOpen, setSettingsOpen] = useState(false);

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

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label={`Actions for ${project.name}`}
          >
            <MoreHorizontal aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={openProject}>Open</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setSettingsOpen(true)}>Edit</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:bg-destructive-soft focus:text-destructive"
            onSelect={() => setSettingsOpen(true)}
          >
            Delete…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
