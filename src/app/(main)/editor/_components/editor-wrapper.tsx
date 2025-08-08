"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Note } from "@/lib/types";
import { useNotesStore } from "@/stores/use-notes";
import dynamic from "next/dynamic";
import { useDebounce } from "@/hooks/use-debounce";
const Editor = dynamic(() => import("@/lib/editor"), { ssr: false });

interface EditorWrapperProps {
  note: Note | null;
}

export function EditorWrapper({ note }: EditorWrapperProps) {
  const router = useRouter();
  const { updateNote, createNote } = useNotesStore();
  const [content, setContent] = useState(note?.content || "");
  const debouncedContent = useDebounce(content, 500);

  const handleCreateNote = useCallback(async () => {
    const id = await createNote();
    if (id) {
      router.push(`/editor?noteId=${id}`);
    }
  }, [createNote, router]);

  useEffect(() => {
    if (!note && debouncedContent) {
      handleCreateNote();
    }
  }, [note, debouncedContent, handleCreateNote]);

  useEffect(() => {
    const saveNote = (currentNote: Note | null) => {
      if (currentNote && debouncedContent !== currentNote.content) {
        updateNote(currentNote.id, { content: debouncedContent });
      }
    };

    const interval = setInterval(() => {
      saveNote(note);
    }, 60000);

    return () => {
      clearInterval(interval);
      saveNote(note);
    };
  }, [debouncedContent, updateNote, note]);

  return (
    <div className="flex-1 overflow-auto bg-background px-4 pb-40 pt-4">
      <Editor
        content={content}
        onChange={setContent}
        placeholder="Start writing..."
      />
    </div>
  );
}
