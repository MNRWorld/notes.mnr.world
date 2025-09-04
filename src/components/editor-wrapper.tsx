"use client";

import React, { useCallback, useEffect, useState, useRef } from "react";
import { Note } from "@/lib/types";
import { useNotesStore } from "@/stores/use-notes";
import { EditorOutputData } from "@/lib/types";
import dynamic from "next/dynamic";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const Editor = React.memo(
  dynamic(() => import("@/lib/editor"), {
    ssr: false,
    loading: () => (
      <div className="flex h-60 items-center justify-center">
        <LoadingSpinner />
      </div>
    ),
  }),
);
Editor.displayName = "Editor";
import { EditorHeader } from "@/components/editor-header";
import { useDebouncedCallback } from "@/hooks/use-debounce";
import { getTextFromEditorJS, cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/use-settings";
import { toast } from "sonner";

interface EditorWrapperProps {
  note: Note;
}

export function EditorWrapper({ note }: EditorWrapperProps) {
  const { updateNote } = useNotesStore();
  const font = useSettingsStore((state) => state.font);

  const [wordCount, setWordCount] = useState(0);
  const [lastSaved, setLastSaved] = useState(note.updatedAt);
  const [currentTitle, setCurrentTitle] = useState(note.title);

  const isSavingRef = useRef(false);
  const editorDataRef = useRef<EditorOutputData | undefined>(note.content);

  useEffect(() => {
    setCurrentTitle(note.title);
    setLastSaved(note.updatedAt);
    editorDataRef.current = note.content;
    if (note.content) {
      const text = getTextFromEditorJS(note.content);
      setWordCount(text.split(/\s+/).filter(Boolean).length);
    }
  }, [note]);

  const debouncedSave = useDebouncedCallback(
    async (data: { title: string; content?: EditorOutputData }) => {
      if (isSavingRef.current) return;
      isSavingRef.current = true;

      try {
        await updateNote(note.id, data);
        setLastSaved(Date.now());
      } catch (error) {
      } finally {
        isSavingRef.current = false;
      }
    },
    2000,
  );

  const handleManualSave = useCallback(async () => {
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    try {
      await updateNote(note.id, {
        title: currentTitle,
        content: editorDataRef.current,
      });
      const now = Date.now();
      setLastSaved(now);
      toast.success("নোট সেভ হয়েছে।");
    } catch (error) {
      toast.error("নোট সেভ করা যায়নি।");
      throw error;
    } finally {
      isSavingRef.current = false;
    }
  }, [note.id, updateNote, currentTitle]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newTitle = e.target.value;
    setCurrentTitle(newTitle);
    const target = e.target as HTMLTextAreaElement;
    target.style.height = "auto";
    target.style.height = `${target.scrollHeight}px`;
  };

  const handleContentChange = useCallback(
    (newContent: EditorOutputData) => {
      editorDataRef.current = newContent;
      const text = getTextFromEditorJS(newContent);
      setWordCount(text.split(/\s+/).filter(Boolean).length);
    },
    [],
  );

  const handleSave = useCallback(() => {
    debouncedSave({
      title: currentTitle,
      content: editorDataRef.current,
    });
  }, [currentTitle, debouncedSave]);

  return (
    <div
      className="relative flex-grow flex flex-col bg-background h-full"
      onBlur={handleSave}
    >
      <EditorHeader
        onSave={handleManualSave}
        wordCount={wordCount}
        lastSaved={lastSaved}
      />

      <div className="flex-1 overflow-auto pt-20 lg:pt-8 pb-4">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 h-full">
          <div className="bg-transparent h-full">
            <textarea
              value={currentTitle}
              onChange={handleTitleChange}
              placeholder="শিরোনাম..."
              className={cn(
                "w-full resize-none overflow-hidden break-words border-none bg-transparent p-0 text-3xl font-bold text-foreground focus:outline-none focus:ring-0 sm:text-4xl placeholder:text-muted-foreground/50 mb-4 mt-4 lg:mt-6 sm:mb-6",
                font.split(" ")[0],
              )}
              rows={1}
            />
            <Editor
              content={note.content}
              onChange={handleContentChange}
              placeholder="আপনার লেখা শুরু করুন..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
EditorWrapper.displayName = "EditorWrapper";
