
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
  trashedNotes: Note[]; // Add this
  isLoading: boolean;
  hasFetched: boolean;
  fetchNotes: () => Promise<Note[]>;
  fetchArchivedNotes: () => Promise<void>;
  fetchTrashedNotes: () => Promise<void>; // Add this
  addNote: (note: Note) => Promise<void>;
  addImportedNotes: (importedNotes: Note[]) => void;
  archiveNote: (id: string) => Promise<void>;
  unarchiveNote: (id: string) => Promise<void>;
  restoreNote: (id: string) => Promise<void>; // Add this
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
  trashedNotes: [],
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
      trashedNotes: [],
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
  
  fetchTrashedNotes: async () => {
    // This function can be implemented if you add a trash feature
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
  
  restoreNote: async (id: string) => {
     // This function can be implemented if you add a trash feature
  },

  updateNote: async (id, updates) => {
    const { notes, archivedNotes } = get();
    const noteIndex = notes.findIndex((n) => n.id === id);
    const archivedNoteIndex = archivedNotes.findIndex((n) => n.id === id);
    let noteToUpdate: Note | undefined;
  
    if (noteIndex !== -1) {
      noteToUpdate = notes[noteIndex];
    } else if (archivedNoteIndex !== -1) {
      noteToUpdate = archivedNotes[archivedNoteIndex];
    }
  
    if (!noteToUpdate) return;
  
    try {
      await localDB.updateNote(id, updates);
      
      const updatedNote = { ...noteToUpdate, ...updates, updatedAt: Date.now() };
      
      if (noteIndex !== -1) {
        set((state) => {
          const newNotes = [...state.notes];
          newNotes[noteIndex] = updatedNote;
          return { notes: newNotes };
        });
      } else {
        set((state) => {
           const newArchivedNotes = [...state.archivedNotes];
           newArchivedNotes[archivedNoteIndex] = updatedNote;
           return { archivedNotes: newArchivedNotes };
        });
      }
  
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
    const originalTrashed = [...get().trashedNotes];

    set((state) => ({
      notes: state.notes.filter((note) => note.id !== id),
      archivedNotes: state.archivedNotes.filter((note) => note.id !== id),
      trashedNotes: state.trashedNotes.filter((note) => note.id !== id),
    }));

    try {
      await localDB.deleteNotePermanently(id);
    } catch (error) {
      toast.error("নোটটি স্থায়ীভাবে মুছতে সমস্যা হয়েছে।");
      set({ notes: originalNotes, archivedNotes: originalArchived, trashedNotes: originalTrashed });
    }
  },
}));
