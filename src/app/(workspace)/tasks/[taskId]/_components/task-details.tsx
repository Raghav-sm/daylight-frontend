'use client';

import { useState, type FormEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useProjectDetail, useProjectSummaries } from '@/features/projects/data';
import { useUpdateTask } from '@/features/tasks/data';
import type { ProjectStage } from '@/features/projects/types';
import type { SubtaskWrite, Task, TaskUpdatePayload } from '@/features/tasks/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type TaskDetailsProps = {
  task: Task;
  onDelete: () => Promise<void>;
  deletePending?: boolean;
  deleteError?: string | null;
  onDeleteDialogOpenChange?: (open: boolean) => void;
};

/** Last placement control the user touched. Determines which field is sent on save. */
type PlacementIntent =
  | { kind: 'completion'; completed: boolean }
  | { kind: 'stage'; stageId: string | null }
  | { kind: 'auto-transfer' }
  | null;

function subtasksEqual(a: Task['subtasks'], b: Task['subtasks']) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function namedStageId(stages: ProjectStage[] | undefined, completed: boolean) {
  const target = completed ? 'completed' : 'to do';
  return stages?.find((stage) => stage.name.toLowerCase() === target)?.id ?? null;
}

function buildUpdatePayload(
  draft: Task,
  source: Task,
  placement: PlacementIntent,
): TaskUpdatePayload {
  const payload: TaskUpdatePayload = {};
  const title = draft.title.trim();
  if (title !== source.title) payload.title = title;
  if (draft.notes !== source.notes) payload.notes = draft.notes;
  if (draft.projectId !== source.projectId) payload.projectId = draft.projectId;
  if (draft.dueDate !== source.dueDate) payload.dueDate = draft.dueDate;
  if (draft.dueTime !== source.dueTime) payload.dueTime = draft.dueTime;
  if (draft.priority !== source.priority) payload.priority = draft.priority;

  if (placement?.kind === 'completion') {
    if (placement.completed !== source.completed) payload.completed = placement.completed;
  } else if (placement?.kind === 'stage') {
    if (placement.stageId !== source.stageId) payload.stageId = placement.stageId;
  }
  // auto-transfer: omit stageId so the backend assigns by completion

  if (!subtasksEqual(draft.subtasks, source.subtasks)) {
    payload.subtasks = draft.subtasks.map<SubtaskWrite>((item) => ({
      id: item.id,
      title: item.title,
      completed: item.completed,
    }));
  }
  return payload;
}

function draftHasChanges(draft: Task, source: Task, placement: PlacementIntent) {
  return Object.keys(buildUpdatePayload(draft, source, placement)).length > 0;
}

