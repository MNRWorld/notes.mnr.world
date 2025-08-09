
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { OutputData } from "@editorjs/editorjs";
import { Note } from "./types";
import * as Lucide from "lucide-react";
import { SortOption } from "@/app/(main)/notes/_components/notes-header";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTextFromEditorJS(data: OutputData | undefined): string {
  if (!data || !data.blocks) return "";

  let text = "";
  data.blocks.forEach((block) => {
    if (block.type === "checklist") {
      block.data.items.forEach((item: { text: string; checked: boolean }) => {
        text += item.text.replace(/<[^>]+>/g, "") + " ";
      });
    } else if (block.data?.text) {
      text += block.data.text.replace(/<[^>]+>/g, "") + " ";
    } else if (block.data?.items) {
      block.data.items.forEach((item: string) => {
        text += item.replace(/<[^>]+>/g, "") + " ";
      });
    }
  });
  return text.trim();
}

const WPM = 225;

export function calculateReadingTime(note: Note): number {
  if (!note?.content) return 0;
  const text = getTextFromEditorJS(note.content);
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const time = Math.ceil(wordCount / WPM);
  return time;
}

export function isLucideIcon(iconName: string): iconName is keyof typeof Lucide {
  return iconName in Lucide;
}

export const sortNotes = (notes: Note[], sortOption: SortOption): Note[] => {
  const sorted = [...notes].sort((a, b) => {
    const [key, order] = sortOption.split("-");

    let valA: any, valB: any;

    if (key === "charCount") {
      valA = a.charCount || 0;
      valB = b.charCount || 0;
    } else {
      valA = a[key as keyof Note];
      valB = b[key as keyof Note];
    }

    if (key === "title") {
      return (
        String(valA).localeCompare(String(valB)) * (order === "asc" ? 1 : -1)
      );
    }

    const dateA = new Date(valA).getTime();
    const dateB = new Date(valB).getTime();

    if (!isNaN(dateA) && !isNaN(dateB)) {
      return order === "asc" ? dateA - dateB : dateB - dateA;
    }

    return (valA - valB) * (order === "asc" ? 1 : -1);
  });

  return sorted.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });
};
