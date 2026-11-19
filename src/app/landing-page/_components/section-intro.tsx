import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type SectionIntroProps = {
  title: ReactNode;
  description: ReactNode;
  eyebrow?: string;
  level?: 'h1' | 'h2' | 'h3';
  prominent?: boolean;
};

export function SectionIntro({
  title,
  description,
  eyebrow,
  level: Heading = 'h2',
  prominent = false,
}: SectionIntroProps) {
  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
      {eyebrow && <p className="mb-4 text-sm font-medium text-stage-progress">{eyebrow}</p>}
      <Heading className={cn(
        'font-heading max-w-4xl text-balance tracking-tight text-foreground',
        prominent
          ? 'text-5xl leading-[1.05] sm:text-6xl lg:text-[5.5rem]'
          : 'text-4xl leading-[1.12] sm:text-5xl lg:text-6xl',
      )}>
        {title}
      </Heading>
      <p className={cn(
        'mx-auto max-w-2xl text-pretty leading-relaxed text-muted-foreground',
        prominent ? 'mt-7 text-lg sm:text-xl' : 'mt-5 text-base sm:text-lg',
      )}>
        {description}
      </p>
    </div>
  );
}
