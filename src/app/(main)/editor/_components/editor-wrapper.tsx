
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Note } from "@/lib/types";
import { useNotesStore } from "@/stores/use-notes";
import dynamic from "next/dynamic";
import { useDebounce } from "@/hooks/use-debounce";
import { OutputData } from "@editorjs/editorjs";

const Editor = dynamic(() => import("@/lib/editor"), { ssr: false });

interface EditorWrapperProps {
  note: Note | null;
}

export function EditorWrapper({ note }: EditorWrapperProps) {
  const router = useRouter();
  const { updateNote, createNote } = useNotesStore();
  const [content, setContent] = useState<OutputData | undefined>(note?.content);
  const debouncedContent = useDebounce(content, 500);

  const handleUpdate = useCallback((id: string, newContent: OutputData) => {
    updateNote(id, { content: newContent });
  }, [updateNote]);

  const handleCreate = useCallback(async (newContent: OutputData) => {
    const id = await createNote(newContent);
    if (id) {
      router.replace(`/editor?noteId=${id}`, { scroll: false });
    }
  }, [createNote, router]);

  useEffect(() => {
    if (debouncedContent) {
      if (note) {
        if (JSON.stringify(debouncedContent) !== JSON.stringify(note.content)) {
          handleUpdate(note.id, debouncedContent);
        }
      } else {
        handleCreate(debouncedContent);
      }
    }
  }, [debouncedContent, note, handleUpdate, handleCreate]);


  // Autosave every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (note && content) {
        handleUpdate(note.id, content);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [note, content, handleUpdate]);


  return (
    <div className="flex-1 overflow-auto bg-background px-4 pb-40 pt-4">
      <Editor
        content={content}
        onChange={setContent}
        placeholder="লেখা শুরু করুন..."
      />
    </div>
  );
}
