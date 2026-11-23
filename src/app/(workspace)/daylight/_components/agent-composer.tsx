'use client';

import { ArrowUp, Check, ChevronDown, LoaderCircle, X } from 'lucide-react';
import type { RefObject } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ProjectSummary } from '@/features/projects/types';
import type { AssistantModelOption, ReasoningEffort } from '@/features/assistant/types';

type AgentComposerProps = {
  active?: boolean;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  projects: ProjectSummary[];
  projectId: string | null;
  onProjectChange: (id: string | null) => void;
  models: AssistantModelOption[];
  modelsLoading: boolean;
  modelId: string | null;
  onModelChange: (id: string) => void;
  effort: ReasoningEffort;
  onEffortChange: (effort: ReasoningEffort) => void;
  canSend: boolean;
  isSending: boolean;
};

const EFFORT_OPTIONS: { value: ReasoningEffort; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export function AgentComposer({
  active = false, value, onChange, onSubmit, inputRef, projects, projectId, onProjectChange,
  models, modelsLoading, modelId, onModelChange, effort, onEffortChange, canSend,
  isSending,
}: AgentComposerProps) {
  const project = projects.find((item) => item.id === projectId);
  const selectedModel = models.find((model) => model.id === modelId) ?? models[0];
  const effortLabel = EFFORT_OPTIONS.find((option) => option.value === effort)?.label ?? 'Medium';
  const menuSide = active ? 'top' : 'bottom';

  return (
    <div className="w-full">
      <form
        className={active ? 'daylight-agent-composer is-active' : 'daylight-agent-composer'}
        onSubmit={(event) => {
          event.preventDefault();
          if (value.trim() && canSend && !isSending) onSubmit();
        }}
      >
        <label htmlFor="daylight-prompt" className="sr-only">Ask Daylight</label>
        <Textarea
          ref={inputRef}
          id="daylight-prompt"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Help me turn an idea into a plan…"
          maxLength={4000}
          className="daylight-agent-input"
          disabled={isSending}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              if (value.trim() && canSend && !isSending) onSubmit();
            }
          }}
        />
        <div className="flex items-center justify-end gap-2 px-2.5 pb-2.5 sm:px-3">
          <span className="hidden text-[11px] text-muted-foreground sm:block">Enter to send</span>
          <Button
            type="submit"
            size="icon-lg"
            aria-label={isSending ? 'Sending message' : 'Send message'}
            disabled={!value.trim() || !canSend || isSending}
            className="rounded-xl"
          >
            {isSending ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : <ArrowUp aria-hidden="true" />}
          </Button>
        </div>
      </form>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex min-w-0 items-center gap-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 rounded-lg px-2 text-xs font-medium text-muted-foreground hover:bg-secondary/80 hover:text-foreground data-[state=open]:bg-secondary data-[state=open]:text-foreground"
                disabled={isSending}
              >
                {project ? (
                  <>
                    <span data-project-color={project.color} className="project-color-dot size-2 shrink-0 rounded-full" />
                    <span className="max-w-36 truncate text-foreground">{project.name}</span>
                  </>
                ) : (
                  <span>Project</span>
                )}
                <ChevronDown aria-hidden="true" className="size-3.5 opacity-60" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" side={menuSide} sideOffset={6} className="w-52 rounded-lg p-1.5">
              <p className="mb-1 px-2 text-[11px] font-medium text-muted-foreground">Choose a project</p>
              <div className="max-h-48 space-y-0.5 overflow-y-auto">
                {projects.map((item) => (
                  <Button
                    key={item.id}
                    type="button"
                    variant={item.id === projectId ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7 w-full justify-start rounded-md text-xs"
                    disabled={isSending}
                    onClick={() => onProjectChange(item.id)}
                  >
                    <span data-project-color={item.color} className="project-color-dot size-2 shrink-0 rounded-full" />
                    <span className="truncate">{item.name}</span>
                  </Button>
                ))}
                {projects.length === 0 && (
                  <p className="px-2 py-1 text-[11px] text-muted-foreground">
                    Your projects will appear here when available. You can still write a prompt.
                  </p>
                )}
              </div>
            </PopoverContent>
          </Popover>
          {project && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label="Remove project context"
              className="text-muted-foreground hover:text-foreground"
              disabled={isSending}
              onClick={() => onProjectChange(null)}
            >
              <X aria-hidden="true" />
            </Button>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label="Model and reasoning effort"
              disabled={modelsLoading || isSending}
              className="h-8 gap-1.5 rounded-lg px-2.5 text-xs hover:bg-secondary/80 data-[state=open]:bg-secondary"
            >
              {modelsLoading ? (
                <span className="text-muted-foreground">Loading models…</span>
              ) : (
                <>
                  <span className="font-medium text-foreground">{selectedModel?.label ?? 'GPT OSS 20B'}</span>
                  <span className="text-muted-foreground">{effortLabel}</span>
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side={menuSide}
            sideOffset={6}
            className="w-56 rounded-lg border border-border bg-popover p-1 shadow-md"
          >
            {models.length === 0 ? (
              <div className="px-2 py-1.5 text-xs text-muted-foreground">
                Unavailable
              </div>
            ) : (
              models.map((model) => {
                const isSelected = model.id === modelId && model.available;
                return (
                  <DropdownMenuItem
                    key={model.id}
                    disabled={!model.available}
                    onSelect={() => {
                      if (model.available) onModelChange(model.id);
                    }}
                    className="flex cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-1.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium leading-tight text-foreground">
                        {model.label}
                      </p>
                      <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                        {model.provider}
                      </p>
                    </div>
                    {isSelected ? (
                      <Check aria-hidden="true" className="size-3.5 shrink-0 text-primary" />
                    ) : !model.available ? (
                      <span className="shrink-0 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        Unavailable
                      </span>
                    ) : null}
                  </DropdownMenuItem>
                );
              })
            )}

            <DropdownMenuSeparator className="my-1" />

            <DropdownMenuSub>
              <DropdownMenuSubTrigger
                disabled={!selectedModel?.available}
                className="rounded-md px-2 py-1.5 text-xs"
              >
                <span className="font-medium">Effort</span>
                <span className="ml-auto mr-1 text-[11px] text-muted-foreground">{effortLabel}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent
                sideOffset={6}
                className="w-28 rounded-lg border border-border bg-popover p-1 shadow-md"
              >
                <DropdownMenuRadioGroup
                  value={effort}
                  onValueChange={(next) => onEffortChange(next as ReasoningEffort)}
                >
                  {EFFORT_OPTIONS.map((option) => (
                    <DropdownMenuRadioItem
                      key={option.value}
                      value={option.value}
                      disabled={!selectedModel?.available || !selectedModel.supportedEfforts.includes(option.value)}
                      className="rounded-md py-1 text-xs"
                    >
                      {option.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
