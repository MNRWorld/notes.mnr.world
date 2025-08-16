
"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { Note } from "@/lib/types";
import { useNotesStore } from "@/stores/use-notes";
import { useDebounce } from "@/hooks/use-debounce";
import { OutputData } from "@editorjs/editorjs";
import { getNoteTitle } from "@/lib/storage";
import Editor from "@/lib/editor";

interface EditorWrapperProps {
  note: Note | null;
}

export function EditorWrapper({ note }: EditorWrapperProps) {
  const { updateNote } = useNotesStore();
  const [content, setContent] = useState<OutputData | undefined>(note?.content);
  const debouncedContent = useDebounce(content, 60000); // 1-minute debounce for autosave
  const noteRef = useRef(note);

  // Update ref whenever note prop changes
  useEffect(() => {
    noteRef.current = note;
  }, [note]);

  // Update local content state if the note prop changes from outside
  useEffect(() => {
    setContent(note?.content);
  }, [note?.content]);
  
  const handleUpdate = useCallback((newContent?: OutputData) => {
      const currentNote = noteRef.current;
      if (!currentNote || !newContent) return;
      
      const newTitle = getNoteTitle(newContent);
      // Pass the complete, latest content to the update function
      updateNote(currentNote.id, { title: newTitle, content: newContent });
    }, [updateNote]);

  // Debounced autosave
  useEffect(() => {
    if (debouncedContent && noteRef.current) {
      if (JSON.stringify(debouncedContent) !== JSON.stringify(noteRef.current.content)) {
          handleUpdate(debouncedContent);
      }
    }
  }, [debouncedContent, handleUpdate]);

  return (
    <div className="flex-1 overflow-auto bg-background px-4 pb-40 pt-4">
      <Editor
        content={note?.content}
        onChange={setContent}
        placeholder="লেখা শুরু করুন..."
      />
    </div>
  );
}
