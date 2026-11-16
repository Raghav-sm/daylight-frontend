import { ArrowRight, Check, Circle, CircleCheck, CircleDot, Plus } from 'lucide-react';
import { LogoMark } from '@/components/layout/logo-mark';
import { SectionFrame } from './section-frame';

const stages = [
  {
    title: 'To Do',
    tone: 'muted',
    Icon: Circle,
    tasks: ['Prepare launch checklist', 'Write launch announcement'],
  },
  {
    title: 'In Progress',
    tone: 'orange',
    Icon: CircleDot,
    tasks: ['Review landing page'],
  },
  {
    title: 'Completed',
    tone: 'violet',
    Icon: CircleCheck,
    tasks: ['Define project scope'],
  },
];

export function HowItWorksSection() {
  return (
    <SectionFrame id="how-it-works" className="max-w-[1040px] py-16 sm:py-20">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
        <div>
          <p className="text-sm font-medium text-stage-progress">A simple way to keep moving</p>
          <h2 className="font-heading mt-3 max-w-xl text-4xl tracking-tight sm:text-5xl">
            Make space. Move forward.
          </h2>
        </div>
        <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Keep projects and tasks in view. When it is easier to ask, tell Daylight what changed and see the same board update.
        </p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.8fr)] lg:items-center">
        <div className="min-w-0">
          <div className="mb-5 flex items-center gap-2 text-sm">
            <LogoMark size={17} />
            <span className="font-medium">Product launch</span>
            <span className="text-muted-foreground">/ Board</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {stages.map(({ title, tone, Icon, tasks }) => (
              <section key={title} data-kanban-tone={tone} className="kanban-column min-w-0 rounded-2xl border p-3">
                <div className="kanban-column-title flex items-center gap-2 px-1 pb-3 text-sm font-medium">
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  <h3 className="truncate">{title}</h3>
                  <span className="kanban-count ml-auto rounded-full border px-2 py-0.5 text-[11px] tabular-nums">
                    {String(tasks.length).padStart(2, '0')}
                  </span>
                </div>
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div key={task} className="rounded-xl bg-card p-3 text-sm leading-snug text-card-foreground shadow-sm">
                      {task}
                    </div>
                  ))}
                </div>
                <p className="mt-3 flex items-center gap-1 px-1 text-xs text-muted-foreground">
                  <Plus className="size-3.5" aria-hidden="true" /> Add task
                </p>
              </section>
            ))}
          </div>
          <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-block size-2 rounded-full bg-stage-progress" />
            One board for the whole project
          </p>
        </div>

        <aside className="relative rounded-2xl border border-border bg-card shadow-[0_18px_45px_-30px_rgba(43,43,43,0.45)]">
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <span className="grid size-8 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <LogoMark size={17} />
            </span>
            <div>
              <p className="text-sm font-medium">Daylight assistant</p>
              <p className="text-xs text-muted-foreground">Product launch</p>
            </div>
          </div>
          <div className="space-y-4 p-4 sm:p-5">
            <p className="ml-auto max-w-[90%] rounded-2xl rounded-tr-sm bg-secondary px-3 py-2.5 text-sm leading-relaxed">
              Move the landing page review to In Progress.
            </p>
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <LogoMark size={12} />
              </span>
              <div className="min-w-0">
                <p className="text-sm leading-relaxed">Done. I moved the task on your board.</p>
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2.5 text-xs">
                  <Check className="size-3.5 shrink-0 text-stage-progress" aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate">Review landing page</span>
                  <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span className="shrink-0 rounded-md bg-stage-progress/15 px-2 py-1">In Progress</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
            Ask Daylight about this project…
          </div>
        </aside>
      </div>
    </SectionFrame>
  );
}
