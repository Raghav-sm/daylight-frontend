'use client';

import { useEffect, useRef, useState } from 'react';
import { History, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/layout/logo';
import { useCurrentUser } from '@/features/auth/data';
import { useProjects } from '@/features/projects/data';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { AgentComposer } from './agent-composer';
import { AgentTemplates } from './agent-templates';
import { ConversationHistory, type PreviewConversation } from './conversation-history';
import './agent.css';

const storagePrefix = 'daylight-assistant-preview-conversations';

const suggestions = [
  { label: 'Plan my day', prompt: 'Help me plan my day around the tasks that matter most.' },
  { label: 'Break down a task', prompt: 'Help me break a large task into smaller, actionable steps.' },
  { label: 'Prepare a launch', prompt: 'Help me prepare a launch checklist for my project.' },
];

export function AgentWorkspace() {
  const { data: projects = [] } = useProjects();
  const currentUser = useCurrentUser();
  const storageKey = currentUser.data?.user.id ? `${storagePrefix}:${currentUser.data.user.id}` : null;
  const [draft, setDraft] = useState('');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<PreviewConversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messageListRef = useRef<HTMLElement>(null);
  const activeConversation = conversations.find((item) => item.id === activeId);
  const messages = activeConversation?.messages ?? [];
  const hasConversation = messages.length > 0;

  useEffect(() => {
    if (!storageKey) return;
    const timer = window.setTimeout(() => {
      try {
        const saved = JSON.parse(window.localStorage.getItem(storageKey) ?? '[]');
        const valid = Array.isArray(saved) ? saved.filter((item): item is PreviewConversation =>
          typeof item?.id === 'string' && typeof item.title === 'string' && Array.isArray(item.messages)) : [];
        setConversations(valid);
      } catch {
        setConversations([]);
      }
      setActiveId(null);
      setLoadedKey(storageKey);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey || loadedKey !== storageKey) return;
    try { window.localStorage.setItem(storageKey, JSON.stringify(conversations)); } catch { /* Storage may be unavailable. */ }
  }, [conversations, loadedKey, storageKey]);

  useEffect(() => {
    const list = messageListRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [activeId, messages.length]);

  function choosePrompt(prompt: string) {
    setDraft(prompt);
    inputRef.current?.focus();
  }

  function sendMessage() {
    const text = draft.trim();
    if (!text) return;
    const message = {
      id: crypto.randomUUID(),
      text,
      projectName: projects.find((project) => project.id === projectId)?.name,
    };
    if (activeId && activeConversation) {
      setConversations((current) => current.map((item) =>
        item.id === activeId ? { ...item, messages: [...item.messages, message] } : item));
    } else {
      const id = crypto.randomUUID();
      setConversations((current) => [{ id, title: text.slice(0, 48), messages: [message] }, ...current]);
      setActiveId(id);
    }
    setDraft('');
    inputRef.current?.focus();
  }

  function newConversation() {
    setActiveId(null);
    setDraft('');
    setProjectId(null);
    setHistoryOpen(false);
    inputRef.current?.focus();
  }

  function selectConversation(id: string) {
    setActiveId(id);
    setDraft('');
    setProjectId(null);
    setHistoryOpen(false);
  }

  return (
    <div className="daylight-agent">
      <div className="daylight-agent-layout mx-auto w-full max-w-6xl">
        <div className="daylight-agent-main">
          <div className="daylight-agent-toolbar">
            {hasConversation && <span className="min-w-0 truncate text-sm text-muted-foreground">{activeConversation?.title}</span>}
            <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={newConversation}><Plus aria-hidden="true" />New conversation</Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setHistoryOpen(true)}><History aria-hidden="true" />View history</Button>
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
                <AgentComposer value={draft} onChange={setDraft} onSubmit={sendMessage} inputRef={inputRef} projects={projects} projectId={projectId} onProjectChange={setProjectId} />
                <p className="mt-3 text-center text-[11px] text-muted-foreground">Write naturally. Start with a task, a project, or a question.</p>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {suggestions.map((item) => <Button key={item.label} type="button" variant="outline" size="sm" className="rounded-full bg-card/70 text-xs" onClick={() => choosePrompt(item.prompt)}>{item.label}</Button>)}
                </div>
              </div>
              <AgentTemplates onSelect={choosePrompt} />
            </div>
          ) : (
            <div className="daylight-agent-chat">
              <section ref={messageListRef} aria-label="Conversation preview" className="daylight-agent-messages">
                <div role="log" aria-live="polite" aria-relevant="additions" className="mx-auto max-w-3xl space-y-6 py-6">
                  {messages.map((message) => (
                    <div key={message.id} className="space-y-5">
                      <div className="ml-auto max-w-[90%] rounded-2xl rounded-br-md bg-secondary px-4 py-3 sm:max-w-[80%]">
                        <span className="sr-only">You: </span>
                        {message.projectName && <p className="mb-1.5 text-xs text-muted-foreground">@{message.projectName}</p>}
                        <p className="whitespace-pre-wrap text-sm leading-relaxed [overflow-wrap:anywhere]">{message.text}</p>
                      </div>
                      <div className="flex max-w-xl items-start gap-3">
                        <span className="mt-0.5 shrink-0"><Logo size="inline" /></span>
                        <div>
                          <p className="mb-1.5 text-xs font-medium">Daylight <span className="ml-1 font-normal text-muted-foreground">Preview</span></p>
                          <p className="text-sm leading-relaxed text-muted-foreground">Your message is in this conversation preview. AI replies aren’t connected yet, and your projects and tasks haven’t been changed.</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              <div className="daylight-agent-chat-composer">
                <div className="mx-auto w-full max-w-3xl">
                  <AgentComposer active value={draft} onChange={setDraft} onSubmit={sendMessage} inputRef={inputRef} projects={projects} projectId={projectId} onProjectChange={setProjectId} />
                  <p className="mt-2 text-center text-[11px] text-muted-foreground">Frontend preview · Conversations saved in this browser</p>
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
            <SheetDescription>Open a previous conversation from this browser.</SheetDescription>
          </SheetHeader>
          <ConversationHistory conversations={conversations} activeId={activeId} onSelect={selectConversation} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
