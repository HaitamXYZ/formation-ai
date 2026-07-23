export type AIMessageRole = "User" | "Assistant" | "System";

export type AIMessage = {
  id: number;
  role: AIMessageRole;
  content: string;
  createdAt: string;
};

export type AIConversationListItem = {
  id: number;
  trainingId: number;
  trainingTitle: string;
  trainingModuleId: number;
  trainingModuleTitle: string;
  title: string;
  createdAt: string;
  updatedAt: string | null;
};

export type AIConversation = AIConversationListItem & {
  messages: AIMessage[];
};

export type AITrainerAnswer = {
  conversationId: number;
  answer: string;
  isGrounded: boolean;
  sources: string[];
  createdAt: string;
};

export type CreateAIConversationPayload = {
  trainingId: number;
  trainingModuleId: number;
};

export type AskAITrainerPayload = {
  conversationId: number;
  question: string;
};

export type AITrainerModuleOption = {
  id: number;
  title: string;
  orderIndex: number;
};

export type AITrainerTrainingOption = {
  id: number;
  title: string;
  shortDescription: string | null;
  modules: AITrainerModuleOption[];
};

