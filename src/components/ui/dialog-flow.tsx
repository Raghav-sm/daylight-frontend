'use client';

import type { ComponentProps, ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export type DialogFlowScreen = {
  title: ReactNode;
  description?: ReactNode;
  content: ReactNode;
  backLabel?: string;
  onBack?: () => void;
};

type DialogFlowProps<View extends string> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  view: View;
  views: Record<View, DialogFlowScreen>;
  trigger?: ReactNode;
  className?: string;
  onCloseAutoFocus?: ComponentProps<typeof DialogContent>['onCloseAutoFocus'];
};

export function DialogFlow<View extends string>({
  open,
  onOpenChange,
  view,
  views,
  trigger,
  className,
  onCloseAutoFocus,
}: DialogFlowProps<View>) {
  const activeScreen = views[view];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className={cn('font-sans', className)} onCloseAutoFocus={onCloseAutoFocus}>
        {activeScreen.onBack && (
          <Button type="button" variant="ghost" size="sm" className="-ml-2 w-fit" onClick={activeScreen.onBack}>
            <ArrowLeft aria-hidden="true" />{activeScreen.backLabel ?? 'Back'}
          </Button>
        )}
        <DialogHeader>
          <DialogTitle className="font-sans">{activeScreen.title}</DialogTitle>
          {activeScreen.description && (
            <DialogDescription>{activeScreen.description}</DialogDescription>
          )}
        </DialogHeader>
        {activeScreen.content}
      </DialogContent>
    </Dialog>
  );
}
