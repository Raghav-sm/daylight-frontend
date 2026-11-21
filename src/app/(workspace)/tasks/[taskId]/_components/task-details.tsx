'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { useProject, useProjects } from '@/features/projects/data';
import { useUpdateTask } from '@/features/tasks/data';
import type { Project } from '@/features/projects/types';
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
} from '@/components/ui/alert-dialog';

type TaskDetailsProps = {
  task: Task;
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

function designatedStageId(project: Project | undefined, completed: boolean) {
  return completed ? project?.finalStageId ?? null : project?.initialStageId ?? null;
}

function buildUpdatePayload(
  draft: Task,
  source: Task,
  placement: PlacementIntent,
): TaskUpdatePayload {
  const payload: TaskUpdatePayload = {};
  const title = draft.title.trim();
  if (draft.title !== source.title) payload.title = title;
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

type PendingNavigation = { kind: 'link'; href: string } | { kind: 'history' };

export function TaskDetails({ task }: TaskDetailsProps) {
  const router = useRouter();
  const { data: projectSummaries = [] } = useProjects();
  const updateTask = useUpdateTask();

  const [draft, setDraft] = useState<Task>(task);
  const [baseline, setBaseline] = useState<Task>(task);
  const [placement, setPlacement] = useState<PlacementIntent>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [navigationGuardOpen, setNavigationGuardOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const dirtyRef = useRef(false);
  const navigationGuardRef = useRef(false);
  const pendingNavigationRef = useRef<PendingNavigation | null>(null);
  const guardSentinelActiveRef = useRef(false);
  const restoringGuardEntryRef = useRef(false);
  const discardingHistoryNavigationRef = useRef(false);
  const navigationAfterSentinelRef = useRef<string | null>(null);

  const {
    data: draftProject,
    isLoading: stagesLoading,
    isError: stagesError,
    refetch: refetchStages,
  } = useProject(draft.projectId);

  const hasChanges = draftHasChanges(draft, baseline, placement);
  const completedSubtasks = draft.subtasks.filter((subtask) => subtask.completed).length;

  useEffect(() => {
    if (dirtyRef.current) return;
    setDraft(task);
    setBaseline(task);
    setPlacement(null);
    setSaveError('');
  }, [task]);

  useEffect(() => {
    dirtyRef.current = hasChanges;
  }, [hasChanges]);

  useEffect(() => {
    navigationGuardRef.current = navigationGuardOpen;
  }, [navigationGuardOpen]);

  useEffect(() => {
    if (!hasChanges || guardSentinelActiveRef.current) return;
    window.history.pushState({ ...window.history.state, daylightTaskGuard: task.id }, '', window.location.href);
    guardSentinelActiveRef.current = true;
  }, [hasChanges, task.id]);

  useEffect(() => {
    function handlePopState() {
      if (restoringGuardEntryRef.current) {
        restoringGuardEntryRef.current = false;
        return;
      }
      if (discardingHistoryNavigationRef.current) {
        discardingHistoryNavigationRef.current = false;
        guardSentinelActiveRef.current = false;
        return;
      }
      const pendingHref = navigationAfterSentinelRef.current;
      if (pendingHref) {
        navigationAfterSentinelRef.current = null;
        guardSentinelActiveRef.current = false;
        router.push(pendingHref);
        return;
      }
      if (!guardSentinelActiveRef.current) return;
      if (dirtyRef.current) {
        pendingNavigationRef.current = { kind: 'history' };
        setNavigationGuardOpen(true);
        return;
      }
      guardSentinelActiveRef.current = false;
      window.history.back();
    }

    function handleLinkClick(event: MouseEvent) {
      if (!dirtyRef.current || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest('a[href]');
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target && anchor.target !== '_self' || anchor.hasAttribute('download')) return;
      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin || destination.href === window.location.href) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      pendingNavigationRef.current = {
        kind: 'link',
        href: `${destination.pathname}${destination.search}${destination.hash}`,
      };
      setNavigationGuardOpen(true);
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!dirtyRef.current) return;
      event.preventDefault();
      event.returnValue = '';
    }

    document.addEventListener('click', handleLinkClick, true);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      document.removeEventListener('click', handleLinkClick, true);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [router]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's' && !navigationGuardRef.current) {
        event.preventDefault();
        formRef.current?.requestSubmit();
      } else if (event.key === 'Escape' && dirtyRef.current && !navigationGuardRef.current && !event.defaultPrevented) {
        event.preventDefault();
        discardChanges();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  });

  const displayStageId =
    placement?.kind === 'stage'
      ? placement.stageId
      : placement?.kind === 'completion'
        ? (designatedStageId(draftProject, placement.completed) ?? draft.stageId)
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

  function setStage(stageId: string | null) {
    setPlacement({ kind: 'stage', stageId });
    const completed = stageId === draftProject?.finalStageId;
    setDraft((current) => ({ ...current, stageId, completed }));
    setSaveError('');
  }

  function setProject(projectId: string) {
    setPlacement({ kind: 'auto-transfer' });
    setDraft((current) => ({ ...current, projectId, stageId: null }));
    setSaveError('');
  }

  function discardChanges() {
    dirtyRef.current = false;
    setDraft(baseline);
    setPlacement(null);
    setNewSubtaskTitle('');
    setSaveError('');
    updateTask.reset();
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
      dirtyRef.current = false;
    } catch {
      setSaveError("Couldn't save. Check your connection.");
    } finally {
      setSaving(false);
    }
  }

  function keepEditing() {
    const pending = pendingNavigationRef.current;
    pendingNavigationRef.current = null;
    setNavigationGuardOpen(false);
    if (pending?.kind === 'history' && guardSentinelActiveRef.current) {
      restoringGuardEntryRef.current = true;
      window.history.forward();
    }
  }

  function discardAndLeave() {
    const pending = pendingNavigationRef.current;
    pendingNavigationRef.current = null;
    discardChanges();
    setNavigationGuardOpen(false);
    if (pending?.kind === 'link') {
      if (guardSentinelActiveRef.current) {
        navigationAfterSentinelRef.current = pending.href;
        window.history.back();
      } else {
        router.push(pending.href);
      }
    } else if (pending?.kind === 'history' && guardSentinelActiveRef.current) {
      guardSentinelActiveRef.current = false;
      discardingHistoryNavigationRef.current = true;
      window.history.back();
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

  return (
    <form ref={formRef} id="task-details-form" data-stage-color={currentStageColorIndex} onSubmit={saveTask} className="flex flex-1 flex-col gap-3">

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-3">
          <h2 className="font-heading flex min-h-10 items-end text-2xl tracking-tight">
            {baseline.title.trim() || 'Untitled task'}
          </h2>
          <Card className="min-w-0 gap-5 rounded-xl p-5 sm:p-6">
          <div className="space-y-1.5">
            <label htmlFor="task-title" className="block text-sm font-medium">
              Task Name
            </label>
            <Input
              id="task-title"
              value={draft.title}
              onChange={(event) => updateDraft({ title: event.target.value })}
              placeholder="Task title"
              required
            />
          </div>

          <section className="space-y-2.5" aria-labelledby="task-notes-heading">
            <p id="task-notes-heading" className="block text-sm font-medium">
              Notes
            </p>
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
              <p id="task-subtasks-heading" className="block text-sm font-medium">
                Subtasks
              </p>
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
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <h2 id="task-properties-heading" className="flex min-h-10 items-end text-sm font-semibold">
            Details
          </h2>
          <Card className="min-w-0 gap-0 rounded-xl p-5 sm:p-6" aria-labelledby="task-properties-heading">
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

          <p className="pt-5 text-xs text-muted-foreground">
            Created {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(task.createdAt))}
          </p>
          </Card>
          {(hasChanges || saveError) && (
            <div className="flex flex-col items-end gap-2" role="region" aria-label="Task changes" aria-live="polite">
              {saveError && <p className="w-full text-right text-sm text-destructive">{saveError}</p>}
              <div className="flex items-center gap-2">
                <Button type="button" variant="secondary" size="sm" disabled={saving || updateTask.isPending} onClick={discardChanges}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={!draft.title.trim() || saving || updateTask.isPending}>
                  {saving || updateTask.isPending ? 'Saving…' : saveError ? 'Retry' : 'Save'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AlertDialog
        open={navigationGuardOpen}
        onOpenChange={(open) => {
          if (open) setNavigationGuardOpen(true);
          else keepEditing();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>You have unsaved changes. Leave this task and discard them?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button type="button" variant="secondary" size="sm" onClick={keepEditing}>Keep editing</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button type="button" variant="destructive" size="sm" onClick={(event) => {
                event.preventDefault();
                discardAndLeave();
              }}>Discard</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}
