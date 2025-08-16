"use client";

import { useSearchParams } from "next/navigation";
import { EditorHeader } from "./editor-header";
import { EditorWrapper } from "./editor-wrapper";
import { useNotesStore } from "@/stores/use-notes";
import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Note } from "@/lib/types";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { motion } from "framer-motion";

export function EditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const noteId = searchParams.get("noteId");
  const { notes, createNote, hasFetched, fetchNotes } = useNotesStore();
  const [currentNote, setCurrentNote] = useState<Note | null | undefined>(
    undefined,
  );

  const handleCreateNote = useCallback(async () => {
    const newNoteId = await createNote();
    if (newNoteId) {
      router.replace(`/editor?noteId=${newNoteId}`, { scroll: false });
    }
  }, [createNote, router]);

  useEffect(() => {
    if (!hasFetched) {
      fetchNotes();
    }
  }, [hasFetched, fetchNotes]);

  useEffect(() => {
    if (hasFetched) {
      if (noteId) {
        const foundNote = notes.find((n) => n.id === noteId);
        setCurrentNote(foundNote === undefined ? null : foundNote);
      } else {
        handleCreateNote();
      }
    }
  }, [noteId, hasFetched, notes, handleCreateNote]);

  if (currentNote === undefined) {
    return <LoadingSpinner />;
  }

  if (currentNote === null) {
     return (
      <div className="flex h-full flex-col items-center justify-center space-y-4">
        <p className="text-muted-foreground">নোটটি খুঁজে পাওয়া যায়নি। একটি নতুন নোট তৈরি করা হচ্ছে...</p>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <motion.div
      layoutId={`note-card-${noteId}`}
      className="flex h-full flex-col bg-background"
    >
      <EditorHeader note={currentNote} />
      <EditorWrapper note={currentNote} key={currentNote?.id || "new-note"} />
    </motion.div>
  );
}
