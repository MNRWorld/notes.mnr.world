"use client";

import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { Note } from "@/lib/types";
import { useNotesStore } from "@/stores/use-notes";
import { OutputData } from "@editorjs/editorjs";
import { getNoteTitle } from "@/lib/storage";
import Editor from "@/lib/editor";
import { toast } from "sonner";
import { EditorHeader } from "./editor-header";
import { useDebounce } from "@/hooks/use-debounce";
import { getTextFromEditorJS } from "@/lib/utils";

interface EditorWrapperProps {
  note: Note;
}

export function EditorWrapper({ note }: EditorWrapperProps) {
  const { updateNote } = useNotesStore();
  const [content, setContent] = useState<OutputData | undefined>(note?.content);
  const [lastSaved, setLastSaved] = useState(note.updatedAt);
  const noteRef = useRef(note);
  const contentRef = useRef(content);
  const isSavingRef = useRef(false);

  const debouncedContent = useDebounce(content, 60000); // 1 minute debounce

  useEffect(() => {
    noteRef.current = note;
    contentRef.current = content;
  }, [note, content]);

  useEffect(() => {
    setContent(note?.content);
  }, [note?.id, note?.content]);

  const handleUpdate = useCallback(
    async (newContent?: OutputData, isAutoSave = false) => {
      const currentNote = noteRef.current;
      if (!currentNote || !newContent || isSavingRef.current) return;

      if (
        isAutoSave &&
        JSON.stringify(newContent) === JSON.stringify(currentNote.content)
      ) {
        return;
      }

      isSavingRef.current = true;
      try {
        const newTitle = getNoteTitle(newContent);
        await updateNote(currentNote.id, {
          title: newTitle,
          content: newContent,
        });
        const now = Date.now();
        setLastSaved(now);

        if (!isAutoSave) {
          toast.success("নোট সফলভাবে সেভ হয়েছে।");
        }
      } catch (error) {
        if (!isAutoSave) {
          toast.error("নোট সেভ করতে সমস্যা হয়েছে।");
        }
        throw error;
      } finally {
        isSavingRef.current = false;
      }
    },
    [updateNote],
  );

  useEffect(() => {
    if (debouncedContent) {
      handleUpdate(debouncedContent, true);
    }
  }, [debouncedContent, handleUpdate]);

  useEffect(() => {
    const saveOnUnmount = () => {
      if (contentRef.current) {
        handleUpdate(contentRef.current);
      }
    };

    window.addEventListener("beforeunload", saveOnUnmount);
    return () => {
      window.removeEventListener("beforeunload", saveOnUnmount);
      saveOnUnmount();
    };
  }, [handleUpdate]);

  const handleManualSave = useCallback(async () => {
    await handleUpdate(content, false);
  }, [handleUpdate, content]);

  const wordCount = useMemo(() => {
    if (!content) return 0;
    return getTextFromEditorJS(content).split(/\s+/).filter(Boolean).length;
  }, [content]);

  return (
    <>
      <EditorHeader
        onSave={handleManualSave}
        wordCount={wordCount}
        lastSaved={lastSaved}
      />
      <div className="flex-1 overflow-auto bg-background px-4 pb-40 pt-4">
        <Editor
          content={note?.content}
          onChange={setContent}
          placeholder="লেখা শুরু করুন..."
        />
      </div>
    </>
  );
}
EditorWrapper.displayName = "EditorWrapper";
