'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { History, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/layout/logo';
import { useProjects } from '@/features/projects/data';
import {
  useAssistantConversation,
  useAssistantConversations,
  useAssistantModelCatalog,
  useSendAssistantMessage,
} from '@/features/assistant/data';
import type { AssistantMessage, ReasoningEffort } from '@/features/assistant/types';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { AgentComposer } from './agent-composer';
import { AgentTemplates } from './agent-templates';
import { AssistantMessageContent } from './assistant-message-content';
import { ConversationHistory } from './conversation-history';
import './agent.css';

const suggestions = [
  { label: 'Plan my day', prompt: 'Help me plan my day around the tasks that matter most.' },
  { label: 'Break down a task', prompt: 'Help me break a large task into smaller, actionable steps.' },
  { label: 'Prepare a launch', prompt: 'Help me prepare a launch checklist for my project.' },
];

type PendingTurn = {
  id: string;
  role: 'user';
  content: string;
  projectName: string | null;
};

function getMessageError(error: unknown) {
  return error instanceof Error ? error.message : 'The message could not be sent. Please try again.';
}

function UserMessage({ message }: { message: AssistantMessage | PendingTurn }) {
  const projectName = 'projectName' in message ? message.projectName : null;
  return (
    <div className="ml-auto max-w-[90%] rounded-2xl rounded-br-md bg-secondary px-4 py-3 sm:max-w-[80%]">
      <span className="sr-only">You: </span>
      {projectName && <p className="mb-1.5 text-xs text-muted-foreground">@{projectName}</p>}
      <p className="whitespace-pre-wrap text-sm leading-relaxed [overflow-wrap:anywhere]">{message.content}</p>
    </div>
  );
}

function AssistantMessageView({ content, pending = false }: { content: string; pending?: boolean }) {
  return (
    <div className="flex max-w-2xl items-start gap-3">
      <span className="mt-1 shrink-0"><Logo variant="icon" size="inline" /></span>
      <div className="min-w-0 flex-1">
        {pending ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {content}
            <span className="ml-1 inline-block animate-pulse">…</span>
          </p>
        ) : (
          <AssistantMessageContent content={content} />
        )}
      </div>
    </div>
  );
}

