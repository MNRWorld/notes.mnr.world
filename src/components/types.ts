// Unified Chat Message Types
export interface UserChatMessage {
  type: "user";
  query: string;
}

export interface BotChatMessage {
  type: "bot";
  content: string;
}

export interface LoadingChatMessage {
  type: "loading";
}

export interface ErrorChatMessage {
  type: "error";
  errorText: string;
}

export type ChatMessage =
  | UserChatMessage
  | BotChatMessage
  | LoadingChatMessage
  | ErrorChatMessage;
