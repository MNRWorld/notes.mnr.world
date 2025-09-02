"use client";

import { create } from "zustand";
import * as localDB from "@/lib/storage";
import type { Note } from "@/lib/types";
import { hapticFeedback } from "@/lib/utils";
import type { NoteTemplate } from "@/lib/templates";
import { toast } from "sonner";
import { useSettingsStore } from "./use-settings";
import { welcomeNote } from "@/lib/welcome-note";

interface NotesState {
  notes: Note[];
  archivedNotes: Note[];
  trashedNotes: Note[];
  isLoading: boolean;
  hasFetched: boolean;
  fetchNotes: () => Promise<void>;
  refreshNotes: () => Promise<void>;
  addNote: (note: Note) => Promise<void>;
  addImportedNotes: (importedNotes: Note[]) => void;
  archiveNote: (id: string) => Promise<void>;
  unarchiveNote: (id: string) => Promise<void>;
  trashNote: (id: string) => Promise<void>;
  restoreNote: (id: string) => Promise<void>;
  updateNote: (id: string, updates: Partial<Omit<Note, "id">>) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  deleteNotePermanently: (id: string) => Promise<void>;
  createNote: () => Promise<string | undefined>;
  createNoteFromTemplate: (
    template: NoteTemplate,
  ) => Promise<string | undefined>;
  resetState: () => void;
  clearTrash: () => Promise<void>;
  restoreAllFromTrash: () => Promise<void>;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  archivedNotes: [],
  trashedNotes: [],
  isLoading: true,
  hasFetched: false,

  resetState: () =>
    set({
      notes: [],
      archivedNotes: [],
      trashedNotes: [],
      hasFetched: false,
      isLoading: true,
    }),

