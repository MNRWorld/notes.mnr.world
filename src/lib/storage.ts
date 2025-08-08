"use client";

import { Note } from "./types";
import { get, set, del, keys, setMany, getMany } from "idb-keyval";
import type { OutputData } from "@editorjs/editorjs";

const MAX_HISTORY_LENGTH = 20;

export const createNote = async (): Promise<Note> => {
  const id = `note_${Date.now()}`;
  const title = "শিরোনামহীন নোট";
  const newNote: Note = {
    id,
    title: title,
    content: {
      time: Date.now(),
      blocks: [
        {
          id: `block_${Date.now()}`,
          type: "header",
          data: {
            text: title,
            level: 1,
          },
        },
      ],
      version: "2.29.1",
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    charCount: 0,
    isTrashed: false,
    history: [],
    tags: [],
    isPinned: false,
    isLocked: false,
  };
  await set(id, newNote);
  return newNote;
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
    .filter((note) => !note.isTrashed)
    .sort((a, b) => b.updatedAt - a.updatedAt);
};

export const getTrashedNotes = async (): Promise<Note[]> => {
  const allKeys = (await keys()) as string[];
  const noteKeys = allKeys.filter((key) => key.startsWith("note_"));
  if (noteKeys.length === 0) return [];
  const notes = (await getMany<Note>(noteKeys)).filter(
    (note): note is Note => !!note,
  );
  return notes
    .filter((note) => note.isTrashed)
    .sort((a, b) => b.updatedAt - a.updatedAt);
};

export const updateNote = async (
  id: string,
  updates: Partial<Omit<Note, "history" | "id">>,
): Promise<void> => {
  const note = await get<Note>(id);
  if (note) {
    const newHistoryEntry = {
      content: note.content,
      updatedAt: note.updatedAt,
    };

    const newHistory = [newHistoryEntry, ...(note.history || [])].slice(
      0,
      MAX_HISTORY_LENGTH,
    );

    const updatedNote: Note = {
      ...note,
      ...updates,
      updatedAt: Date.now(),
      history: updates.content ? newHistory : note.history,
    };
    await set(id, updatedNote);
  }
};

export const trashNote = async (id: string): Promise<void> => {
  await updateNote(id, { isTrashed: true, isPinned: false });
};

export const restoreNote = async (id: string): Promise<void> => {
  await updateNote(id, { isTrashed: false });
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

export const importNotesWithData = async (
  notesToImport: Note[],
): Promise<void> => {
  if (notesToImport.length > 0) {
    const entries: [IDBValidKey, Note][] = notesToImport.map((note) => [
      note.id,
      note,
    ]);
    await setMany(entries);
  }
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
              isTrashed: noteData.isTrashed || false,
              history: noteData.history || [],
              tags: noteData.tags || [],
              isPinned: noteData.isPinned || false,
              isLocked: noteData.isLocked || false,
            };
            validatedNotes.push(newNote);
          }
        }

        await importNotesWithData(validatedNotes);

        resolve(validatedNotes);
      } catch (error) {
        console.error("Error parsing or importing notes:", error);
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
    return firstBlock.data.text.replace(/<[^>]+>/g, "") || "শিরোনামহীন নোট";
  }
  return "শিরোনামহীন নোট";
};
