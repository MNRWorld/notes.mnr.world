import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { type EditorOutputData, type BlockToolData, Note } from "./types";

import { SortOption } from "@/components/notes-header";
import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTextFromEditorJS(
  data: EditorOutputData | undefined,
): string {
  if (!data || !data.blocks) return "";

  let text = "";
  data.blocks.forEach((block) => {
    const blockData = block.data as BlockToolData;
    if (block.type === "checklist") {
      blockData.items.forEach((item: { text: string; checked: boolean }) => {
        text += item.text.replace(/<[^>]+>/g, "") + " ";
      });
    } else if (blockData?.text) {
      text += blockData.text.replace(/<[^>]+>/g, "") + " ";
    } else if (blockData?.items) {
      blockData.items.forEach((item: string) => {
        text += item.replace(/<[^>]+>/g, "") + " ";
      });
    } else if (blockData?.content) {
      if (Array.isArray(blockData.content)) {
        blockData.content.forEach((row: string[]) => {
          text += row.join(" ") + " ";
        });
      }
    } else if (blockData?.code) {
      text += blockData.code + " ";
    }
  });
  return text.trim();
}

const WPM = 225;

export function calculateReadingTime(note: Note): number {
  if (!note?.content || typeof note.content === 'string') return 0;
  const text = getTextFromEditorJS(note.content);
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount === 0) return 0;
  const time = Math.ceil(wordCount / WPM);
  return time;
}

export const sortNotes = (notes: Note[], sortOption: SortOption): Note[] => {
  const sorted = [...notes].sort((a, b) => {
    const [key, order] = sortOption.split("-");

    let valA: string | number | boolean | unknown;
    let valB: string | number | boolean | unknown;

    if (key === "charCount") {
      valA = a.charCount || 0;
      valB = b.charCount || 0;
    } else {
      valA = a[key as keyof Note];
      valB = b[key as keyof Note];
    }

    if (typeof valA === "string" && typeof valB === "string") {
      return valA.localeCompare(valB) * (order === "asc" ? 1 : -1);
    }

    if (typeof valA === "number" && typeof valB === "number") {
      const dateA = new Date(valA).getTime();
      const dateB = new Date(valB).getTime();

      if (!isNaN(dateA) && !isNaN(dateB)) {
        return order === "asc" ? dateA - dateB : dateB - dateA;
      }
      return (valA - valB) * (order === "asc" ? 1 : -1);
    }

    return 0;
  });

  return sorted.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });
};

export const hapticFeedback = async (style: "light" | "medium" | "heavy") => {
  if (!Capacitor.isPluginAvailable("Haptics")) {
    return;
  }
  try {
    await Haptics.impact({
      style:
        ImpactStyle[
          (style.charAt(0).toUpperCase() +
            style.slice(1)) as keyof typeof ImpactStyle
        ],
    });
  } catch (error) {}
};

export function sanitizeFileName(name: string, maxLength: number = 50): string {
  let safe = name
    .replace(/[\\/\\?%*:|"<>]/g, "_")
    .replace(/[\x00-\x1f\x7f-\x9f]/g, "");
  safe = safe.trim();
  if (safe.length > maxLength) {
    const extensionMatch = safe.match(/\.[0-9a-z]+$/i);
    const extension = extensionMatch ? extensionMatch[0] : "";
    const baseName = extension ? safe.slice(0, -extension.length) : safe;
    safe = baseName.substring(0, maxLength - extension.length) + extension;
  }
  return safe || "note";
}