export function AgentWorkspace() {
  const { data: projects = [] } = useProjects();
  const modelCatalogQuery = useAssistantModelCatalog();
  const modelCatalog = modelCatalogQuery.data;
  const catalogModels = useMemo(
    () => modelCatalog?.models ?? [],
    [modelCatalog?.models],
  );
  const availableModels = useMemo(
    () => catalogModels.filter((model) => model.available),
    [catalogModels],
  );
  const conversationsQuery = useAssistantConversations();
  const sendMessageMutation = useSendAssistantMessage();
  const [draft, setDraft] = useState('');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pendingTurn, setPendingTurn] = useState<PendingTurn | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [modelOverride, setModelOverride] = useState<string | null>(null);
  const [effortOverride, setEffortOverride] = useState<ReasoningEffort | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messageListRef = useRef<HTMLElement>(null);
  const activeConversationQuery = useAssistantConversation(activeId);
  const activeConversation = activeId ? activeConversationQuery.data : undefined;
  const messages = activeConversation?.messages ?? [];
  const hasConversation = Boolean(activeId || pendingTurn);
  const preferredModelId = modelOverride ?? activeConversation?.modelId ?? modelCatalog?.defaultModelId ?? null;
  const selectedModel = availableModels.find((model) => model.id === preferredModelId)
    ?? availableModels.find((model) => model.id === modelCatalog?.defaultModelId)
    ?? availableModels[0]
    ?? catalogModels.find((model) => model.id === modelCatalog?.defaultModelId)
    ?? catalogModels[0];
  const modelId = selectedModel?.id ?? null;
  const preferredEffort = effortOverride ?? activeConversation?.effort ?? 'medium';
  const effort: ReasoningEffort = selectedModel && !selectedModel.supportedEfforts.includes(preferredEffort)
    ? (selectedModel.supportedEfforts.includes('medium')
      ? 'medium'
      : selectedModel.supportedEfforts[0] ?? 'medium')
    : preferredEffort;
  const canSend = Boolean(
    modelCatalog?.chatEnabled
    && selectedModel?.available
    && selectedModel.supportedEfforts.includes(effort),
  );
  const isSending = sendMessageMutation.isPending;

  useEffect(() => {
    const list = messageListRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [activeId, messages.length, pendingTurn?.id, isSending]);

  function choosePrompt(prompt: string) {
    setDraft(prompt);
    inputRef.current?.focus();
  }

  async function sendMessage() {
    const text = draft.trim();
    if (!text || !canSend || isSending || !modelId) return;
    const selectedProjectName = projects.find((project) => project.id === projectId)?.name ?? null;
    setPendingTurn({ id: crypto.randomUUID(), role: 'user', content: text, projectName: selectedProjectName });
    setSendError(null);
    setDraft('');

    try {
      const conversation = await sendMessageMutation.mutateAsync({
        message: text,
        conversationId: activeId,
        modelId,
        effort,
        projectId,
      });
      setActiveId(conversation.id);
      setPendingTurn(null);
      setProjectId(null);
      window.setTimeout(() => inputRef.current?.focus(), 0);
    } catch (error) {
      setPendingTurn(null);
      setDraft(text);
      setSendError(getMessageError(error));
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  }

  function newConversation() {
    setActiveId(null);
    setPendingTurn(null);
    setDraft('');
    setProjectId(null);
    setModelOverride(null);
    setEffortOverride(null);
    setSendError(null);
    setHistoryOpen(false);
    inputRef.current?.focus();
  }

  function selectConversation(id: string) {
    setActiveId(id);
    setPendingTurn(null);
    setDraft('');
    setProjectId(null);
    setModelOverride(null);
    setEffortOverride(null);
    setSendError(null);
    setHistoryOpen(false);
  }

  function changeModel(id: string) {
    const nextModel = availableModels.find((model) => model.id === id);
    setModelOverride(id);
    setEffortOverride(nextModel?.supportedEfforts.includes(effort)
      ? effort
      : nextModel?.supportedEfforts.includes('medium')
        ? 'medium'
        : nextModel?.supportedEfforts[0] ?? 'medium');
  }

  const historyMessages = pendingTurn ? [...messages, pendingTurn] : messages;

  return (
    <div className="daylight-agent">
      <div className="daylight-agent-layout mx-auto w-full max-w-6xl">
        <div className="daylight-agent-main">
          <div className="daylight-agent-toolbar">
            {activeConversation && <span className="min-w-0 truncate text-sm text-muted-foreground">{activeConversation.title}</span>}
            <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
              <Button type="button" variant="ghost" size="sm" disabled={isSending} onClick={newConversation}><Plus aria-hidden="true" />New conversation</Button>
              <Button type="button" variant="ghost" size="sm" disabled={isSending} onClick={() => setHistoryOpen(true)}><History aria-hidden="true" />View history</Button>
            </div>
          </div>

          {!hasConversation ? (
            <div className="daylight-agent-start">
              <div className="mx-auto mb-6 max-w-2xl text-center">
                <span className="daylight-agent-mark"><Logo size="hero" /></span>
                <p className="mb-2 mt-2 text-xs font-medium text-muted-foreground">Daylight assistant</p>
                <h1 className="font-sans text-3xl leading-tight tracking-tight sm:text-[34px]">What would you like to get done?</h1>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">A starting point for your next idea, a plan for your project,<br className="hidden sm:block" /> or a little clarity on what comes next.</p>
              </div>
              <div className="mx-auto w-full max-w-3xl">
                <AgentComposer value={draft} onChange={setDraft} onSubmit={sendMessage} inputRef={inputRef} projects={projects} projectId={projectId} onProjectChange={setProjectId} models={catalogModels} modelsLoading={modelCatalogQuery.isLoading} modelId={modelId} onModelChange={changeModel} effort={effort} onEffortChange={setEffortOverride} canSend={canSend} isSending={isSending} />
                {modelCatalogQuery.isError && (
                  <p role="status" className="mt-2.5 text-center text-[11px] text-muted-foreground">Model options could not be loaded. Refresh the page to try again.</p>
                )}
                {sendError && <p role="alert" className="mt-2 text-center text-xs text-destructive">{sendError}</p>}
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {suggestions.map((item) => <Button key={item.label} type="button" variant="outline" size="sm" className="rounded-full bg-card/70 text-xs" onClick={() => choosePrompt(item.prompt)}>{item.label}</Button>)}
                </div>
              </div>
              <AgentTemplates onSelect={choosePrompt} />
            </div>
          ) : (
            <div className="daylight-agent-chat">
              <section ref={messageListRef} aria-label="Conversation" className="daylight-agent-messages">
                <div role="log" aria-live="polite" aria-relevant="additions" className="mx-auto max-w-3xl space-y-5 py-6">
                  {activeId && activeConversationQuery.isLoading && <p className="py-8 text-center text-sm text-muted-foreground">Loading conversation…</p>}
                  {activeId && activeConversationQuery.isError && <p role="alert" className="py-8 text-center text-sm text-destructive">This conversation could not be loaded.</p>}
                  {historyMessages.map((message) => (
                    <div key={message.id} className="space-y-5">
                      {message.role === 'user'
                        ? <UserMessage message={message} />
                        : <AssistantMessageView content={message.content} />}
                    </div>
                  ))}
                  {isSending && <AssistantMessageView content="Working on that" pending />}
                  {sendError && <p role="alert" className="mx-auto max-w-3xl text-sm text-destructive">{sendError} Your message is back in the composer so you can retry.</p>}
                </div>
              </section>
              <div className="daylight-agent-chat-composer">
                <div className="mx-auto w-full max-w-3xl">
                  <AgentComposer active value={draft} onChange={setDraft} onSubmit={sendMessage} inputRef={inputRef} projects={projects} projectId={projectId} onProjectChange={setProjectId} models={catalogModels} modelsLoading={modelCatalogQuery.isLoading} modelId={modelId} onModelChange={changeModel} effort={effort} onEffortChange={setEffortOverride} canSend={canSend} isSending={isSending} />
                  {modelCatalogQuery.isError && (
                    <p role="status" className="mt-2 text-center text-[11px] text-muted-foreground">Model options could not be loaded. Refresh the page to try again.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
        <SheetContent side="right" className="gap-0 p-0">
          <SheetHeader className="border-b border-border pr-12">
            <SheetTitle>Conversation history</SheetTitle>
            <SheetDescription>Open a saved conversation from your Daylight account.</SheetDescription>
          </SheetHeader>
          <ConversationHistory conversations={conversationsQuery.data ?? []} activeId={activeId} onSelect={selectConversation} isLoading={conversationsQuery.isLoading} hasError={conversationsQuery.isError} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
