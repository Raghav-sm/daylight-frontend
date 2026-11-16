'use client';

import { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Sparkles,
} from 'lucide-react';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { BoardSurface, StageColumnFrame } from '@/components/boards/kanban-view';
import { KanbanCard } from '@/components/boards/kanban-card';
import { AssistantPreview } from '@/components/assistant/assistant-panel';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import {
  demoProject,
  demoProjects,
  demoPrompt,
  finalDemoTasks,
  initialDemoTasks,
} from './demo-data';

const TOTAL_MS = 16000;

export function PreviewWindow() {
  const [elapsed, setElapsed] = useState(0);
  const [closed, setClosed] = useState(false);
  const finished = elapsed >= TOTAL_MS;

  useEffect(() => {
    if (closed || finished) return;
    const timer = window.setInterval(
      () => setElapsed((time) => Math.min(time + 100, TOTAL_MS)),
      100,
    );
    return () => window.clearInterval(timer);
  }, [closed, finished]);

  const open = !closed && elapsed >= 2000;
  const typing = elapsed >= 3000 && elapsed < 8000;
  const response = elapsed >= 8500;
  const completed = elapsed >= 11000;
  const tasks = completed ? finalDemoTasks : initialDemoTasks;
  const visiblePrompt = typing
    ? demoPrompt.slice(0, Math.min(demoPrompt.length, Math.floor((elapsed - 3000) / 90)))
    : demoPrompt;

  function openAssistant() {
    setClosed(false);
    setElapsed(TOTAL_MS);
  }

  return (
    <div className="relative mx-auto w-full rounded-[1.6rem] border border-border bg-secondary/70 p-2 shadow-[0_40px_80px_-36px_rgba(43,43,43,0.4)] sm:p-3">
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <SidebarProvider
          defaultOpen
          className="relative !min-h-0 h-[560px] w-full overflow-hidden bg-background sm:h-[640px]"
        >
          <AppSidebar
            preview
            activePath={`/projects/${demoProject.id}`}
            activeProjectId={demoProject.id}
            projects={demoProjects}
            projectCounts={Object.fromEntries(
              demoProjects.map((item) => [item.id, item.incompleteTaskCount]),
            )}
            onProjectCreate={async () => null}
          />
          <SidebarInset className="min-h-0 min-w-0 overflow-hidden !rounded-none !shadow-none md:!m-0">
            <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3">
              <SidebarTrigger className="-ml-0.5" aria-label="Toggle sidebar" />
              <Breadcrumb className="min-w-0">
                <BreadcrumbList className="flex-nowrap text-xs">
                  <BreadcrumbItem className="hidden sm:inline-flex">
                    <span className="text-muted-foreground">Projects</span>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden sm:block" />
                  <BreadcrumbItem className="min-w-0">
                    <BreadcrumbPage className="truncate">
                      {demoProject.name}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>

            <div className="relative min-h-0 flex-1 overflow-auto px-3 py-4 sm:px-5">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h3 className="font-heading text-xl tracking-tight sm:text-2xl">
                    {demoProject.name} board
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Move tasks between stages by dragging them.
                  </p>
                </div>
                <div className="hidden gap-2 sm:flex">
                  <Button size="sm" variant="outline" tabIndex={-1}>
                    <Search aria-hidden="true" />
                    Search
                  </Button>
                  <Button size="sm" tabIndex={-1}>
                    <Plus aria-hidden="true" />
                    Add task
                  </Button>
                </div>
              </div>

              <BoardSurface className="mt-5 min-h-[380px] gap-3 overflow-x-auto pb-2 sm:gap-4">
                {demoProject.stages.map((stage, index) => {
                  const stageTasks = tasks.filter((task) => task.stageId === stage.id);
                  return (
                    <StageColumnFrame
                      key={stage.id}
                      stage={stage}
                      stageIndex={index}
                      taskCount={stageTasks.length}
                      className="min-w-[180px] flex-1"
                    >
                      <div className="space-y-2">
                        {stageTasks.map((task) => (
                          <KanbanCard
                            key={task.id}
                            task={task}
                            className={cn(
                              task.id === 't5' && completed && 'ring-1 ring-stage-progress/40',
                              task.id === 't6' && 'animate-in fade-in slide-in-from-bottom-2 duration-500',
                            )}
                          />
                        ))}
                      </div>
                    </StageColumnFrame>
                  );
                })}
              </BoardSurface>

              <AssistantPreview
                open={open}
                prompt={demoPrompt}
                visiblePrompt={visiblePrompt}
                showReply={response}
                showReceipts={elapsed >= 9500}
                onClose={() => {
                  setClosed(true);
                }}
              />

              {!open && (
                <Button
                  type="button"
                  size="icon"
                  className="absolute right-4 bottom-4 z-20 size-11 rounded-full shadow-lg"
                  aria-label="Open Daylight assistant"
                  onClick={openAssistant}
                >
                  <Sparkles aria-hidden="true" />
                </Button>
              )}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>

    </div>
  );
}
