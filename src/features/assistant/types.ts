export type ReasoningEffort = 'low' | 'medium' | 'high';

export type AssistantModelOption = {
  id: string;
  label: string;
  provider: string;
  available: boolean;
  supportedEfforts: ReasoningEffort[];
  unavailableReason: string | null;
};

export type AssistantModelCatalog = {
  models: AssistantModelOption[];
  defaultModelId: string | null;
  chatEnabled: boolean;
  statusMessage: string | null;
};

export type AssistantMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  projectId: string | null;
  projectName: string | null;
  modelId: string | null;
  effort: ReasoningEffort | null;
  createdAt: string;
};

export type AssistantConversationSummary = {
  id: string;
  title: string;
  modelId: string;
  effort: ReasoningEffort;
  createdAt: string;
  updatedAt: string;
};

export type AssistantConversation = AssistantConversationSummary & {
  messages: AssistantMessage[];
};

export type AssistantChatInput = {
  message: string;
  conversationId: string | null;
  modelId: string;
  effort: ReasoningEffort;
  projectId: string | null;
};
