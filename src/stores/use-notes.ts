"use client";

import { create } from "zustand";
import * as localDB from "@/lib/storage";
import type { Note } from "@/lib/types";
import { hapticFeedback } from "@/lib/utils";
import type { NoteTemplate } from "@/lib/templates";
import { toast } from "sonner";

interface NotesState {
  notes: Note[];
  setNotes: (notes: Note[]) => void;
  archivedNotes: Note[];
  trashedNotes: Note[];
  isLoading: boolean;
  hasFetched: boolean;
  fetchNotes: () => Promise<Note[]>;
  fetchArchivedNotes: () => Promise<void>;
  fetchTrashedNotes: () => Promise<void>;
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
}

export const selectNotesCount = (state: NotesState) => state.notes.length;

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
      console.error("নোট লোড করা যায়নি।", error);
      toast.error("নোট লোড করা যায়নি।");
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
      console.error("আর্কাইভ নোট লোড করা যায়নি।", error);
      toast.error("আর্কাইভ নোট লোড করা যায়নি।");
      set({ isLoading: false });
    }
  },

  fetchTrashedNotes: async () => {
    set({ isLoading: true });
    try {
      const trashedNotes = await localDB.getTrashedNotes();
      set({ trashedNotes, isLoading: false });
    } catch (error) {
      console.error("ট্র্যাশ নোট লোড করা যায়নি।", error);
      toast.error("ট্র্যাশ নোট লোড করা যায়নি।");
      set({ isLoading: false });
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
      toast.success("নতুন নোট তৈরি হয়েছে।");
      return newNote.id;
    } catch (error) {
      console.error("নতুন নোট তৈরি করা যায়নি।", error);
      toast.error("নোট তৈরি করা যায়নি।");
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
      toast.success(`"${template.title}" টেমপ্লেট থেকে নোট তৈরি হয়েছে।`);
      return newNote.id;
    } catch (error) {
      console.error("টেমপ্লেট থেকে নোট তৈরি করা যায়নি।", error);
      toast.error("টেমপ্লেট থেকে নোট তৈরি করা যায়নি।");
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

    const activeNotes = newNotes.filter((n) => !n.isArchived && !n.isTrashed);
    const archived = newNotes.filter((n) => n.isArchived);
    const trashed = newNotes.filter((n) => n.isTrashed);

    set((state) => ({
      notes: [...state.notes, ...activeNotes],
      archivedNotes: [...state.archivedNotes, ...archived],
      trashedNotes: [...state.trashedNotes, ...trashed],
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
      toast.success("নোট আর্কাইভ হয়েছে।");
    } catch (error) {
      console.error("নোট আর্কাইভ করা যায়নি।", error);
      toast.error("নোট আর্কাইভ করা যায়নি।");
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
      toast.success("নোট পুনরুদ্ধার হয়েছে।");
    } catch (error) {
      console.error("নোট পুনরুদ্ধার করা যায়নি।", error);
      toast.error("নোট পুনরুদ্ধার করা যায়নি।");
      set((state) => ({
        archivedNotes: [...state.archivedNotes, noteToUnarchive],
        notes: state.notes.filter((n) => n.id !== id),
      }));
    }
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
      hapticFeedback("light");
      toast.success("নোট ট্র্যাশে পাঠানো হয়েছে।");
    } catch (error) {
      console.error("নোট ট্র্যাশে পাঠানো যায়নি।", error);
      toast.error("নোট ট্র্যাশে পাঠানো যায়নি।");
      set((state) => ({
        notes: [...state.notes, noteToTrash],
        trashedNotes: state.trashedNotes.filter((n) => n.id !== id),
      }));
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
      hapticFeedback("light");
      toast.success("নোট পুনরুদ্ধার হয়েছে।");
    } catch (error) {
      console.error("নোট পুনরুদ্ধার করা যায়নি।", error);
      toast.error("নোট পুনরুদ্ধার করা যায়নি।");
      set((state) => ({
        trashedNotes: [...state.trashedNotes, noteToRestore],
        notes: state.notes.filter((n) => n.id !== id),
      }));
    }
  },

  updateNote: async (id, updates) => {
    let note = get().notes.find((n) => n.id === id);
    let sourceList: "notes" | "archivedNotes" | "trashedNotes" = "notes";

    if (!note) {
      note = get().archivedNotes.find((n) => n.id === id);
      if (note) sourceList = "archivedNotes";
    }
    if (!note) {
      note = get().trashedNotes.find((n) => n.id === id);
      if (note) sourceList = "trashedNotes";
    }

    if (!note) {
      console.error("আপডেট করার জন্য নোট পাওয়া যায়নি:", id);
      return;
    }

    try {
      const updatedNoteData = { ...note, ...updates, updatedAt: Date.now() };

      await localDB.updateNote(id, updatedNoteData, note);

      set((prevState) => {
        const updateList = (list: Note[]) =>
          list.map((n) => (n.id === id ? updatedNoteData : n));
        return { [sourceList]: updateList(prevState[sourceList]) };
      });

      if (updates.icon) toast.success("আইকন পরিবর্তন হয়েছে।");
      if (updates.tags) toast.success("ট্যাগ আপডেট হয়েছে।");
      if (updates.title) toast.success("শিরোনাম পরিবর্তন হয়েছে।");
    } catch (error) {
      toast.error("নোট আপডেট করা যায়নি।");
      console.error("নোট আপডেট করা যায়নি।", error);
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
      toast.success(
        updatedNote.isPinned ? "নোট পিন হয়েছে।" : "নোট আনপিন হয়েছে।",
      );
    } catch (error) {
      console.error("নোট পিন করা যায়নি।", error);
      toast.error("পিন স্ট্যাটাস পরিবর্তন করা যায়নি।");
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
      hapticFeedback("heavy");
      toast.success("নোট স্থায়ীভাবে মুছে ফেলা হয়েছে।");
    } catch (error) {
      console.error("নোট মোছা যায়নি।", error);
      toast.error("নোট মোছা যায়নি।");
      set({
        notes: originalNotes,
        archivedNotes: originalArchived,
        trashedNotes: originalTrashed,
      });
    }
  },
}));
