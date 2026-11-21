import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import type { ProjectStage } from '@/features/projects/types';
import { cn } from '@/lib/utils';

export function BoardSurface({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex min-h-[60vh] items-start gap-3 overflow-x-auto pb-4', className)}>{children}</div>;
}

export function KanbanStageHeader({
  title,
  count,
  action,
}: {
  title: string;
  count: string | number;
  action?: ReactNode;
}) {
  return (
    <header className="kanban-stage-header mb-1 rounded-2xl px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2">
        <span className="kanban-stage-dot size-2 shrink-0 rounded-full" />
        <h2 className="truncate text-base font-semibold text-foreground">{title}</h2>
        <Badge variant="outline" className="kanban-stage-count rounded-full px-2.5 py-0.5 text-xs tabular-nums">
          {count}
        </Badge>
        {action && <div className="ml-auto">{action}</div>}
      </div>
    </header>
  );
}

export function StageColumnFrame({ stage, stageIndex, taskCount, children, footer, dropRef, dropActive = false, className }: {
  stage: Pick<ProjectStage, 'name'>;
  stageIndex: number;
  taskCount: number;
  children: ReactNode;
  footer?: ReactNode;
  dropRef?: (node: HTMLDivElement | null) => void;
  dropActive?: boolean;
  className?: string;
}) {
  return (
    <section
      data-kanban-stage-color={stageIndex % 6}
      aria-label={`${stage.name} stage`}
      className={cn('kanban-stage-column flex w-[14rem] shrink-0 flex-col gap-2 rounded-2xl p-2.5 shadow-sm lg:w-[18rem]', className)}
    >
      <KanbanStageHeader title={stage.name} count={String(taskCount).padStart(2, '0')} />
      <div
        ref={dropRef}
        className={cn('flex min-h-[18rem] flex-1 flex-col gap-2.5', dropActive && 'rounded-xl ring-2 ring-ring/40')}
      >
        {children}
      </div>
      {footer}
    </section>
  );
}