export function TaskDetails({
  task,
  onDelete,
  deletePending = false,
  deleteError = null,
  onDeleteDialogOpenChange,
}: TaskDetailsProps) {
  const { data: projectSummaries = [] } = useProjectSummaries();
  const updateTask = useUpdateTask();

  const [draft, setDraft] = useState<Task>(task);
  const [baseline, setBaseline] = useState<Task>(task);
  const [trackedTaskId, setTrackedTaskId] = useState(task.id);
  const [placement, setPlacement] = useState<PlacementIntent>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const {
    data: draftProject,
    isLoading: stagesLoading,
    isError: stagesError,
    refetch: refetchStages,
  } = useProjectDetail(draft.projectId);

  const hasChanges = draftHasChanges(draft, baseline, placement);
  const completedSubtasks = draft.subtasks.filter((subtask) => subtask.completed).length;

  if (task.id !== trackedTaskId) {
    setTrackedTaskId(task.id);
    setDraft(task);
    setBaseline(task);
    setPlacement(null);
  } else if (!hasChanges && JSON.stringify(task) !== JSON.stringify(baseline)) {
    setDraft(task);
    setBaseline(task);
    setPlacement(null);
  }

  const displayCompleted =
    placement?.kind === 'completion'
      ? placement.completed
      : placement?.kind === 'stage'
        ? Boolean(
            draftProject?.stages.find((stage) => stage.id === placement.stageId)?.name.toLowerCase() ===
              'completed',
          )
        : draft.completed;

  const displayStageId =
    placement?.kind === 'stage'
      ? placement.stageId
      : placement?.kind === 'completion'
        ? (namedStageId(draftProject?.stages, placement.completed) ?? draft.stageId)
        : placement?.kind === 'auto-transfer'
          ? null
          : draft.stageId;
  const currentStageIndex = Math.max(
    0,
    draftProject?.stages.findIndex((stage) => stage.id === displayStageId) ?? 0,
  );
  const currentStageColorIndex = currentStageIndex < 3 ? currentStageIndex : 3 + ((currentStageIndex - 3) % 3);

  function updateDraft(changes: Partial<Task>) {
    setDraft((current) => ({ ...current, ...changes }));
    setSaveError('');
  }

  function setCompletion(completed: boolean) {
    setPlacement({ kind: 'completion', completed });
    setDraft((current) => ({ ...current, completed }));
    setSaveError('');
  }

  function setStage(stageId: string | null) {
    setPlacement({ kind: 'stage', stageId });
    const stageName = draftProject?.stages.find((stage) => stage.id === stageId)?.name;
    const completed = stageName ? stageName.toLowerCase() === 'completed' : draft.completed;
    setDraft((current) => ({ ...current, stageId, completed }));
    setSaveError('');
  }

  function setProject(projectId: string) {
    setPlacement({ kind: 'auto-transfer' });
    setDraft((current) => ({ ...current, projectId, stageId: null }));
    setSaveError('');
  }

  async function saveTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.title.trim() || saving || updateTask.isPending) return;

    const payload = buildUpdatePayload(draft, baseline, placement);
    if (Object.keys(payload).length === 0) return;

    setSaving(true);
    setSaveError('');
    try {
      const saved = await updateTask.mutateAsync({
        taskId: task.id,
        payload,
        sourceProjectId: baseline.projectId,
      });
      setBaseline(saved);
      setDraft(saved);
      setPlacement(null);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Could not save this task. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function addSubtask() {
    const title = newSubtaskTitle.trim();
    if (!title) return;
    updateDraft({
      subtasks: [...draft.subtasks, { id: crypto.randomUUID(), title, completed: false }],
    });
    setNewSubtaskTitle('');
  }

  function updateSubtask(id: string, changes: Partial<Task['subtasks'][number]>) {
    updateDraft({
      subtasks: draft.subtasks.map((item) => (item.id === id ? { ...item, ...changes } : item)),
    });
  }

  function handleDeleteDialogChange(open: boolean) {
    setConfirmDelete(open);
    onDeleteDialogOpenChange?.(open);
  }

  async function confirmDeleteTask(event: React.MouseEvent) {
    event.preventDefault();
    if (deletePending) return;
    try {
      await onDelete();
    } catch {
      // Parent keeps dialog open and surfaces deleteError.
    }
  }

  return (
    <form id="task-details-form" data-stage-color={currentStageColorIndex} onSubmit={saveTask} className="space-y-3">
      <div className="flex flex-wrap items-center justify-end gap-3">
        {saveError && (
          <p role="alert" className="text-sm text-destructive">
            {saveError}
          </p>
        )}
        {hasChanges && !saveError && <span className="text-xs text-muted-foreground">Unsaved changes</span>}
        <Button type="submit" size="sm" disabled={!draft.title.trim() || !hasChanges || saving || updateTask.isPending}>
          {saving || updateTask.isPending ? 'Saving…' : 'Save changes'}
        </Button>
      </div>

      <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="min-w-0 gap-6 rounded-xl p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <Checkbox
              aria-label={displayCompleted ? 'Mark task incomplete' : 'Complete task'}
              className="size-5 rounded-full border-[1.5px] border-[var(--stage)] text-primary data-checked:border-[var(--stage-done)] data-checked:bg-stage-done [&_[data-slot=checkbox-indicator]]:rounded-full"
              checked={displayCompleted}
              onCheckedChange={(checked) => setCompletion(checked === true)}
            />
            <label htmlFor="task-title" className="sr-only">
              Task title
            </label>
            <Input
              id="task-title"
              className="font-heading h-auto min-w-0 flex-1 border-transparent bg-transparent px-0 py-1 text-[22px] tracking-tight shadow-none hover:border-transparent focus-visible:border-ring focus-visible:ring-2"
              value={draft.title}
              onChange={(event) => updateDraft({ title: event.target.value })}
              placeholder="Task title"
              required
            />
          </div>

          <section className="space-y-2.5" aria-labelledby="task-notes-heading">
            <h2 id="task-notes-heading" className="text-sm font-semibold">
              Notes
            </h2>
            <label htmlFor="task-notes" className="sr-only">
              Task notes
            </label>
            <Textarea
              id="task-notes"
              className="min-h-28 resize-y border-input bg-background px-3 py-2.5"
              value={draft.notes}
              onChange={(event) => updateDraft({ notes: event.target.value })}
              placeholder="Add notes, links, or context…"
              rows={4}
            />
          </section>

          <section className="space-y-3" aria-labelledby="task-subtasks-heading">
            <div className="flex items-center justify-between gap-3">
              <h2 id="task-subtasks-heading" className="text-sm font-semibold">
                Subtasks
              </h2>
              <span className="text-xs text-muted-foreground">
                {completedSubtasks}/{draft.subtasks.length}
              </span>
            </div>
            {draft.subtasks.length === 0 && <p className="text-sm text-muted-foreground">No subtasks yet.</p>}
            {draft.subtasks.length > 0 && (
              <ul className="space-y-1">
                {draft.subtasks.map((subtask) => (
                  <li key={subtask.id} className="flex items-center gap-2 rounded-md py-1">
                    <Checkbox
                      aria-label={`Complete subtask ${subtask.title}`}
                      checked={subtask.completed}
                      onCheckedChange={(checked) => updateSubtask(subtask.id, { completed: checked === true })}
                    />
                    <Input
                      aria-label="Subtask title"
                      className={`h-8 border-transparent bg-transparent px-2 shadow-none focus-visible:border-input ${subtask.completed ? 'text-muted-foreground line-through' : ''}`}
                      value={subtask.title}
                      onChange={(event) => updateSubtask(subtask.id, { title: event.target.value })}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon-sm"
                      className="shrink-0 bg-transparent text-muted-foreground shadow-none hover:text-destructive"
                      aria-label={`Remove subtask ${subtask.title}`}
                      onClick={() =>
                        updateDraft({ subtasks: draft.subtasks.filter((item) => item.id !== subtask.id) })
                      }
                    >
                      <Trash2 aria-hidden="true" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-2">
              <Input
                aria-label="New subtask"
                placeholder="Add a subtask"
                value={newSubtaskTitle}
                onChange={(event) => setNewSubtaskTitle(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    addSubtask();
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={!newSubtaskTitle.trim()}
                onClick={addSubtask}
              >
                <Plus aria-hidden="true" />
                Add
              </Button>
            </div>
          </section>
        </Card>

        <Card className="min-w-0 gap-0 rounded-xl p-5 sm:p-6" aria-labelledby="task-properties-heading">
          <h2 id="task-properties-heading" className="mb-5 text-sm font-semibold">
            Details
          </h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="task-project" className="block text-sm font-medium">
                Project
              </label>
              <Select value={draft.projectId} onValueChange={setProject}>
                <SelectTrigger id="task-project">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {projectSummaries.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="task-stage" className="block text-sm font-medium">
                Stage
              </label>
              <Select
                value={
                  placement?.kind === 'auto-transfer'
                    ? 'auto'
                    : (displayStageId ?? 'unassigned')
                }
                disabled={stagesLoading || !draftProject}
                onValueChange={(value) => {
                  if (value === 'auto') return;
                  setStage(value === 'unassigned' ? null : value);
                }}
              >
                <SelectTrigger id="task-stage">
                  <SelectValue placeholder={stagesLoading ? 'Loading stages…' : 'Select stage'} />
                </SelectTrigger>
                <SelectContent>
                  {placement?.kind === 'auto-transfer' && (
                    <SelectItem value="auto">Assign automatically</SelectItem>
                  )}
                  <SelectItem value="unassigned">No stage</SelectItem>
                  {draftProject?.stages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {stagesError && (
                <p role="alert" className="text-xs text-destructive">
                  Could not load stages.{' '}
                  <button type="button" className="underline" onClick={() => void refetchStages()}>
                    Retry
                  </button>
                </p>
              )}
              {placement?.kind === 'auto-transfer' && !stagesError && (
                <p className="text-xs text-muted-foreground">
                  Stage will be assigned for the destination project when you save.
                </p>
              )}
            </div>
            <div className="grid min-w-0 grid-cols-2 gap-2">
              <div className="min-w-0 space-y-1.5">
                <label htmlFor="task-due-date" className="block text-sm font-medium">
                  Due date
                </label>
                <Input
                  id="task-due-date"
                  type="date"
                  className="min-w-0 px-2"
                  value={draft.dueDate ?? ''}
                  onChange={(event) =>
                    updateDraft({
                      dueDate: event.target.value || null,
                      dueTime: event.target.value ? draft.dueTime : null,
                    })
                  }
                />
              </div>
              <div className="min-w-0 space-y-1.5">
                <label htmlFor="task-due-time" className="block text-sm font-medium">
                  Due time
                </label>
                <Input
                  id="task-due-time"
                  type="time"
                  className="min-w-0 px-2"
                  value={draft.dueTime ?? ''}
                  disabled={!draft.dueDate}
                  onChange={(event) => updateDraft({ dueTime: event.target.value || null })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <span id="task-priority-label" className="block text-sm font-medium">
                Priority
              </span>
              <div role="group" aria-labelledby="task-priority-label" className="grid grid-cols-4 gap-1 rounded-lg bg-muted p-1">
                {(
                  [
                    { value: 'none', label: 'None' },
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Med' },
                    { value: 'high', label: 'High' },
                  ] as const
                ).map(({ value, label }) => (
                  <Button
                    key={value}
                    type="button"
                    variant="secondary"
                    size="sm"
                    aria-pressed={draft.priority === value}
                    className={
                      draft.priority === value
                        ? 'min-w-0 border border-border bg-card px-1 text-foreground hover:bg-card'
                        : 'min-w-0 bg-transparent px-1 text-muted-foreground hover:bg-background hover:text-foreground'
                    }
                    onClick={() => updateDraft({ priority: value })}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-auto space-y-3 pt-8">
            <p className="text-xs text-muted-foreground">
              Created {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(task.createdAt))}
            </p>
            <AlertDialog open={confirmDelete} onOpenChange={handleDeleteDialogChange}>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive" size="sm">
                  <Trash2 aria-hidden="true" />
                  Delete task
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete “{task.title}”?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. The task and its subtasks will be deleted.
                  </AlertDialogDescription>
                  {deleteError && (
                    <p role="alert" className="text-sm text-destructive">
                      {deleteError}
                    </p>
                  )}
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel asChild>
                    <Button type="button" variant="secondary" size="sm" disabled={deletePending}>
                      Cancel
                    </Button>
                  </AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={deletePending}
                      onClick={(event) => void confirmDeleteTask(event)}
                    >
                      {deletePending ? 'Deleting…' : 'Delete task'}
                    </Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </Card>
      </div>
    </form>
  );
}
