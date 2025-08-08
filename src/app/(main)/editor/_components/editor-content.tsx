"use client";

import { useSearchParams } from "next/navigation";
import { EditorHeader } from "./editor-header";
import { EditorWrapper } from "./editor-wrapper";
import { useNotesStore } from "@/stores/use-notes";
import { useEffect } from "react";

export function EditorContent() {
  const searchParams = useSearchParams();
  const noteId = searchParams.get("noteId");
  const { notes, fetchNotes } = useNotesStore();

  useEffect(() => {
    if (!notes.length) {
      fetchNotes();
    }
  }, [notes.length, fetchNotes]);

  const note = noteId ? notes.find((n) => n.id === noteId) ?? null : null;

  if (noteId && !note) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Note not found. It may have been deleted or moved to trash.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <EditorHeader note={note} />
      <EditorWrapper note={note} />
    </div>
  );
}
