'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assistantApi } from '@/features/assistant/api';
import type { AssistantChatInput } from '@/features/assistant/types';
import { projectKeys } from '@/features/projects/data';

export const assistantKeys = {
  modelCatalog: () => ['assistant', 'model-catalog'] as const,
  conversations: () => ['assistant', 'conversations'] as const,
  conversation: (id: string) => ['assistant', 'conversation', id] as const,
};

export function useAssistantModelCatalog() {
  return useQuery({
    queryKey: assistantKeys.modelCatalog(),
    queryFn: ({ signal }) => assistantApi.getModelCatalog(signal),
    staleTime: 60_000,
    retry: false,
  });
}

export function useAssistantConversations() {
  return useQuery({
    queryKey: assistantKeys.conversations(),
    queryFn: ({ signal }) => assistantApi.getConversations(signal),
    staleTime: 15_000,
    retry: false,
  });
}

export function useAssistantConversation(id: string | null) {
  return useQuery({
    queryKey: assistantKeys.conversation(id ?? ''),
    queryFn: ({ signal }) => assistantApi.getConversation(id!, signal),
    enabled: Boolean(id),
    staleTime: 15_000,
    retry: false,
  });
}

export function useSendAssistantMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AssistantChatInput) => assistantApi.sendMessage(input),
    onSuccess: (conversation) => {
      queryClient.setQueryData(assistantKeys.conversation(conversation.id), conversation);
      queryClient.setQueryData(
        assistantKeys.conversations(),
        (current: Awaited<ReturnType<typeof assistantApi.getConversations>> | undefined) => {
          const summaries = current ?? [];
          const summary = {
            id: conversation.id,
            title: conversation.title,
            modelId: conversation.modelId,
            effort: conversation.effort,
            createdAt: conversation.createdAt,
            updatedAt: conversation.updatedAt,
          };
          return [summary, ...summaries.filter((item) => item.id !== conversation.id)];
        },
      );
      queryClient.invalidateQueries({ queryKey: projectKeys.list() });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
