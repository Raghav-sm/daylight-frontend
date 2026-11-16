'use client';

import { ArrowUp, Check, CornerUpRight, FolderKanban, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { LogoMark } from '@/components/layout/logo-mark';
import { cn } from '@/lib/utils';

type AssistantPanelProps = {
  prompt: string;
  visiblePrompt: string;
  showReply: boolean;
  showReceipts: boolean;
  context?: string;
  onClose?: () => void;
};

export function AssistantPanel({
  prompt,
  visiblePrompt,
  showReply,
  showReceipts,
  context = 'Product launch',
  onClose,
}: AssistantPanelProps) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-card text-card-foreground">
      <header className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <LogoMark size={17} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">Daylight</p>
            <p className="truncate text-xs text-muted-foreground">Assistant · {context}</p>
          </div>
        </div>
        {onClose && (
          <Button size="icon-sm" variant="ghost" aria-label="Close assistant" onClick={onClose}>
            <X />
          </Button>
        )}
      </header>

      <div className="flex-1 overflow-auto px-5 py-6">
        <div className="mb-7 flex items-center gap-2 text-xs text-muted-foreground">
          <FolderKanban className="size-3.5" aria-hidden="true" />
          <span>Working in {context}</span>
        </div>
        {showReply && (
          <div className="mb-6 ml-auto max-w-[92%] rounded-2xl rounded-tr-sm bg-secondary px-4 py-3 text-sm leading-relaxed">
            {prompt}
          </div>
        )}
        {showReply && (
          <div className="space-y-4 text-sm leading-relaxed">
            <p>I moved <span className="font-medium">Review landing page</span> to In Progress and added <span className="font-medium">Write the launch email</span> for Friday.</p>
            {showReceipts && (
              <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-background">
                <div className="flex items-center gap-3 px-3 py-3">
                  <Check className="size-4 shrink-0 text-stage-progress" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">Review landing page</p>
                    <p className="text-xs text-muted-foreground">Moved to In Progress</p>
                  </div>
                  <CornerUpRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                </div>
                <div className="flex items-center gap-3 px-3 py-3">
                  <Check className="size-4 shrink-0 text-stage-progress" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">Write the launch email</p>
                    <p className="text-xs text-muted-foreground">New task · Friday</p>
                  </div>
                  <CornerUpRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-border px-4 pb-4 pt-3">
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-2 py-1 shadow-sm">
          <Input
            readOnly
            value={!showReply ? visiblePrompt : ''}
            placeholder="Ask Daylight anything..."
            className="h-10 min-w-0 border-0 bg-transparent text-sm shadow-none focus-visible:ring-0"
            aria-label="Sample assistant message"
          />
          <Button size="icon-sm" className="shrink-0 rounded-full" aria-label="Send sample message" disabled>
            <ArrowUp />
          </Button>
        </div>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">Preview conversation · No changes are made</p>
      </div>
    </div>
  );
}

export function AssistantPreview({
  open,
  onClose,
  ...panelProps
}: AssistantPanelProps & { open: boolean; onClose: () => void }) {
  return (
    <aside
      aria-label="Daylight assistant demo"
      aria-hidden={!open}
      className={cn(
        'absolute inset-y-0 right-0 z-20 w-[min(360px,100%)] border-l border-border shadow-xl transition-transform duration-700 ease-out motion-reduce:transition-none',
        open ? 'translate-x-0' : 'pointer-events-none translate-x-full',
      )}
    >
      <AssistantPanel {...panelProps} onClose={onClose} />
    </aside>
  );
}

export function AssistantSheet({
  open,
  onOpenChange,
  ...panelProps
}: AssistantPanelProps & { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="p-0 sm:max-w-md">
        <SheetHeader className="sr-only">
          <SheetTitle>Daylight assistant</SheetTitle>
          <SheetDescription>Ask Daylight to work with your projects and tasks.</SheetDescription>
        </SheetHeader>
        <AssistantPanel {...panelProps} />
      </SheetContent>
    </Sheet>
  );
}
