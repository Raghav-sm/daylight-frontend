'use client';

import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { ProjectCreateDialog } from '@/components/projects/project-create-dialog';
import { useCreateProject, useProjectSummaries } from '@/features/projects/data';
import { Button } from '@/components/ui/button';
import type { ProjectColor } from '@/features/projects/types';

type CreateProjectDialogButtonProps = {
  label?: string;
  className?: string;
};

export default function CreateProjectDialogButton({
  label = 'Create project',
  className,
}: CreateProjectDialogButtonProps) {
  const router = useRouter();
  const { data: summaries = [] } = useProjectSummaries();
  const createProject = useCreateProject();

  const projectsForUniqueness = summaries.map((item) => ({
    id: item.id,
    name: item.name,
  }));

  async function handleCreate(name: string, color: ProjectColor) {
    try {
      const project = await createProject.mutateAsync({ name, color });
      router.push(`/projects/${encodeURIComponent(project.id)}`);
      return project;
    } catch {
      return null;
    }
  }

  return (
    <ProjectCreateDialog
      projects={projectsForUniqueness}
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
