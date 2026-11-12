'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal } from 'lucide-react';
import { ProjectSettingsDialog } from '@/components/projects/project-settings-dialog';
import { useWorkspaceData } from '@/providers/workspace-data-provider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Project } from '@/lib/task-types';

export function ProjectRowActions({ project }: { project: Project }) {
  const router = useRouter();
  const { projects, updateProject, deleteProject } = useWorkspaceData();
  const [settingsOpen, setSettingsOpen] = useState(false);

  function openProject() {
    router.push(`/projects/${encodeURIComponent(project.id)}`);
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
            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
            onSelect={() => setSettingsOpen(true)}
          >
            Delete…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {settingsOpen && (
        <ProjectSettingsDialog
          key={project.id}
          project={project}
          projects={projects}
          defaultOpen
          hideTrigger
          onOpenChange={(open) => {
            if (!open) setSettingsOpen(false);
          }}
          onSave={updateProject}
          onDelete={deleteProject}
        />
      )}
    </>
  );
}
