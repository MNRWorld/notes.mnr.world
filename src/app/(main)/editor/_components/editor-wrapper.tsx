
"use client";

import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { Note } from "@/lib/types";
import { useNotesStore } from "@/stores/use-notes";
import { OutputData } from "@editorjs/editorjs";
import { getNoteTitle } from "@/lib/storage";
import Editor from "@/lib/editor";
import { EditorHeader } from "./editor-header";
import { useDebounce } from "@/hooks/use-debounce";
import { getTextFromEditorJS, cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/use-settings";

interface EditorWrapperProps {
  note: Note;
}

export function EditorWrapper({ note }: EditorWrapperProps) {
  const { updateNote } = useNotesStore();
  const font = useSettingsStore((state) => state.font);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState<OutputData | undefined>(note?.content);
  const [lastSaved, setLastSaved] = useState(note.updatedAt);
  const noteRef = useRef(note);
  const contentRef = useRef(content);
  const titleRef = useRef(title);
  const isSavingRef = useRef(false);

  const debouncedContent = useDebounce(content, 60000); // 1 minute debounce
  const debouncedTitle = useDebounce(title, 1000); // 1 second debounce for title

  useEffect(() => {
    noteRef.current = note;
    contentRef.current = content;
    titleRef.current = title;
  }, [note, content, title]);

  useEffect(() => {
    setTitle(note?.title);
    setContent(note?.content);
  }, [note?.id, note?.title, note?.content]);

  const handleUpdate = useCallback(
    async (newContent?: OutputData, newTitle?: string, isAutoSave = false) => {
      const currentNote = noteRef.current;
      if (!currentNote || isSavingRef.current) return;

      const finalContent = newContent ?? currentNote.content;
      const finalTitle = newTitle ?? currentNote.title;

      if (
        isAutoSave &&
        JSON.stringify(finalContent) === JSON.stringify(currentNote.content) &&
        finalTitle === currentNote.title
      ) {
        return;
      }

      isSavingRef.current = true;
      try {
        await updateNote(currentNote.id, {
          title: finalTitle,
          content: finalContent,
        });
        const now = Date.now();
        setLastSaved(now);
      } catch (error) {
        if (!isAutoSave) {
          console.error("Failed to save note", error);
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
      handleUpdate(debouncedContent, titleRef.current, true);
    }
  }, [debouncedContent, handleUpdate]);

  useEffect(() => {
    if (debouncedTitle && debouncedTitle !== noteRef.current.title) {
      handleUpdate(contentRef.current, debouncedTitle, true);
    }
  }, [debouncedTitle, handleUpdate]);

  useEffect(() => {
    const saveOnUnmount = () => {
      handleUpdate(contentRef.current, titleRef.current);
    };

    window.addEventListener("beforeunload", saveOnUnmount);
    return () => {
      window.removeEventListener("beforeunload", saveOnUnmount);
      saveOnUnmount();
    };
  }, [handleUpdate]);

  const handleManualSave = useCallback(async () => {
    await handleUpdate(content, title, false);
  }, [handleUpdate, content, title]);

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
      <div className="flex-1 overflow-auto bg-background px-2 pb-40 pt-4 sm:px-4">
        <div className="mx-auto max-w-4xl">
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="শিরোনামহীন নোট"
            className={cn(
              "w-full resize-none overflow-hidden break-words border-none bg-transparent px-2 text-3xl font-bold text-foreground focus:outline-none sm:text-4xl",
              font.split(" ")[0],
            )}
            rows={1}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = `${target.scrollHeight}px`;
            }}
          />
          <div className="px-2">
            <Editor
              content={note?.content}
              onChange={setContent}
              placeholder="লেখা শুরু করুন..."
            />
          </div>
        </div>
      </div>
    </>
  );
}
EditorWrapper.displayName = "EditorWrapper";
