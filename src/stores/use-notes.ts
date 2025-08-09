
"use client";

import { create } from "zustand";
import * as localDB from "@/lib/storage";
import type { Note } from "@/lib/types";
import type { OutputData } from "@editorjs/editorjs";
import { toast } from "sonner";

interface NotesState {
  notes: Note[];
  setNotes: (notes: Note[]) => void;
  trashedNotes: Note[];
  isLoading: boolean;
  hasFetched: boolean;
  fetchNotes: () => Promise<Note[]>;
  fetchTrashedNotes: () => Promise<void>;
  addNote: (note: Note) => Promise<void>;
  addImportedNotes: (importedNotes: Note[]) => void;
  trashNote: (id: string) => Promise<void>;
  updateNote: (
    id: string,
    updates: Partial<Omit<Note, "id" | "history">>,
  ) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  restoreNote: (id: string) => Promise<void>;
  deleteNotePermanently: (id: string) => Promise<void>;
  createNote: (content?: OutputData) => Promise<string | undefined>;
  resetState: () => void;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  trashedNotes: [],
  isLoading: true,
  hasFetched: false,

  setNotes: (notes: Note[]) => {
    set({ notes });
    const noteEntries: [IDBValidKey, Note][] = notes.map((note) => [
      note.id,
      note,
    ]);
    localDB.setManyNotes(noteEntries);
  },

  resetState: () =>
    set({ notes: [], trashedNotes: [], hasFetched: false, isLoading: true }),

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
  
  addNote: async (note: Note) => {
    set((state) => ({ notes: [note, ...state.notes] }));
    await localDB.setNote(note.id, note);
  },

  fetchTrashedNotes: async () => {
    set({ isLoading: true });
    try {
      const trashedNotes = await localDB.getTrashedNotes();
      set({ trashedNotes, isLoading: false });
    } catch (error) {
      toast.error("ট্র্যাশের নোট লোড করতে সমস্যা হয়েছে।");
      set({ isLoading: false });
    }
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
    const activeNotes = importedNotes.filter((n) => !n.isTrashed);
    const trashed = importedNotes.filter((n) => n.isTrashed);

    set((state) => ({
      notes: [...state.notes, ...activeNotes],
      trashedNotes: [...state.trashedNotes, ...trashed],
    }));
  },

  trashNote: async (id: string) => {
    const noteToTrash = get().notes.find((note) => note.id === id);
    if (!noteToTrash) return;

    const newNote = { ...noteToTrash, isTrashed: true, isPinned: false };

    set((state) => ({
      notes: state.notes.filter((note) => note.id !== id),
      trashedNotes: [newNote, ...state.trashedNotes],
    }));

    try {
      await localDB.trashNote(id);
    } catch (error) {
      toast.error("নোটটি ট্র্যাশে সরাতে সমস্যা হয়েছে।");
      get().fetchNotes();
      get().fetchTrashedNotes();
    }
  },

  updateNote: async (id, updates) => {
    const { notes } = get();
    const note = notes.find((n) => n.id === id);
    if (!note) return;

    const updatedNote = { ...note, ...updates, updatedAt: Date.now() };

    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? updatedNote : n)),
    }));

    try {
      await localDB.updateNote(id, updates);
    } catch (error) {
      toast.error("নোটটি আপডেট করতে সমস্যা হয়েছে।");
      get().fetchNotes();
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

  restoreNote: async (id: string) => {
    const noteToRestore = get().trashedNotes.find((note) => note.id === id);
    if (!noteToRestore) return;

    set((state) => ({
      trashedNotes: state.trashedNotes.filter((note) => note.id !== id),
      notes: [{ ...noteToRestore, isTrashed: false }, ...state.notes],
    }));

    try {
      await localDB.restoreNote(id);
    } catch (error) {
      toast.error("নোটটি পুনরুদ্ধার করতে সমস্যা হয়েছে।");
      get().fetchNotes();
      get().fetchTrashedNotes();
    }
  },

  deleteNotePermanently: async (id: string) => {
    const originalTrashed = [...get().trashedNotes];
    set((state) => ({
      trashedNotes: state.trashedNotes.filter((note) => note.id !== id),
    }));

    try {
      await localDB.deleteNotePermanently(id);
    } catch (error) {
      toast.error("নোটটি স্থায়ীভাবে মুছতে সমস্যা হয়েছে।");
      set({ trashedNotes: originalTrashed });
    }
  },
}));
