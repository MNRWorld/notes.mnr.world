
"use client";

import { create } from "zustand";
import * as localDB from "@/lib/storage";
import type { Note } from "@/lib/types";
import type { OutputData } from "@editorjs/editorjs";
import { toast } from "sonner";

interface NotesState {
  notes: Note[];
  setNotes: (notes: Note[]) => void;
  archivedNotes: Note[];
  isLoading: boolean;
  hasFetched: boolean;
  fetchNotes: () => Promise<Note[]>;
  fetchArchivedNotes: () => Promise<void>;
  addNote: (note: Note) => Promise<void>;
  addImportedNotes: (importedNotes: Note[]) => void;
  archiveNote: (id: string) => Promise<void>;
  unarchiveNote: (id: string) => Promise<void>;
  updateNote: (
    id: string,
    updates: Partial<Omit<Note, "id" | "history">>,
  ) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  deleteNotePermanently: (id: string) => Promise<void>;
  createNote: (content?: OutputData) => Promise<string | undefined>;
  resetState: () => void;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  archivedNotes: [],
  isLoading: true,
  hasFetched: false,

  setNotes: (notes: Note[]) => {
    const noteEntries: [IDBValidKey, Note][] = notes.map((note) => [
      note.id,
      note,
    ]);
    localDB.setManyNotes(noteEntries);
    set({ notes });
  },

  resetState: () =>
    set({
      notes: [],
      archivedNotes: [],
      hasFetched: false,
      isLoading: true,
    }),

  fetchNotes: async () => {
    if (get().hasFetched) {
      set({ isLoading: false });
      return get().notes;
    }
    set({ isLoading: true });
    try {
      const notes = await localDB.getNotes();
      set({ notes, hasFetched: true, isLoading: false });
      return notes;
    } catch (error) {
      toast.error("নোট লোড করতে সমস্যা হয়েছে।");
      set({ isLoading: false });
      return [];
    }
  },

  fetchArchivedNotes: async () => {
    set({ isLoading: true });
    try {
      const archivedNotes = await localDB.getArchivedNotes();
      set({ archivedNotes, isLoading: false });
    } catch (error) {
      toast.error("আর্কাইভের নোট লোড করতে সমস্যা হয়েছে।");
      set({ isLoading: false });
    }
  },

  addNote: async (note: Note) => {
    set((state) => ({ notes: [note, ...state.notes] }));
    await localDB.setNote(note.id, note);
  },

  createNote: async (content?: OutputData) => {
    try {
      const newNote = await localDB.createNote(content);
      set((state) => ({
        notes: [newNote, ...state.notes],
      }));
      return newNote.id;
    } catch (error) {
      toast.error("নতুন নোট তৈরি করতে সমস্যা হয়েছে।");
      return undefined;
    }
  },

  addImportedNotes: (importedNotes: Note[]) => {
    const activeNotes = importedNotes.filter((n) => !n.isArchived);
    const archived = importedNotes.filter((n) => n.isArchived);

    set((state) => ({
      notes: [...state.notes, ...activeNotes],
      archivedNotes: [...state.archivedNotes, ...archived],
    }));
  },

  archiveNote: async (id: string) => {
    const noteToArchive = get().notes.find((note) => note.id === id);
    if (!noteToArchive) return;

    const newNote = { ...noteToArchive, isArchived: true, isPinned: false };

    set((state) => ({
      notes: state.notes.filter((note) => note.id !== id),
      archivedNotes: [newNote, ...state.archivedNotes],
    }));

    try {
      await localDB.archiveNote(id);
    } catch (error) {
      toast.error("নোটটি আর্কাইভ করতে সমস্যা হয়েছে।");
      get().fetchNotes();
      get().fetchArchivedNotes();
    }
  },

  unarchiveNote: async (id: string) => {
    const noteToUnarchive = get().archivedNotes.find((note) => note.id === id);
    if (!noteToUnarchive) return;

    set((state) => ({
      archivedNotes: state.archivedNotes.filter((note) => note.id !== id),
      notes: [{ ...noteToUnarchive, isArchived: false }, ...state.notes],
    }));

    try {
      await localDB.unarchiveNote(id);
    } catch (error) {
      toast.error("নোটটি আন-আর্কাইভ করতে সমস্যা হয়েছে।");
      get().fetchNotes();
      get().fetchArchivedNotes();
    }
  },

  updateNote: async (id, updates) => {
    const { notes, archivedNotes } = get();
    let noteToUpdate: Note | undefined;
    let noteIndex = -1;
    let isArchived = false;

    noteIndex = notes.findIndex((n) => n.id === id);
    if (noteIndex !== -1) {
      noteToUpdate = notes[noteIndex];
    } else {
      noteIndex = archivedNotes.findIndex((n) => n.id === id);
      if (noteIndex !== -1) {
        noteToUpdate = archivedNotes[noteIndex];
        isArchived = true;
      }
    }

    if (!noteToUpdate) return;

    try {
      await localDB.updateNote(id, updates);

      const updatedNote: Note = { ...noteToUpdate, ...updates, updatedAt: Date.now() };

      if (updates.content && noteToUpdate.content) {
        const newHistoryEntry = {
          content: noteToUpdate.content,
          updatedAt: noteToUpdate.updatedAt,
        };
        updatedNote.history = [newHistoryEntry, ...(noteToUpdate.history || [])].slice(
          0,
          20,
        );
      }

      set((state) => {
        const newNotes = isArchived ? [...state.archivedNotes] : [...state.notes];
        newNotes[noteIndex] = updatedNote;
        if (isArchived) {
          return { archivedNotes: newNotes };
        }
        return { notes: newNotes };
      });
    } catch (error) {
      toast.error("নোটটি আপডেট করতে সমস্যা হয়েছে।");
      get().fetchNotes();
      get().fetchArchivedNotes();
    }
  },

  togglePin: async (id: string) => {
    const originalNotes = get().notes;
    const note = originalNotes.find((n) => n.id === id);
    if (!note) return;

    const updatedNote = { ...note, isPinned: !note.isPinned };

    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? updatedNote : n)),
    }));

    try {
      await localDB.updateNote(id, { isPinned: updatedNote.isPinned });
    } catch (error) {
      toast.error("নোটটি পিন করতে সমস্যা হয়েছে।");
      set({ notes: originalNotes });
    }
  },

  deleteNotePermanently: async (id: string) => {
    const originalNotes = [...get().notes];
    const originalArchived = [...get().archivedNotes];

    set((state) => ({
      notes: state.notes.filter((note) => note.id !== id),
      archivedNotes: state.archivedNotes.filter((note) => note.id !== id),
    }));

    try {
      await localDB.deleteNotePermanently(id);
    } catch (error) {
      toast.error("নোটটি স্থায়ীভাবে মুছতে সমস্যা হয়েছে।");
      set({ notes: originalNotes, archivedNotes: originalArchived });
    }
  },
}));
