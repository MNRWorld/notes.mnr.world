
"use client";

import { useSearchParams } from "next/navigation";
import { EditorHeader } from "./editor-header";
import { EditorWrapper } from "./editor-wrapper";
import { useNotesStore } from "@/stores/use-notes";
import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Note } from "@/lib/types";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function EditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const noteId = searchParams.get("noteId");
  const { notes, createNote, hasFetched, fetchNotes } = useNotesStore();
  
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
    if (hasFetched && !noteId) {
      handleCreateNote();
    }
  }, [hasFetched, noteId, handleCreateNote]);
  
  if (!hasFetched || (noteId && !notes.find(n => n.id === noteId))) {
    return <LoadingSpinner />;
  }

  const note: Note | null = noteId ? notes.find((n) => n.id === noteId) ?? null : null;
  
  if (noteId && !note) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">নোটটি খুঁজে পাওয়া যায়নি।</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <EditorHeader note={note} />
      <EditorWrapper note={note} key={note?.id || "new-note"} />
    </div>
  );
}
