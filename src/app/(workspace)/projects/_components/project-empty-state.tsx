import { FolderKanban } from 'lucide-react';
import CreateProjectDialogButton from '@/app/(workspace)/projects/_components/create-project-dialog-button';

export function ProjectEmptyState() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 py-12 text-center">
      <span className="mb-4 flex size-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <FolderKanban aria-hidden="true" className="size-6" />
      </span>
      <h3 className="text-base font-semibold">Start with a project</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Create a project to get a Kanban board. Tasks are added to a stage inside that board.
      </p>
      <CreateProjectDialogButton label="Create your first project" className="mt-5" />
    </div>
  );
}
