
"use client";

import { create } from "zustand";
import * as localDB from "@/lib/storage";
import type { Note } from "@/lib/types";
import { toast } from "sonner";
import { getNoteTitle } from "@/lib/storage";
import { hapticFeedback } from "@/lib/utils";

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
  updateNote: (id: string, updates: Partial<Omit<Note, "id">>) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  deleteNotePermanently: (id: string) => Promise<void>;
  createNote: () => Promise<string | undefined>;
  resetState: () => void;
}

export const selectNotesCount = (state: NotesState) => state.notes.length;

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
    await localDB.setNote(note.id, note);
    if (!note.isArchived) {
      set((state) => ({
        notes: [note, ...state.notes.filter((n) => n.id !== note.id)],
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
    const currentNotes = get().notes;
    const currentArchived = get().archivedNotes;
    const currentIds = new Set([
      ...currentNotes.map((n) => n.id),
      ...currentArchived.map((n) => n.id),
    ]);

    const newNotes = importedNotes.filter((n) => !currentIds.has(n.id));

    const activeNotes = newNotes.filter((n) => !n.isArchived);
    const archived = newNotes.filter((n) => n.isArchived);

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
      hapticFeedback("light");
    } catch (error) {
      toast.error("নোটটি আর্কাইভ করতে সমস্যা হয়েছে।");
      set((state) => ({
        notes: [...state.notes, noteToArchive],
        archivedNotes: state.archivedNotes.filter((n) => n.id !== id),
      }));
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
      hapticFeedback("light");
    } catch (error) {
      toast.error("নোটটি আন-আর্কাইভ করতে সমস্যা হয়েছে।");
      set((state) => ({
        archivedNotes: [...state.archivedNotes, noteToUnarchive],
        notes: state.notes.filter((n) => n.id !== id),
      }));
    }
  },

  updateNote: async (id, updates) => {
    const note =
      get().notes.find((n) => n.id === id) ||
      get().archivedNotes.find((n) => n.id === id);

    if (!note) return;

    try {
      await localDB.updateNote(id, updates, note);

      set((prevState) => {
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
          notes: prevState.notes.map(findAndUpdate),
          archivedNotes: prevState.archivedNotes.map(findAndUpdate),
        };
      });
    } catch (error) {
      // Don't show toast here for autosave, manual save has its own toast.
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
      await localDB.updateNote(id, { isPinned: updatedNote.isPinned }, note);
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
      hapticFeedback("heavy");
    } catch (error) {
      toast.error("নোটটি স্থায়ীভাবে মুছতে সমস্যা হয়েছে।");
      set({ notes: originalNotes, archivedNotes: originalArchived });
    }
  },
}));
