import * as React from 'react';
import { ChevronRight } from 'lucide-react';
import { Slot } from 'radix-ui';
import { cn } from '@/lib/utils';

function Breadcrumb(props: React.ComponentProps<'nav'>) {
  return <nav aria-label="Breadcrumb" data-slot="breadcrumb" {...props} />;
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<'ol'>) {
  return <ol data-slot="breadcrumb-list" className={cn('flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground', className)} {...props} />;
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<'li'>) {
  return <li data-slot="breadcrumb-item" className={cn('inline-flex min-w-0 items-center gap-1.5', className)} {...props} />;
}

function BreadcrumbLink({ asChild, className, ...props }: React.ComponentProps<'a'> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'a';
  return <Comp data-slot="breadcrumb-link" className={cn('truncate rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', className)} {...props} />;
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<'span'>) {
  return <span data-slot="breadcrumb-page" aria-current="page" className={cn('truncate font-medium text-foreground', className)} {...props} />;
}

function BreadcrumbSeparator({ className, children, ...props }: React.ComponentProps<'li'>) {
  return <li data-slot="breadcrumb-separator" role="presentation" aria-hidden="true" className={cn('text-muted-foreground/60 [&>svg]:size-3.5', className)} {...props}>{children ?? <ChevronRight />}</li>;
}

export { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator };
