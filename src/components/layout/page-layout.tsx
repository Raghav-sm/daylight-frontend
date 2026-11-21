import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type PageLayoutProps = {
  breadcrumbs?: ReactNode;
  header?: ReactNode;
  title?: string;
  subtitle?: string;
  maxWidthClassName?: string;
  className?: string;
};

export function PageLayout({
  breadcrumbs,
  header,
  title,
  subtitle,
  maxWidthClassName = 'max-w-5xl',
  className,
}: PageLayoutProps) {
  return (
    <div className={cn('mx-auto mb-5 w-full', maxWidthClassName, className)}>
      {breadcrumbs && <div className="mb-4">{breadcrumbs}</div>}
      {header ?? (title || subtitle ? (
        <header>
          {title && <h2 className="font-heading text-[26px] tracking-tight">{title}</h2>}
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </header>
      ) : null)}
    </div>
  );
}
