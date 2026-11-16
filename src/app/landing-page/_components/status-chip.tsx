import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type StatusChipTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

const toneClass: Record<StatusChipTone, string> = {
  neutral: 'border-border bg-muted text-muted-foreground',
  success: 'border-stage-done/30 bg-stage-done/10 text-stage-done',
  warning: 'border-stage-progress/35 bg-stage-progress/10 text-stage-progress',
  danger: 'border-destructive/30 bg-destructive/10 text-destructive',
  info: 'border-stage-5/30 bg-stage-5/10 text-stage-5',
};

type StatusChipProps = {
  children: ReactNode;
  tone?: StatusChipTone;
  className?: string;
};

export function StatusChip({
  children,
  tone = 'neutral',
  className,
}: StatusChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium',
        toneClass[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
