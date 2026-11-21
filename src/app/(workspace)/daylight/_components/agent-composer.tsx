'use client';

import { ArrowUp, AtSign, X } from 'lucide-react';
import type { RefObject } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { ProjectSummary } from '@/features/projects/types';

type AgentComposerProps = {
  active?: boolean;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  projects: ProjectSummary[];
  projectId: string | null;
  onProjectChange: (id: string | null) => void;
};

export function AgentComposer({
  active = false, value, onChange, onSubmit, inputRef, projects, projectId, onProjectChange,
}: AgentComposerProps) {
  const project = projects.find((item) => item.id === projectId);

  return (
    <form className={active ? 'daylight-agent-composer is-active' : 'daylight-agent-composer'} onSubmit={(event) => {
      event.preventDefault();
      if (value.trim()) onSubmit();
    }}>
      <label htmlFor="daylight-prompt" className="sr-only">Ask Daylight</label>
      <Textarea
        ref={inputRef}
        id="daylight-prompt"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Help me turn an idea into a plan…"
        maxLength={4000}
        className="daylight-agent-input"
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault();
            if (value.trim()) onSubmit();
          }
        }}
      />
      <div className="flex flex-wrap items-center justify-between gap-2 px-2 pb-2 sm:px-3">
        <div className="flex min-w-0 items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="px-2 text-muted-foreground">
                <AtSign aria-hidden="true" />{project ? 'Change project' : 'Add project context'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <p className="mb-2 px-2 text-xs font-medium text-muted-foreground">Choose a project</p>
              <div className="max-h-52 space-y-1 overflow-y-auto">
                {projects.map((item) => (
                  <Button key={item.id} type="button" variant={item.id === projectId ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => onProjectChange(item.id)}>
                    <span data-project-color={item.color} className="project-color-dot size-2 rounded-full" />
                    <span className="truncate">{item.name}</span>
                  </Button>
                ))}
                {projects.length === 0 && <p className="px-2 py-1 text-sm text-muted-foreground">Your projects will appear here when available. You can still write a prompt.</p>}
              </div>
            </PopoverContent>
          </Popover>
          {project && (
            <span className="flex min-w-0 items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs">
              <span className="max-w-28 truncate">{project.name}</span>
              <Button type="button" variant="ghost" size="icon-xs" aria-label="Remove project context" onClick={() => onProjectChange(null)}><X aria-hidden="true" /></Button>
            </span>
          )}
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="hidden text-[11px] text-muted-foreground sm:block">Enter to send</span>
          <Button type="submit" size="icon-lg" aria-label="Send message" disabled={!value.trim()} className="rounded-xl"><ArrowUp aria-hidden="true" /></Button>
        </div>
      </div>
    </form>
  );
}
