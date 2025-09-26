"use client";

import { useSearchParams } from "next/navigation";
import { EditorWrapper } from "./editor-wrapper";
import { useNotesStore } from "@/stores/use-notes";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Note } from "@/lib/types";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { motion } from "framer-motion";
// welcomeNote removed from this module to avoid unused import and bundle inclusion

export default function EditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const noteId = searchParams.get("noteId");
  const { notes, hasFetched, fetchNotes, addNote } = useNotesStore((state) => ({
    notes: state.notes,
    hasFetched: state.hasFetched,
    fetchNotes: state.fetchNotes,
    addNote: state.addNote,
  }));

  const currentNote = useMemo(() => {
    if (!noteId) return null;
    return notes.find((n) => n.id === noteId);
  }, [noteId, notes]);

  useEffect(() => {
    if (!hasFetched) {
      fetchNotes();
    }
  }, [hasFetched, fetchNotes]);

  const MemoizedEditorWrapper = useMemo(() => {
    if (currentNote) {
      return <EditorWrapper note={currentNote} />;
    }
    return null;
  }, [currentNote?.id]); // Depend only on note.id to prevent re-renders

  if (!hasFetched || (noteId && currentNote === undefined)) {
    return <LoadingSpinner />;
  }

  if (!noteId || currentNote === null) {
    return (
      <div className="flex h-full flex-col items-center justify-center space-y-4 p-4 text-center">
        <p className="text-lg text-muted-foreground">নোট পাওয়া যায়নি।</p>
        <p className="text-sm text-muted-foreground">
          এটি মুছে ফেলা হয়েছে অথবা আপনি একটি নতুন নোট তৈরি করতে পারেন।
        </p>
      </div>
    );
  }

  return (
    <motion.div
      layoutId={`note-card-${noteId}`}
      className="flex h-full flex-col bg-background"
    >
      {MemoizedEditorWrapper}
    </motion.div>
  );
}
