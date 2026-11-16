import type { ReactNode } from 'react';
import { Circle, CircleCheck, CircleDot, CircleEllipsis } from 'lucide-react';
import type { ProjectStage } from '@/features/projects/types';
import { cn } from '@/lib/utils';

const tones = ['muted', 'orange', 'violet', 'blue'] as const;
function ToneIcon({ index }: { index: number }) {
  const Icon = [Circle, CircleDot, CircleEllipsis, CircleCheck][index % 4];
  return <Icon aria-hidden="true" className="size-4 shrink-0" />;
}

export function BoardSurface({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex min-h-[60vh] items-start gap-4 overflow-x-auto pb-4', className)}>{children}</div>;
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
    <section data-kanban-tone={tones[stageIndex % 4]} aria-label={`${stage.name} stage`} className={cn('kanban-column flex w-72 shrink-0 flex-col gap-2 rounded-2xl border p-2', className)}>
      <div className="flex items-center gap-2 px-2 py-1.5"><div className="kanban-column-title flex min-w-0 flex-1 items-center gap-2"><ToneIcon index={stageIndex} /><h3 className="truncate text-sm font-medium">{stage.name}</h3><span className="kanban-count shrink-0 rounded-full border px-2 py-0.5 text-xs tabular-nums">{String(taskCount).padStart(2, '0')}</span></div></div>
      <div ref={dropRef} className={cn('flex min-h-32 flex-1 flex-col gap-2', dropActive && 'rounded-xl ring-2 ring-ring/40')}>{children}</div>
      {footer}
    </section>
  );
}
