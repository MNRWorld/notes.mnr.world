import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { OutputData } from "@editorjs/editorjs";
import { Note } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTextFromEditorJS(data: OutputData | undefined): string {
  if (!data || !data.blocks) return "";

  let text = "";
  data.blocks.forEach((block) => {
    if (block.type === 'checklist') {
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
