"use client";

import { useSearchParams } from "next/navigation";
import { EditorHeader } from "./editor-header";
import { EditorWrapper } from "./editor-wrapper";
import { useNotesStore } from "@/stores/use-notes";
import { useEffect, useCallback, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Note } from "@/lib/types";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { motion } from "framer-motion";
import { welcomeNote } from "@/lib/welcome-note";

export function EditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const noteId = searchParams.get("noteId");
  const { notes, createNote, hasFetched, fetchNotes, addNote } = useNotesStore();
  const [currentNote, setCurrentNote] = useState<Note | null | undefined>(
    undefined,
  );

  const handleCreateNote = useCallback(async () => {
    try {
      const newNoteId = await createNote();
      if (newNoteId) {
        router.replace(`/editor?noteId=${newNoteId}`, { scroll: false });
      }
    } catch (error) {
      // Error is handled in the store
    }
  }, [createNote, router]);

  useEffect(() => {
    if (!hasFetched) {
      fetchNotes().then((fetchedNotes) => {
        if (!noteId && fetchedNotes.length === 0) {
          // If it's the very first run and no note exists, create the welcome note.
          addNote(welcomeNote);
          router.replace(`/editor?noteId=${welcomeNote.id}`, { scroll: false });
        }
      });
    }
  }, [hasFetched, fetchNotes, noteId, addNote, router]);

  useEffect(() => {
    if (hasFetched) {
      if (noteId) {
        const foundNote = notes.find((n) => n.id === noteId);
        setCurrentNote(foundNote ?? null);
      } else if (notes.length > 0) {
        // If no noteId is specified, but notes exist, redirect to the most recent one.
        router.replace(`/editor?noteId=${notes[0].id}`, { scroll: false });
      } else {
        // If no notes exist at all, create a new one.
        handleCreateNote();
      }
    }
  }, [noteId, hasFetched, notes, handleCreateNote, router]);
  

  if (currentNote === undefined) {
    return <LoadingSpinner />;
  }

  if (currentNote === null) {
     return (
      <div className="flex h-full flex-col items-center justify-center space-y-4 text-center p-4">
        <p className="text-muted-foreground">দুঃখিত, এই নোটটি খুঁজে পাওয়া যায়নি।</p>
        <p className="text-sm text-muted-foreground">এটি ডিলিট করা হতে পারে অথবা আপনি একটি নতুন নোট তৈরি করতে পারেন।</p>
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
