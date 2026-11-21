'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowUp,
  AtSign,
  Check,
  CornerUpRight,
  History,
  Plus,
  Search,
  Sparkles,
} from 'lucide-react';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Logo, LogoIcon } from '@/components/layout/logo';
import { BoardSurface, StageColumnFrame } from '@/components/boards/kanban-view';
import { KanbanCard } from '@/components/boards/kanban-card';
import { AgentTemplates } from '@/app/(workspace)/daylight/_components/agent-templates';
import '@/app/(workspace)/daylight/_components/agent.css';
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

type PreviewView = 'board' | 'daylight';
type CursorTarget = 'idle' | 'daylight' | 'send' | 'project';

const TICK_MS = 50;
const CURSOR_APPEAR_MS = 1700;
const CURSOR_MOVE_DAYLIGHT_MS = 2200;
const DAYLIGHT_CLICK_MS = 3100;
const DAYLIGHT_OPEN_MS = 3400;
const TYPE_START_MS = 5200;
const TYPE_END_MS = 9600;
const CURSOR_MOVE_SEND_MS = 9800;
const SEND_CLICK_MS = 10400;
const MESSAGE_SENT_MS = 10700;
const REPLY_VISIBLE_MS = 11900;
const RECEIPTS_VISIBLE_MS = 12800;
const CURSOR_MOVE_PROJECT_MS = 16400;
const PROJECT_CLICK_MS = 17400;
const RETURN_BOARD_MS = 17700;
const TOTAL_MS = 18600;

const previewSuggestions = [
  'Plan my day',
  'Break down a task',
  'Prepare a launch',
];

