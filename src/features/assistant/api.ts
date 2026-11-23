import { request } from '@/lib/api-client';
import type {
  AssistantChatInput,
  AssistantConversation,
  AssistantConversationSummary,
  AssistantModelCatalog,
} from '@/features/assistant/types';

export const assistantApi = {
  getModelCatalog(signal?: AbortSignal) {
    return request<AssistantModelCatalog>('/assistant/models', { signal });
  },
  getConversations(signal?: AbortSignal) {
    return request<AssistantConversationSummary[]>('/assistant/conversations', { signal });
  },
  getConversation(id: string, signal?: AbortSignal) {
    return request<AssistantConversation>(`/assistant/conversations/${id}`, { signal });
  },
  sendMessage(input: AssistantChatInput) {
    return request<AssistantConversation>('/assistant/chat', {
      method: 'POST',
      body: {
        message: input.message,
        conversationId: input.conversationId,
        modelId: input.modelId,
        effort: input.effort,
        projectId: input.projectId,
      },
    });
  },
};
