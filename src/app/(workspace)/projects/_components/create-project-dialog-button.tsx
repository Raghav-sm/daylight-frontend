'use client';

import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { ProjectCreateDialog } from '@/components/projects/project-create-dialog';
import { useWorkspaceData } from '@/providers/workspace-data-provider';
import { Button } from '@/components/ui/button';
import type { ProjectColor } from '@/lib/task-types';

type CreateProjectDialogButtonProps = {
  label?: string;
  className?: string;
};

export default function CreateProjectDialogButton({
  label = 'Create project',
  className,
}: CreateProjectDialogButtonProps) {
  const router = useRouter();
  const { projects, createProject } = useWorkspaceData();

  async function handleCreate(name: string, color: ProjectColor) {
    const project = await createProject(name, color);
    if (project) router.push(`/projects/${encodeURIComponent(project.id)}`);
    return project;
  }

  return (
    <ProjectCreateDialog
      projects={projects}
      onCreate={handleCreate}
      trigger={(
        <Button type="button" size="sm" className={className}>
          <Plus aria-hidden="true" />
          {label}
        </Button>
      )}
    />
  );
}
