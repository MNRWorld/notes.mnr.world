// Types for Wikipedia API
export interface WikiPage {
  pageid: number;
  title: string;
  extract: string;
}

// Types for dev.to API
export interface ArticleUser {
  name: string;
  profile_image_90: string;
}

export interface ArticleItem {
  id: number;
  title: string;
  description: string;
  url: string;
  comments_count: number;
  public_reactions_count: number;
  published_timestamp: string;
  cover_image: string | null;
  tag_list: string[];
  user: ArticleUser;
}

// Unified Chat Message Types
export type ModelType = "mnrWiKi" | "mnrArticles" | "mnrSearch";
export interface UserChatMessage {
  type: "user";
  model: ModelType;
  query: string;
}

export interface BotChatMessage {
  type: "bot";
  model: ModelType;
  wikiResult?: WikiPage | null;
  articleResults?: ArticleItem[] | null;
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