function DemoCursor({
  x,
  y,
  visible,
  clicking,
}: {
  x: number;
  y: number;
  visible: boolean;
  clicking: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute top-0 left-0 z-30 hidden md:block',
        'transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:hidden',
        visible ? 'opacity-100' : 'opacity-0',
      )}
      style={{ transform: `translate3d(${x}px, ${y}px, 0)` }}
    >
      <span
        className={cn(
          'absolute -top-2.5 -left-2.5 size-6 rounded-full border border-stage-progress/70 bg-stage-progress/15 transition-all duration-200',
          clicking ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
        )}
      />
      <svg
        width="20"
        height="22"
        viewBox="0 0 20 22"
        fill="none"
        className={cn(
          'drop-shadow-[0_4px_8px_rgba(0,0,0,0.28)] transition-transform duration-150',
          clicking ? 'scale-90' : 'scale-100',
        )}
      >
        <path
          d="M2.2 1.8L17.4 11.4L10.3 12.6L7.3 19.6L2.2 1.8Z"
          fill="#1F1E1C"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function PreviewWindow() {
  const frameRef = useRef<HTMLDivElement>(null);
  const startedAtRef = useRef<number | null>(null);
  const [started, setStarted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [manualView, setManualView] = useState<PreviewView | null>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      const id = window.setTimeout(() => {
        setReducedMotion(true);
        setStarted(true);
        setElapsed(TOTAL_MS);
      }, 0);
      return () => window.clearTimeout(id);
    }

    const node = frameRef.current;
    if (!node) return;

    const initialRect = node.getBoundingClientRect();
    if (initialRect.top < window.innerHeight && initialRect.bottom > 0) {
      const id = window.setTimeout(() => setStarted(true), 0);
      return () => window.clearTimeout(id);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const finished = elapsed >= TOTAL_MS;
  const autoPlaying = started && manualView === null && !finished && !reducedMotion;

  useEffect(() => {
    if (!autoPlaying) return;
    if (startedAtRef.current === null) {
      startedAtRef.current = Date.now() - elapsed;
    }
    const timer = window.setInterval(() => {
      if (startedAtRef.current === null) return;
      const next = Math.min(Date.now() - startedAtRef.current, TOTAL_MS);
      setElapsed(next);
    }, TICK_MS);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlaying]);

  const scriptedView: PreviewView =
    elapsed >= DAYLIGHT_OPEN_MS && elapsed < RETURN_BOARD_MS ? 'daylight' : 'board';
  const activeView: PreviewView = manualView ?? scriptedView;
  const messageSent = manualView !== null || elapsed >= MESSAGE_SENT_MS;
  const replyVisible = manualView !== null || elapsed >= REPLY_VISIBLE_MS;
  const receiptsVisible = manualView !== null || elapsed >= RECEIPTS_VISIBLE_MS;
  const boardUpdated = manualView !== null || elapsed >= MESSAGE_SENT_MS;
  const tasks = boardUpdated ? finalDemoTasks : initialDemoTasks;

  const visiblePrompt =
    messageSent
      ? ''
      : elapsed >= TYPE_START_MS
        ? demoPrompt.slice(
            0,
            Math.min(
              demoPrompt.length,
              Math.floor(
                ((elapsed - TYPE_START_MS) / (TYPE_END_MS - TYPE_START_MS)) * demoPrompt.length,
              ),
            ),
          )
        : '';

  const cursorTarget: CursorTarget =
    !autoPlaying || elapsed < CURSOR_MOVE_DAYLIGHT_MS
      ? 'idle'
      : elapsed < DAYLIGHT_OPEN_MS
        ? 'daylight'
        : elapsed < MESSAGE_SENT_MS
          ? elapsed >= CURSOR_MOVE_SEND_MS
            ? 'send'
            : 'daylight'
          : elapsed >= CURSOR_MOVE_PROJECT_MS && elapsed < RETURN_BOARD_MS + 400
            ? 'project'
            : 'idle';

  const cursorVisible =
    autoPlaying &&
    ((elapsed >= CURSOR_APPEAR_MS && elapsed < DAYLIGHT_OPEN_MS + 350) ||
      (elapsed >= CURSOR_MOVE_SEND_MS && elapsed < MESSAGE_SENT_MS + 250) ||
      (elapsed >= CURSOR_MOVE_PROJECT_MS && elapsed < RETURN_BOARD_MS + 400));

  const cursorClicking =
    autoPlaying &&
    ((elapsed >= DAYLIGHT_CLICK_MS && elapsed < DAYLIGHT_OPEN_MS) ||
      (elapsed >= SEND_CLICK_MS && elapsed < MESSAGE_SENT_MS) ||
      (elapsed >= PROJECT_CLICK_MS && elapsed < RETURN_BOARD_MS));

  useEffect(() => {
    if (!autoPlaying) return;
    const frame = frameRef.current;
    if (!frame) return;

    const raf = window.requestAnimationFrame(() => {
      const frameRect = frame.getBoundingClientRect();
      if (cursorTarget === 'idle') {
        setCursorPos({ x: frameRect.width * 0.56, y: frameRect.height * 0.42 });
        return;
      }
      const el = frame.querySelector<HTMLElement>(`[data-preview-target="${cursorTarget}"]`);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      setCursorPos({
        x: rect.left - frameRect.left + rect.width * 0.52,
        y: rect.top - frameRect.top + rect.height * 0.55,
      });
    });

    return () => window.cancelAnimationFrame(raf);
  }, [autoPlaying, cursorTarget, activeView]);

  const projectCounts = Object.fromEntries(
    demoProjects.map((item) => [
      item.id,
      item.id === demoProject.id
        ? tasks.filter((task) => !task.completed).length
        : item.incompleteTaskCount,
    ]),
  );

  function selectView(view: PreviewView) {
    setManualView(view);
    setElapsed(TOTAL_MS);
  }

  function handlePreviewNavigate(path: string) {
    if (path === '/daylight') {
      selectView('daylight');
    } else if (path.startsWith('/projects')) {
      selectView('board');
    }
  }

  return (
    <div className="relative mx-auto w-full rounded-[1.6rem] border border-border bg-secondary/70 p-2 shadow-[0_40px_80px_-36px_rgba(43,43,43,0.4)] sm:p-3">
      <div ref={frameRef} className="relative overflow-hidden rounded-xl border border-border bg-card">
        <SidebarProvider
          defaultOpen
          className="relative !min-h-0 h-[580px] w-full overflow-hidden bg-background sm:h-[660px]"
        >
          <AppSidebar
            preview
            userName="Joah Doval"
            activePath={activeView === 'daylight' ? '/daylight' : `/projects/${demoProject.id}`}
            activeProjectId={activeView === 'board' ? demoProject.id : null}
            projects={demoProjects}
            projectCounts={projectCounts}
            onProjectCreate={async () => null}
            onPreviewNavigate={handlePreviewNavigate}
          />
          <SidebarInset className="min-h-0 min-w-0 overflow-hidden !rounded-none !shadow-none md:!m-0">
            <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-border px-3">
              <div className="flex min-w-0 items-center gap-2">
                <SidebarTrigger className="-ml-0.5 hidden md:inline-flex" aria-label="Toggle sidebar" />
                <Breadcrumb className="min-w-0">
                  <BreadcrumbList className="flex-nowrap text-xs">
                    {activeView === 'daylight' ? (
                      <BreadcrumbItem className="min-w-0">
                        <BreadcrumbPage className="truncate">Daylight</BreadcrumbPage>
                      </BreadcrumbItem>
                    ) : (
                      <>
                        <BreadcrumbItem className="hidden sm:inline-flex">
                          <span className="text-muted-foreground">Projects</span>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="hidden sm:block" />
                        <BreadcrumbItem className="min-w-0">
                          <BreadcrumbPage className="truncate">
                            {demoProject.name}
                          </BreadcrumbPage>
                        </BreadcrumbItem>
                      </>
                    )}
                  </BreadcrumbList>
                </Breadcrumb>
              </div>

              <div
                className="flex shrink-0 items-center gap-1 rounded-lg bg-secondary p-0.5 md:hidden"
                role="tablist"
                aria-label="Preview view"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeView === 'board'}
                  onClick={() => selectView('board')}
                  className={cn(
                    'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                    activeView === 'board'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground',
                  )}
                >
                  Board
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeView === 'daylight'}
                  onClick={() => selectView('daylight')}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                    activeView === 'daylight'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground',
                  )}
                >
                  <Sparkles className="size-3" aria-hidden="true" />
                  Daylight
                </button>
              </div>
            </header>

            {activeView === 'board' ? (
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

                <BoardSurface className="mt-5 min-h-[380px] overflow-x-auto pb-2">
                  {demoProject.stages.map((stage, index) => {
                    const stageTasks = tasks.filter((task) => task.stageId === stage.id);
                    return (
                      <StageColumnFrame
                        key={stage.id}
                        stage={stage}
                        stageIndex={index}
                        taskCount={stageTasks.length}
                      >
                        <div className="space-y-2">
                          {stageTasks.map((task) => (
                            <KanbanCard
                              key={task.id}
                              task={task}
                              className={cn(
                                task.id === 't5' && boardUpdated && 'ring-1 ring-stage-progress/45',
                                task.id === 't6' && 'animate-in fade-in slide-in-from-bottom-2 duration-500 ring-1 ring-stage-progress/35',
                              )}
                            />
                          ))}
                        </div>
                      </StageColumnFrame>
                    );
                  })}
                </BoardSurface>
              </div>
            ) : (
              <div className="min-h-0 flex-1 overflow-hidden px-4 py-3 sm:px-6 sm:py-4">
                <div className="daylight-agent !h-full !min-h-0">
                  <div className="daylight-agent-layout mx-auto w-full max-w-6xl">
                    <div className="daylight-agent-main">
                      <div className="daylight-agent-toolbar">
                        {messageSent && (
                          <span className="min-w-0 truncate text-sm text-muted-foreground">
                            {demoPrompt.slice(0, 48)}
                          </span>
                        )}
                        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
                          <Button type="button" variant="ghost" size="sm" tabIndex={-1}>
                            <Plus aria-hidden="true" />
                            New conversation
                          </Button>
                          <Button type="button" variant="ghost" size="sm" tabIndex={-1} className="hidden sm:inline-flex">
                            <History aria-hidden="true" />
                            View history
                          </Button>
                        </div>
                      </div>

                      {!messageSent ? (
                        <div className="daylight-agent-start">
                          <div className="mx-auto mb-6 max-w-2xl text-center">
                            <span className="daylight-agent-mark">
                              <Logo size="hero" />
                            </span>
                            <p className="mb-2 mt-2 text-xs font-medium text-muted-foreground">Daylight assistant</p>
                            <h3 className="font-sans text-3xl leading-tight tracking-tight sm:text-[34px]">
                              What would you like to get done?
                            </h3>
                            <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
                              A starting point for your next idea, a plan for your project,
                              <br className="hidden sm:block" /> or a little clarity on what comes next.
                            </p>
                          </div>

                          <div className="mx-auto w-full max-w-3xl">
                            <div className="daylight-agent-composer">
                              <div className="daylight-agent-input">
                                {visiblePrompt ? (
                                  <span className="text-foreground">
                                    {visiblePrompt}
                                    {elapsed < TYPE_END_MS && (
                                      <span
                                        aria-hidden="true"
                                        className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-stage-progress align-middle"
                                      />
                                    )}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">Help me turn an idea into a plan…</span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center justify-between gap-2 px-2 pb-2 sm:px-3">
                                <div className="flex min-w-0 items-center gap-2">
                                  <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-muted-foreground">
                                    <AtSign className="size-3.5" aria-hidden="true" />
                                    <span className="hidden sm:inline">Change project</span>
                                  </span>
                                  <span className="inline-flex min-w-0 items-center gap-1.5 rounded-md bg-secondary px-2 py-1 text-xs">
                                    <span
                                      data-project-color={demoProject.color}
                                      className="project-color-dot size-2 rounded-full"
                                    />
                                    <span className="max-w-28 truncate">{demoProject.name}</span>
                                  </span>
                                </div>
                                <div className="ml-auto flex items-center gap-3">
                                  <span className="hidden text-[11px] text-muted-foreground sm:block">Enter to send</span>
                                  <Button
                                    type="button"
                                    size="icon-lg"
                                    tabIndex={-1}
                                    data-preview-target="send"
                                    aria-label="Send message"
                                    disabled={!visiblePrompt}
                                    className="rounded-xl"
                                  >
                                    <ArrowUp aria-hidden="true" />
                                  </Button>
                                </div>
                              </div>
                            </div>

                            <p className="mt-3 text-center text-[11px] text-muted-foreground">
                              Write naturally. Start with a task, a project, or a question.
                            </p>
                            <div className="mt-3 flex flex-wrap justify-center gap-2">
                              {previewSuggestions.map((label) => (
                                <Button
                                  key={label}
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  tabIndex={-1}
                                  className="rounded-full bg-card/70 text-xs"
                                >
                                  {label}
                                </Button>
                              ))}
                            </div>
                          </div>

                          <div className="pointer-events-none">
                            <AgentTemplates onSelect={() => {}} />
                          </div>
                        </div>
                      ) : (
                        <div className="daylight-agent-chat">
                          <section aria-label="Conversation preview" className="daylight-agent-messages">
                            <div className="mx-auto max-w-3xl space-y-6 py-6">
                              <div className="space-y-5">
                                <div className="ml-auto max-w-[90%] rounded-2xl rounded-br-md bg-secondary px-4 py-3 animate-in fade-in slide-in-from-bottom-2 duration-300 sm:max-w-[80%]">
                                  <p className="mb-1.5 text-xs text-muted-foreground">@{demoProject.name}</p>
                                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{demoPrompt}</p>
                                </div>

                                <div className="flex max-w-xl items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                  <span className="mt-0.5 shrink-0">
                                    <LogoIcon size={18} />
                                  </span>
                                  <div className="min-w-0 flex-1 space-y-3">
                                    <p className="text-xs font-medium">Daylight</p>
                                    {!replyVisible ? (
                                      <p className="text-sm text-muted-foreground">
                                        Updating {demoProject.name}…
                                      </p>
                                    ) : (
                                      <>
                                        <p className="text-sm leading-relaxed">
                                          I moved <span className="font-medium">Review landing page</span> to In Progress and added{' '}
                                          <span className="font-medium">Write the launch email</span> for Friday.
                                        </p>
                                        {receiptsVisible && (
                                          <div className="divide-y divide-border overflow-hidden rounded-xl border border-border animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <div className="flex items-center gap-3 px-3.5 py-2.5">
                                              <Check className="size-4 shrink-0 text-stage-progress" aria-hidden="true" />
                                              <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">Review landing page</p>
                                                <p className="text-xs text-muted-foreground">Moved to In Progress</p>
                                              </div>
                                              <CornerUpRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                                            </div>
                                            <div className="flex items-center gap-3 px-3.5 py-2.5">
                                              <Check className="size-4 shrink-0 text-stage-progress" aria-hidden="true" />
                                              <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">Write the launch email</p>
                                                <p className="text-xs text-muted-foreground">New task · Friday</p>
                                              </div>
                                              <CornerUpRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                                            </div>
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </section>

                          <div className="daylight-agent-chat-composer">
                            <div className="mx-auto w-full max-w-3xl">
                              <div className="daylight-agent-composer is-active">
                                <div className="daylight-agent-input !h-12 !min-h-12 !py-2.5">
                                  <span className="text-sm text-muted-foreground">Help me turn an idea into a plan…</span>
                                </div>
                                <div className="flex items-center justify-between gap-2 px-3 pb-2">
                                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <AtSign className="size-3.5" aria-hidden="true" />
                                    Add project context
                                  </span>
                                  <Button
                                    type="button"
                                    size="icon-lg"
                                    tabIndex={-1}
                                    aria-label="Send message"
                                    disabled
                                    className="rounded-xl"
                                  >
                                    <ArrowUp aria-hidden="true" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </SidebarInset>
        </SidebarProvider>

        {cursorPos && (
          <DemoCursor
            x={cursorPos.x}
            y={cursorPos.y}
            visible={cursorVisible}
            clicking={cursorClicking}
          />
        )}
      </div>
    </div>
  );
}
