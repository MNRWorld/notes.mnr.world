import type { OutputData } from "@editorjs/editorjs";

export interface NoteHistory {
  content: OutputData;
  updatedAt: number;
}

export interface Note {
  id: string;
  title: string;
  content: OutputData;
  createdAt: number;
  updatedAt: number;
  charCount?: number;
  tags?: string[];
  history?: NoteHistory[];
  isPinned: boolean;
  isLocked: boolean;
  isArchived: boolean;
  icon?: string;
}
