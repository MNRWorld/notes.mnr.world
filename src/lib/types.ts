export type BlockToolData<T extends object = any> = T;
export type BlockTuneData = any;
export type BlockId = string;

export interface OutputBlockData<
  Type extends string = string,
  Data extends object = any,
> {
  id?: BlockId;
  type: Type;
  data: BlockToolData<Data>;
  tunes?: { [name: string]: BlockTuneData };
}

export interface EditorOutputData {
  version?: string;
  time?: number;
  blocks: OutputBlockData[];
}

export interface NoteHistory {
  content: EditorOutputData;
  updatedAt: number;
  version: string;
  message?: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  dueDate?: number;
  createdAt: number;
}

export interface BengaliDate {
  day: number;
  month: number;
  year: number;
  monthName: string;
  seasonName: string;
}

export interface Note {
  id: string;
  title: string;
  content: EditorOutputData | string;
  createdAt: number;
  updatedAt: number;
  charCount?: number;
  tags?: string[];
  history?: NoteHistory[];
  isPinned: boolean;
  isLocked: boolean;
  isArchived: boolean;
  isTrashed: boolean;
  icon?: string;
  // New enhanced features
  tasks?: Task[];
  isAnonymous?: boolean; // Privacy mode
  bengaliDate?: BengaliDate;
  version?: string;
  parentVersion?: string;
}

export interface CustomTemplate {
  id: string;
  title: string;
  icon?: string;
  content: EditorOutputData;
  createdAt: number;
}
