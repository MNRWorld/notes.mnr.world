
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
  archivedNotes: Note[];
  isLoading: boolean;
  hasFetched: boolean;
  fetchNotes: () => Promise<Note[]>;
  fetchTrashedNotes: () => Promise<void>;
  fetchArchivedNotes: () => Promise<void>;
  addNote: (note: Note) => Promise<void>;
  addImportedNotes: (importedNotes: Note[]) => void;
  trashNote: (id: string) => Promise<void>;
  archiveNote: (id: string) => Promise<void>;
  unarchiveNote: (id: string) => Promise<void>;
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
  archivedNotes: [],
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
    set({
      notes: [],
      trashedNotes: [],
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
    const activeNotes = importedNotes.filter((n) => !n.isTrashed && !n.isArchived);
    const trashed = importedNotes.filter((n) => n.isTrashed);
    const archived = importedNotes.filter((n) => n.isArchived && !n.isTrashed);

    set((state) => ({
      notes: [...state.notes, ...activeNotes],
      trashedNotes: [...state.trashedNotes, ...trashed],
      archivedNotes: [...state.archivedNotes, ...archived],
    }));
  },

  trashNote: async (id: string) => {
    const noteToTrash =
      get().notes.find((note) => note.id === id) ||
      get().archivedNotes.find((note) => note.id === id);

    if (!noteToTrash) return;

    const newNote = {
      ...noteToTrash,
      isTrashed: true,
      isPinned: false,
      isArchived: false,
    };

    set((state) => ({
      notes: state.notes.filter((note) => note.id !== id),
      archivedNotes: state.archivedNotes.filter((note) => note.id !== id),
      trashedNotes: [newNote, ...state.trashedNotes],
    }));

    try {
      await localDB.trashNote(id);
    } catch (error) {
      toast.error("নোটটি ট্র্যাশে সরাতে সমস্যা হয়েছে।");
      get().fetchNotes();
      get().fetchTrashedNotes();
      get().fetchArchivedNotes();
    }
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
    const note = notes.find((n) => n.id === id) || archivedNotes.find(n => n.id === id);
    if (!note) return;

    const updatedNote = { ...note, ...updates, updatedAt: Date.now() };
    
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? updatedNote : n)),
      archivedNotes: state.archivedNotes.map((n) => (n.id === id ? updatedNote : n)),
    }));

    try {
      await localDB.updateNote(id, updates);
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
