'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type SectionFrameProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  padded?: boolean;
  reveal?: boolean;
};

export function SectionFrame({
  id,
  children,
  className,
  padded = true,
  reveal = true,
}: SectionFrameProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!reveal || !sectionRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: '0px 0px -60px 0px', threshold: 0.05 });
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [reveal]);

  return (
    <section
      ref={sectionRef}
      id={id}
      data-reveal={reveal ? (visible ? 'visible' : 'pending') : undefined}
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
