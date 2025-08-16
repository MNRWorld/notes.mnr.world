
"use client";

import { Note } from "./types";
import { get, set, del, keys, setMany, getMany } from "idb-keyval";
import type { OutputData } from "@editorjs/editorjs";
import { getTextFromEditorJS } from "./utils";

const MAX_HISTORY_LENGTH = 20;

const getDefaultContent = (): OutputData => ({
  time: Date.now(),
  blocks: [
    {
      id: `block_${Date.now()}`,
      type: "header",
      data: {
        text: "শিরোনামহীন নোট",
        level: 1,
      },
    },
     {
      id: `block_${Date.now() + 1}`,
      type: "paragraph",
      data: {
        text: "আপনার লেখা শুরু করুন...",
      },
    },
  ],
  version: "2.29.1",
});

export const createNote = async (content?: OutputData): Promise<Note> => {
  const id = `note_${Date.now()}`;
  const newContent = content || getDefaultContent();
  const title = getNoteTitle(newContent);
  const newNote: Note = {
    id,
    title: title,
    content: newContent,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    charCount: 0,
    isArchived: false,
    history: [],
    tags: [],
    isPinned: false,
    isLocked: false,
    icon: "",
  };
  await set(id, newNote);
  return newNote;
};

export const setNote = async (id: string, note: Note): Promise<void> => {
  await set(id, note);
};

export const getNote = async (id: string): Promise<Note | undefined> => {
  return get(id);
};

export const getNotes = async (): Promise<Note[]> => {
  const allKeys = (await keys()) as string[];
  const noteKeys = allKeys.filter((key) => key.startsWith("note_"));
  if (noteKeys.length === 0) return [];
  const notes = (await getMany<Note>(noteKeys)).filter(
    (note): note is Note => !!note,
  );
  return notes
    .filter((note) => !note.isArchived)
    .sort((a, b) => b.updatedAt - a.updatedAt);
};

export const getArchivedNotes = async (): Promise<Note[]> => {
  const allKeys = (await keys()) as string[];
  const noteKeys = allKeys.filter((key) => key.startsWith("note_"));
  if (noteKeys.length === 0) return [];
  const notes = (await getMany<Note>(noteKeys)).filter(
    (note): note is Note => !!note,
  );
  return notes
    .filter((note) => note.isArchived)
    .sort((a, b) => b.updatedAt - a.updatedAt);
};

export const updateNote = async (
  id: string,
  updates: Partial<Omit<Note, "id">>,
): Promise<void> => {
  const note = await get<Note>(id);
  if (note) {
    let newHistory = note.history || [];

    if (updates.content) {
      // Only create a history entry if the content has actually changed
      if (JSON.stringify(updates.content) !== JSON.stringify(note.content)) {
        const newHistoryEntry = {
          content: note.content,
          updatedAt: note.updatedAt,
        };
        newHistory = [newHistoryEntry, ...newHistory].slice(
          0,
          MAX_HISTORY_LENGTH,
        );
      }

      updates.charCount = getTextFromEditorJS(updates.content).length;
    }

    const updatedNote: Note = {
      ...note,
      ...updates,
      updatedAt: Date.now(),
      history: newHistory,
    };
    await set(id, updatedNote);
  }
};

export const setManyNotes = async (
  entries: [IDBValidKey, Note][],
): Promise<void> => {
  await setMany(entries);
};

export const archiveNote = async (id: string): Promise<void> => {
  await updateNote(id, { isArchived: true, isPinned: false });
};

export const unarchiveNote = async (id: string): Promise<void> => {
  await updateNote(id, { isArchived: false });
};

export const deleteNotePermanently = async (id: string): Promise<void> => {
  await del(id);
};

export const clearAllNotes = async (): Promise<void> => {
  const allKeys = (await keys()) as string[];
  const noteKeys = allKeys.filter((key) => key.startsWith("note_"));
  await Promise.all(noteKeys.map((key) => del(key)));
};

export const exportNotes = async () => {
  const allKeys = (await keys()) as string[];
  const noteKeys = allKeys.filter((key) => key.startsWith("note_"));
  if (noteKeys.length === 0) return [];
  const allNotes = (await getMany<Note>(noteKeys)).filter(
    (note): note is Note => !!note,
  );

  const dataToExport = {
    notes: allNotes,
  };
  const jsonString = JSON.stringify(dataToExport, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = `amar-note-backup-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(href);
};

export const importNotes = (file: File): Promise<Note[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const jsonString = event.target?.result as string;
        const data = JSON.parse(jsonString);

        const notesToImport = Array.isArray(data) ? data : data.notes || [];

        if (!Array.isArray(notesToImport)) {
          throw new Error("Invalid file format.");
        }

        const validatedNotes: Note[] = [];
        for (const noteData of notesToImport) {
          if (noteData.id && noteData.content) {
            const newNote: Note = {
              id: noteData.id,
              title: noteData.title || "শিরোনামহীন নোট",
              content: noteData.content,
              createdAt: noteData.createdAt || Date.now(),
              updatedAt: noteData.updatedAt || Date.now(),
              charCount: noteData.charCount || 0,
              isArchived: noteData.isArchived || false,
              history: noteData.history || [],
              tags: noteData.tags || [],
              isPinned: noteData.isPinned || false,
              isLocked: noteData.isLocked || false,
              icon: noteData.icon || noteData.emoji || "",
            };
            validatedNotes.push(newNote);
          }
        }

        await setManyNotes(validatedNotes.map((n) => [n.id, n]));

        resolve(validatedNotes);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};

export const getNoteTitle = (data: OutputData): string => {
  const firstBlock = data.blocks[0];
  if (firstBlock && firstBlock.type === "header") {
    return firstBlock.data.text.replace(/<[^>]+>/g, "").trim() || "শিরোনামহীন নোট";
  }
  return "শিরোনামহীন নোট";
};

export const getNoteAsMarkdown = (note: Note): string => {
  if (!note.content || !note.content.blocks) return "";
  let markdown = `# ${note.title}\n\n`;
  note.content.blocks.forEach((block: any) => {
    switch (block.type) {
      case "header":
        markdown += `${'#'.repeat(block.data.level)} ${block.data.text}\n\n`;
        break;
      case "paragraph":
        markdown += `${block.data.text.replace(/&nbsp;/g, ' ')}\n\n`;
        break;
      case "list":
        const prefix = block.data.style === "ordered" ? "1." : "-";
        markdown += block.data.items.map((item: string) => `${prefix} ${item}`).join("\n") + "\n\n";
        break;
      case "quote":
        markdown += `> ${block.data.text}\n\n`;
        break;
      case "checklist":
        markdown += block.data.items.map((item: { text: string; checked: boolean }) => `- [${item.checked ? 'x' : ' '}] ${item.text}`).join("\n") + "\n\n";
        break;
      case "code":
        markdown += "```\n" + block.data.code + "\n```\n\n";
        break;
      case "table":
        const header = block.data.withHeadings ? `| ${block.data.content[0].join(" | ")} |\n| ${block.data.content[0].map(() => "---").join(" | ")} |\n` : "";
        const body = (block.data.withHeadings ? block.data.content.slice(1) : block.data.content).map((row: string[]) => `| ${row.join(" | ")} |`).join("\n");
        markdown += header + body + "\n\n";
        break;
      default:
        break;
    }
  });
  return markdown;
};

export const downloadFile = (content: string, filename: string, contentType: string) => {
  const blob = new Blob([content], { type: contentType });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(href);
};
