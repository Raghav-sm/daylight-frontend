import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type SectionHeaderProps = {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  align?: 'center' | 'left';
  className?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'center',
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'mx-auto max-w-2xl',
        align === 'center' && 'text-center',
        className,
      )}
    >
      <p className="text-sm font-medium text-stage-progress">{eyebrow}</p>
      <h2 className="font-heading mt-3 text-3xl tracking-tight text-foreground sm:text-4xl md:text-[2.75rem] md:leading-[1.1]">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}
