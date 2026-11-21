'use client';

import { useRef, useState, type FormEvent } from 'react';
import { ArrowDown, ArrowUp, ListChecks, Pencil, Trash2 } from 'lucide-react';
import type { Project, ProjectColor, ProjectStage } from '@/features/projects/types';
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
import { DialogFooter } from '@/components/ui/dialog';
import { DialogFlow, type DialogFlowScreen } from '@/components/ui/dialog-flow';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type ProjectIdentity = Pick<Project, 'id' | 'name' | 'color'>;
type EditableProject = ProjectIdentity & Partial<Pick<Project, 'stages' | 'initialStageId' | 'finalStageId'>>;

export type ProjectSettingsView = 'settings' | 'stages' | 'delete-stage';

type ProjectSettingsDialogProps = {
  project: EditableProject;
  projects: ProjectIdentity[];
  onSave: (projectId: string, name: string, color: ProjectColor) => Promise<boolean>;
  onDelete: (projectId: string) => Promise<boolean>;
  onStageDelete?: (stageId: string, targetStageId?: string) => Promise<boolean>;
  onStageRoleChange?: (role: 'initialStageId' | 'finalStageId', stageId: string) => Promise<boolean>;
  onStageReorder?: (stageIds: string[]) => Promise<boolean>;
  stageTaskCounts?: Record<string, number>;
  stageTaskCountsReady?: boolean;
  view?: ProjectSettingsView;
  onViewChange?: (view: ProjectSettingsView) => void;
  defaultOpen?: boolean;
  hideTrigger?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function ProjectSettingsDialog({
  project,
  projects,
  onSave,
  onDelete,
  onStageDelete,
  onStageRoleChange,
  onStageReorder,
  stageTaskCounts = {},
  stageTaskCountsReady = true,
  view,
  onViewChange,
  defaultOpen = false,
  hideTrigger = false,
  onOpenChange,
}: ProjectSettingsDialogProps) {
  const stages = project.stages ?? [];
  const [open, setOpen] = useState(defaultOpen);
  const [internalView, setInternalView] = useState<ProjectSettingsView>('settings');
  const activeView = view ?? internalView;
  const [name, setName] = useState(project.name);
  const [color, setColor] = useState<ProjectColor>(project.color);
  const [error, setError] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [stageToDelete, setStageToDelete] = useState<ProjectStage | null>(null);
  const [targetStageId, setTargetStageId] = useState('');
  const [stageDeleteError, setStageDeleteError] = useState('');
  const [deletingStage, setDeletingStage] = useState(false);
  const [savingStage, setSavingStage] = useState(false);
  const [stageError, setStageError] = useState('');
  const editTriggerRef = useRef<HTMLButtonElement>(null);
  const openDeleteAfterSettingsClose = useRef(false);

  function changeView(nextView: ProjectSettingsView) {
    setInternalView(nextView);
    onViewChange?.(nextView);
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      setName(project.name);
      setColor(project.color);
      setError('');
      setDeleteError('');
      changeView('settings');
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

  function openStageDelete(stage: ProjectStage) {
    const otherStages = stages.filter((item) => item.id !== stage.id);
    setStageToDelete(stage);
    setTargetStageId(otherStages[0]?.id ?? '');
    setStageDeleteError('');
    changeView('delete-stage');
  }

  function returnToStages() {
    setStageToDelete(null);
    setStageDeleteError('');
    changeView('stages');
  }

  async function deleteStage() {
    if (!stageToDelete || !onStageDelete) return;
    setDeletingStage(true);
    const hasTasks = (stageTaskCounts[stageToDelete.id] ?? 0) > 0;
    const deleted = await onStageDelete(stageToDelete.id, hasTasks ? targetStageId : undefined);
    setDeletingStage(false);
    if (!deleted) {
      setStageDeleteError('This stage could not be deleted. Refresh the board and try again.');
      return;
    }
    setStageToDelete(null);
    changeView('stages');
  }

  async function changeStageRole(role: 'initialStageId' | 'finalStageId', stageId: string) {
    if (!onStageRoleChange) return;
    setSavingStage(true);
    setStageError('');
    const saved = await onStageRoleChange(role, stageId);
    setSavingStage(false);
    if (!saved) setStageError('Could not update the stage. Choose a different stage and try again.');
  }

  async function moveStage(index: number, direction: -1 | 1) {
    if (!onStageReorder) return;
    const reordered = stages.map((stage) => stage.id);
    [reordered[index], reordered[index + direction]] = [reordered[index + direction], reordered[index]];
    setSavingStage(true);
    setStageError('');
    const saved = await onStageReorder(reordered);
    setSavingStage(false);
    if (!saved) setStageError('Could not reorder the stages. Try again.');
  }

  const screens: Record<ProjectSettingsView, DialogFlowScreen> = {
    settings: {
      title: 'Project settings',
      description: 'Update project details and manage its workflow stages.',
      content: (
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
          {onStageDelete && project.stages && (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">Stages</p>
                <p className="text-xs text-muted-foreground">{stages.length} in this project</p>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={() => changeView('stages')}>
                <ListChecks aria-hidden="true" />Manage stages
              </Button>
            </div>
          )}
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <DialogFooter className="pt-1 sm:justify-between">
            <Button type="button" variant="destructive" size="sm" onClick={() => {
              openDeleteAfterSettingsClose.current = true;
              setDeleteError('');
              handleOpenChange(false);
            }}>Delete</Button>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => handleOpenChange(false)}>Cancel</Button>
              <Button type="submit" size="sm" disabled={!name.trim()}>Save</Button>
            </div>
          </DialogFooter>
        </form>
      ),
    },
    stages: {
      title: 'Manage stages',
      description: 'Set where tasks start and finish, and arrange the board columns.',
      backLabel: 'Project settings',
      onBack: () => changeView('settings'),
      content: stages.length > 0 ? (
        <div className="space-y-2">
          {stageError && <p role="alert" className="text-sm text-destructive">{stageError}</p>}
          {stages.map((stage, index) => {
            const taskCount = stageTaskCounts[stage.id] ?? 0;
            const isLastStage = stages.length <= 1;
            return (
              <div key={stage.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5">
                <div className="flex min-w-0 flex-col gap-1.5">
                  <div className="flex items-center gap-2.5">
                    <span data-project-color={stage.color} className="project-color-dot size-2.5 shrink-0 rounded-full" />
                    <span className="truncate text-sm font-medium">{stage.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button type="button" variant={project.initialStageId === stage.id ? 'secondary' : 'ghost'} size="sm" disabled={savingStage || project.initialStageId === stage.id} onClick={() => void changeStageRole('initialStageId', stage.id)}>Initial</Button>
                    <Button type="button" variant={project.finalStageId === stage.id ? 'secondary' : 'ghost'} size="sm" disabled={savingStage || project.finalStageId === stage.id} onClick={() => void changeStageRole('finalStageId', stage.id)}>Final</Button>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button type="button" variant="ghost" size="icon-sm" aria-label={`Move ${stage.name} up`} disabled={savingStage || index === 0} onClick={() => void moveStage(index, -1)}><ArrowUp aria-hidden="true" /></Button>
                  <Button type="button" variant="ghost" size="icon-sm" aria-label={`Move ${stage.name} down`} disabled={savingStage || index === stages.length - 1} onClick={() => void moveStage(index, 1)}><ArrowDown aria-hidden="true" /></Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Delete ${stage.name} stage`}
                    title={isLastStage
                      ? 'A project must have at least one stage'
                      : !stageTaskCountsReady
                        ? 'Task counts are still loading'
                        : `Delete ${stage.name}`}
                    disabled={savingStage || isLastStage || !stageTaskCountsReady}
                    onClick={() => openStageDelete(stage)}
                  >
                    <Trash2 aria-hidden="true" className="size-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No stages have been added yet.</p>
      ),
    },
    'delete-stage': {
      title: stageToDelete ? `Delete “${stageToDelete.name}”?` : 'Delete stage',
      description: stageToDelete
        ? (stageTaskCounts[stageToDelete.id] ?? 0) > 0
          ? `${stageTaskCounts[stageToDelete.id]} ${stageTaskCounts[stageToDelete.id] === 1 ? 'task is' : 'tasks are'} in this stage. Choose where to move ${stageTaskCounts[stageToDelete.id] === 1 ? 'it' : 'them'}.`
          : 'This stage will be removed from the project.'
        : undefined,
      backLabel: 'Manage stages',
      onBack: returnToStages,
      content: stageToDelete ? (
        <>
          {(stageTaskCounts[stageToDelete.id] ?? 0) > 0 && (
            <div className="space-y-1.5">
              <label htmlFor="stage-delete-target" className="text-sm font-medium">Move tasks to</label>
              <Select value={targetStageId} onValueChange={setTargetStageId}>
                <SelectTrigger id="stage-delete-target"><SelectValue placeholder="Choose a stage" /></SelectTrigger>
                <SelectContent>
                  {stages.filter((item) => item.id !== stageToDelete.id).map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>{stage.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {stageDeleteError && <p role="alert" className="text-sm text-destructive">{stageDeleteError}</p>}
          <DialogFooter>
            <Button type="button" variant="secondary" size="sm" disabled={deletingStage} onClick={returnToStages}>Cancel</Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={deletingStage || ((stageTaskCounts[stageToDelete.id] ?? 0) > 0 && !targetStageId)}
              onClick={() => void deleteStage()}
            >
              {deletingStage ? 'Deleting…' : 'Delete stage'}
            </Button>
          </DialogFooter>
        </>
      ) : null,
    },
  };

  return (
    <>
      <DialogFlow
        open={open}
        onOpenChange={handleOpenChange}
        view={activeView}
        views={screens}
        className="max-w-lg"
        trigger={!hideTrigger ? (
          <Button ref={editTriggerRef} type="button" size="sm"><Pencil aria-hidden="true" />Edit project</Button>
        ) : undefined}
        onCloseAutoFocus={(event) => {
          if (openDeleteAfterSettingsClose.current) {
            event.preventDefault();
            openDeleteAfterSettingsClose.current = false;
            setDeleteOpen(true);
          }
        }}
      />

      <AlertDialog
        open={deleteOpen}
        onOpenChange={(nextOpen) => {
          setDeleteOpen(nextOpen);
          if (!nextOpen && !open) onOpenChange?.(false);
        }}
      >
        <AlertDialogContent className="font-sans" onCloseAutoFocus={(event) => {
          event.preventDefault();
          editTriggerRef.current?.focus();
        }}>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-sans">Delete “{project.name}”?</AlertDialogTitle>
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
