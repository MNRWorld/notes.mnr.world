
"use client";

import { create } from "zustand";
import * as localDB from "@/lib/storage";
import type { Note } from "@/lib/types";
import { toast } from "sonner";
import { getNoteTitle } from "@/lib/storage";
import { hapticFeedback } from "@/lib/utils";

interface NotesState {
  notes: Note[]; // Only active, non-archived notes
  archivedNotes: Note[];
  isLoading: boolean;
  setNotes: (notes: Note[]) => void;
  fetchAllNotes: () => Promise<void>;
  addNote: (note: Note) => Promise<void>;
  addImportedNotes: (importedNotes: Note[]) => void;
  archiveNote: (id: string) => Promise<void>;
  unarchiveNote: (id: string) => Promise<void>;
  updateNote: (id: string, updates: Partial<Omit<Note, "id">>) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  deleteNotePermanently: (id: string) => Promise<void>;
  createNote: () => Promise<string | undefined>;
  resetState: () => void;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  archivedNotes: [],
  isLoading: true,

  setNotes: (notes: Note[]) => {
    const noteEntries: [IDBValidKey, Note][] = notes.map((note) => [
      note.id,
      note,
    ]);
    localDB.setManyNotes(noteEntries);
    set({
      notes: notes.filter((n) => !n.isArchived),
      archivedNotes: notes.filter((n) => n.isArchived),
    });
  },

  resetState: () =>
    set({
      notes: [],
      archivedNotes: [],
      isLoading: true,
    }),

  fetchAllNotes: async () => {
    if (get().isLoading) {
      try {
        const allNotes = await localDB.getNotes();
        set({
          notes: allNotes.filter((n) => !n.isArchived),
          archivedNotes: allNotes.filter((n) => n.isArchived),
          isLoading: false,
        });
      } catch (error) {
        toast.error("নোট লোড করতে সমস্যা হয়েছে।");
        set({ isLoading: false });
      }
    }
  },

  addNote: async (note: Note) => {
    await localDB.setNote(note.id, note);
    if (!note.isArchived) {
      set((state) => ({
        notes: [note, ...state.notes.filter((n) => n.id !== note.id)],
      }));
    } else {
      set((state) => ({
        archivedNotes: [
          note,
          ...state.archivedNotes.filter((n) => n.id !== note.id),
        ],
      }));
    }
  },

  createNote: async () => {
    try {
      const newNote = await localDB.createNote();
      set((state) => ({
        notes: [newNote, ...state.notes],
      }));
      hapticFeedback("medium");
      return newNote.id;
    } catch (error) {
      toast.error("নতুন নোট তৈরি করতে সমস্যা হয়েছে।");
      return undefined;
    }
  },

  addImportedNotes: (importedNotes: Note[]) => {
    set((state) => {
      const currentIds = new Set([
        ...state.notes.map((n) => n.id),
        ...state.archivedNotes.map((n) => n.id),
      ]);
      const newUniqueNotes = importedNotes.filter((n) => !currentIds.has(n.id));

      const newActive = newUniqueNotes.filter((n) => !n.isArchived);
      const newArchived = newUniqueNotes.filter((n) => n.isArchived);

      return {
        notes: [...state.notes, ...newActive],
        archivedNotes: [...state.archivedNotes, ...newArchived],
      };
    });
  },

  archiveNote: async (id: string) => {
    const noteToArchive = get().notes.find((note) => note.id === id);
    if (!noteToArchive) return;

    // Optimistic UI update
    set((state) => ({
      notes: state.notes.filter((note) => note.id !== id),
      archivedNotes: [
        { ...noteToArchive, isArchived: true, isPinned: false },
        ...state.archivedNotes,
      ],
    }));

    try {
      await localDB.archiveNote(id);
      hapticFeedback("light");
    } catch (error) {
      toast.error("নোটটি আর্কাইভ করতে সমস্যা হয়েছে।");
      // Revert UI on failure
      set((state) => ({
        notes: state.notes, // It's already been added back by the other store's optimistic update
        archivedNotes: state.archivedNotes.filter((n) => n.id !== id),
      }));
    }
  },

  unarchiveNote: async (id: string) => {
    const noteToUnarchive = get().archivedNotes.find((note) => note.id === id);
    if (!noteToUnarchive) return;

    // Optimistic UI update
    set((state) => ({
      archivedNotes: state.archivedNotes.filter((note) => note.id !== id),
      notes: [{ ...noteToUnarchive, isArchived: false }, ...state.notes],
    }));

    try {
      await localDB.unarchiveNote(id);
      hapticFeedback("light");
    } catch (error) {
      toast.error("নোটটি আন-আর্কাইভ করতে সমস্যা হয়েছে।");
      // Revert UI on failure
      set((state) => ({
        archivedNotes: state.archivedNotes, // Re-add to archived
        notes: state.notes.filter((n) => n.id !== id),
      }));
    }
  },

  updateNote: async (id, updates) => {
    const originalNotes = get().notes;
    const originalArchivedNotes = get().archivedNotes;

    // Optimistic UI update
    set((state) => {
      const findAndUpdate = (n: Note) => {
        if (n.id === id) {
          const updatedNote = { ...n, ...updates, updatedAt: Date.now() };
          if (updates.content) {
            updatedNote.title = getNoteTitle(updates.content);
          }
          return updatedNote;
        }
        return n;
      };
      return {
        notes: state.notes.map(findAndUpdate),
        archivedNotes: state.archivedNotes.map(findAndUpdate),
      };
    });

    try {
      await localDB.updateNote(id, updates);
    } catch (error) {
      // Revert on failure
      set({ notes: originalNotes, archivedNotes: originalArchivedNotes });
      throw error; // re-throw for component-level error handling
    }
  },

  togglePin: async (id: string) => {
    const note = get().notes.find((n) => n.id === id);
    if (!note) return;

    const updatedNote = { ...note, isPinned: !note.isPinned };

    // Optimistic UI update
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? updatedNote : n)),
    }));

    try {
      await localDB.updateNote(id, { isPinned: updatedNote.isPinned });
    } catch (error) {
      toast.error("নোটটি পিন করতে সমস্যা হয়েছে।");
      // Revert on failure
      set((state) => ({
        notes: state.notes.map((n) => (n.id === id ? note : n)),
      }));
    }
  },

  deleteNotePermanently: async (id: string) => {
    const originalNotes = get().notes;
    const originalArchivedNotes = get().archivedNotes;

    // Optimistic UI update
    set((state) => ({
      notes: state.notes.filter((note) => note.id !== id),
      archivedNotes: state.archivedNotes.filter((note) => note.id !== id),
    }));

    try {
      await localDB.deleteNotePermanently(id);
      hapticFeedback("heavy");
    } catch (error) {
      toast.error("নোটটি স্থায়ীভাবে মুছতে সমস্যা হয়েছে।");
      // Revert on failure
      set({ notes: originalNotes, archivedNotes: originalArchivedNotes });
    }
  },
}));
