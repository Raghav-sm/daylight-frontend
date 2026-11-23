'use client';

import { MessageSquare } from 'lucide-react';
import type { AssistantConversationSummary } from '@/features/assistant/types';

type ConversationHistoryProps = {
  conversations: AssistantConversationSummary[];
  activeId: string | null;
  onSelect: (id: string) => void;
  isLoading: boolean;
  hasError: boolean;
};

export function ConversationHistory({ conversations, activeId, onSelect, isLoading, hasError }: ConversationHistoryProps) {
  return (
    <div className="daylight-agent-history" aria-label="Conversation history">
      <nav aria-label="Previous chats" className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 py-3">
        {isLoading && <p className="px-2 py-3 text-xs text-muted-foreground">Loading your conversations…</p>}
        {hasError && <p role="alert" className="px-2 py-3 text-xs text-destructive">Conversation history could not be loaded.</p>}
        {!isLoading && !hasError && conversations.length === 0 && (
          <p className="px-2 py-3 text-xs leading-relaxed text-muted-foreground">Your conversations will appear here after you send a message.</p>
        )}
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            type="button"
            aria-current={activeId === conversation.id ? 'page' : undefined}
            onClick={() => onSelect(conversation.id)}
            className="daylight-agent-history-item"
          >
            <MessageSquare aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <span className="min-w-0 truncate">{conversation.title}</span>
          </button>
        ))}
      </nav>
      <p className="border-t border-border px-4 py-3 text-[11px] text-muted-foreground">Saved to your Daylight account</p>
    </div>
  );
}
