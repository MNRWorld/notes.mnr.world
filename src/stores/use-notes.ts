
"use client";

import { create } from "zustand";
import * as localDB from "@/lib/storage";
import type { Note } from "@/lib/types";
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
      console.error("Failed to load notes.", error);
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
      console.error("Failed to load archived notes.", error);
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
      console.error("Failed to create new note.", error);
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
      console.error("Failed to archive note.", error);
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
      console.error("Failed to unarchive note.", error);
      set((state) => ({
        archivedNotes: [...state.archivedNotes, noteToUnarchive],
        notes: state.notes.filter((n) => n.id !== id),
      }));
    }
  },

  updateNote: async (id, updates) => {
    let note = get().notes.find((n) => n.id === id);
    let isArchived = false;

    if (!note) {
      note = get().archivedNotes.find((n) => n.id === id);
      isArchived = true;
    }

    if (!note) {
      console.error("Note not found for update:", id);
      return;
    }

    try {
      const updatedNoteData = { ...note, ...updates, updatedAt: Date.now() };

      await localDB.updateNote(id, updatedNoteData, note);

      set((prevState) => {
        const updateList = (list: Note[]) =>
          list.map((n) => (n.id === id ? updatedNoteData : n));
        
        if (isArchived) {
          return { archivedNotes: updateList(prevState.archivedNotes) };
        }
        return { notes: updateList(prevState.notes) };
      });
    } catch (error) {
      console.error("Failed to update note", error);
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
      console.error("Failed to pin note.", error);
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
      console.error("Failed to delete note.", error);
      set({ notes: originalNotes, archivedNotes: originalArchived });
    }
  },
}));