  fetchNotes: async () => {
    try {
      set({ isLoading: true });
      const allNotes = await localDB.getNotes();

      const notes = allNotes.filter(
        (note) => !note.isArchived && !note.isTrashed,
      );
      const archivedNotes = allNotes.filter(
        (note) => note.isArchived && !note.isTrashed,
      );
      const trashedNotes = allNotes.filter((note) => note.isTrashed);

      set({
        notes,
        archivedNotes,
        trashedNotes,
        isLoading: false,
        hasFetched: true,
      });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  refreshNotes: async () => {
    try {
      const allNotes = await localDB.getNotes();

      const notes = allNotes.filter(
        (note) => !note.isArchived && !note.isTrashed,
      );
      const archivedNotes = allNotes.filter(
        (note) => note.isArchived && !note.isTrashed,
      );
      const trashedNotes = allNotes.filter((note) => note.isTrashed);

      set({
        notes,
        archivedNotes,
        trashedNotes,
      });
    } catch (error) {
      // Handle error silently for refresh
    }
  },

  addNote: async (note: Note) => {
    await localDB.setNote(note.id, note);
    if (!note.isArchived && !note.isTrashed) {
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
      toast.success("নতুন নোট তৈরি হয়েছে।");
      return newNote.id;
    } catch (error) {
      toast.error("নোট তৈরি করা যায়নি।");
      return undefined;
    }
  },

  createNoteFromTemplate: async (template: NoteTemplate) => {
    const id = `note_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newNote: Note = {
      id,
      title: template.title,
      content: template.content,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isArchived: false,
      isPinned: false,
      isLocked: false,
      isTrashed: false,
      history: [],
      tags: [],
      icon: template.icon,
    };
    try {
      await get().addNote(newNote);
      hapticFeedback("medium");
      toast.success(`"${template.title}" টেমপ্লেট থেকে নোট তৈরি হয়েছে।`);
      return newNote.id;
    } catch (error) {
      toast.error("টেমপ্লেট থেকে নোট তৈরি করা যায়নি।");
      return undefined;
    }
  },

  addImportedNotes: (importedNotes: Note[]) => {
    const currentNotes = get().notes;
    const currentArchived = get().archivedNotes;
    const currentTrashed = get().trashedNotes;
    const currentIds = new Set([
      ...currentNotes.map((n) => n.id),
      ...currentArchived.map((n) => n.id),
      ...currentTrashed.map((n) => n.id),
    ]);

    const newNotes = importedNotes.filter((n) => !currentIds.has(n.id));
    set((state) => ({
      notes: [
        ...state.notes,
        ...newNotes.filter((n) => !n.isArchived && !n.isTrashed),
      ],
      archivedNotes: [
        ...state.archivedNotes,
        ...newNotes.filter((n) => n.isArchived),
      ],
      trashedNotes: [
        ...state.trashedNotes,
        ...newNotes.filter((n) => n.isTrashed),
      ],
    }));
  },

  archiveNote: async (id: string) => {
    const noteToArchive = get().notes.find((note) => note.id === id);
    if (!noteToArchive) return;

    set((state) => ({
      notes: state.notes.filter((note) => note.id !== id),
      archivedNotes: [
        { ...noteToArchive, isArchived: true, isPinned: false },
        ...state.archivedNotes,
      ],
    }));
    await localDB.updateNote(id, { isArchived: true, isPinned: false });
    toast.success("নোট আর্কাইভ হয়েছে।");
  },

  unarchiveNote: async (id: string) => {
    const noteToUnarchive = get().archivedNotes.find((note) => note.id === id);
    if (!noteToUnarchive) return;

    set((state) => ({
      archivedNotes: state.archivedNotes.filter((note) => note.id !== id),
      notes: [{ ...noteToUnarchive, isArchived: false }, ...state.notes],
    }));
    await localDB.updateNote(id, { isArchived: false });
    toast.success("নোটটি আর্কাইভ থেকে পুনরুদ্ধার করা হয়েছে।");
  },

  trashNote: async (id: string) => {
    const noteToTrash = get().notes.find((note) => note.id === id);
    if (!noteToTrash) return;

    set((state) => ({
      notes: state.notes.filter((note) => note.id !== id),
      trashedNotes: [
        { ...noteToTrash, isTrashed: true, isPinned: false },
        ...state.trashedNotes,
      ],
    }));
    await localDB.updateNote(id, { isTrashed: true, isPinned: false });
    toast.success("নোট ট্র্যাশে পাঠানো হয়েছে।");
  },

  restoreNote: async (id: string) => {
    const noteToRestore = get().trashedNotes.find((note) => note.id === id);
    if (!noteToRestore) return;

    set((state) => ({
      trashedNotes: state.trashedNotes.filter((note) => note.id !== id),
      notes: [{ ...noteToRestore, isTrashed: false }, ...state.notes],
    }));
    await localDB.updateNote(id, { isTrashed: false });
    toast.success("নোটটি ট্র্যাশ থেকে পুনরুদ্ধার করা হয়েছে।");
  },

  updateNote: async (id, updates) => {
    await localDB.updateNote(id, updates);
    const updater = (n: Note) =>
      n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n;
    set((state) => ({
      notes: state.notes.map(updater),
      archivedNotes: state.archivedNotes.map(updater),
      trashedNotes: state.trashedNotes.map(updater),
    }));
    if (updates.tags) toast.success("ট্যাগ আপডেট হয়েছে।");
  },

  togglePin: async (id: string) => {
    const note = get().notes.find((n) => n.id === id);
    if (!note) return;

    const isPinned = !note.isPinned;
    await localDB.updateNote(id, { isPinned });
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, isPinned } : n)),
    }));
    toast.success(isPinned ? "নোট পিন হয়েছে।" : "নোট আনপিন হয়েছে।");
  },

  deleteNotePermanently: async (id: string) => {
    set((state) => ({
      notes: state.notes.filter((note) => note.id !== id),
      archivedNotes: state.archivedNotes.filter((note) => note.id !== id),
      trashedNotes: state.trashedNotes.filter((note) => note.id !== id),
    }));
    await localDB.deleteNotePermanently(id);
    toast.success("নোটটি স্থায়ীভাবে মুছে ফেলা হয়েছে।");
  },

  clearTrash: async () => {
    const trashedIds = get().trashedNotes.map((n) => n.id);
    set({ trashedNotes: [] });
    await Promise.all(
      trashedIds.map((id) => localDB.deleteNotePermanently(id)),
    );
    toast.success("ট্র্যাশ খালি করা হয়েছে।");
  },

  restoreAllFromTrash: async () => {
    const notesToRestore = get().trashedNotes;
    set((state) => ({
      notes: [
        ...state.notes,
        ...notesToRestore.map((n) => ({ ...n, isTrashed: false })),
      ],
      trashedNotes: [],
    }));
    await Promise.all(
      notesToRestore.map((n) => localDB.updateNote(n.id, { isTrashed: false })),
    );
    toast.success("সব নোট ট্র্যাশ থেকে পুনরুদ্ধার করা হয়েছে।");
  },
}));
