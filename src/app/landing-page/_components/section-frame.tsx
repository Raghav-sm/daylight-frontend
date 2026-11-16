import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type SectionFrameProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  padded?: boolean;
};

export function SectionFrame({
  id,
  children,
  className,
  padded = true,
}: SectionFrameProps) {
  return (
    <section
      id={id}
      className={cn(
        'mx-auto w-full max-w-[1120px]',
        padded && 'px-5 py-16 sm:px-8 sm:py-20 md:px-10',
        className,
      )}
    >
      {children}
    </section>
  );
}
