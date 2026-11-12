import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type PageLayoutProps = {
  breadcrumbs?: ReactNode;
  title?: string;
  subtitle?: string;
  headerActions?: ReactNode;
  children?: ReactNode;
  className?: string;
  maxWidthClassName?: string;
};

export function PageLayout({
  breadcrumbs,
  title,
  subtitle,
  headerActions,
  children,
  className,
  maxWidthClassName = 'max-w-5xl',
}: PageLayoutProps) {
  return (
    <div className={cn('mx-auto w-full', maxWidthClassName, className)}>
      {breadcrumbs && <div className="mb-6">{breadcrumbs}</div>}

      {(title || subtitle || headerActions) && (
        <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            {title && <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>}
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {headerActions && <div className="flex shrink-0 items-center gap-2">{headerActions}</div>}
        </div>
      )}

      {children}
    </div>
  );
}
