"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { Note } from "@/lib/types";
import { useNotesStore } from "@/stores/use-notes";
import { EditorOutputData } from "@/lib/types";
import dynamic from "next/dynamic";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const Editor = dynamic(() => import("@/lib/editor"), {
  ssr: false,
  loading: () => (
    <div className="flex h-60 items-center justify-center">
      <LoadingSpinner />
    </div>
  ),
});
import { EditorHeader } from "@/components/editor-header";
import { useDebounce } from "@/hooks/use-debounce";
import { getTextFromEditorJS, cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/use-settings";
import { toast } from "sonner";

interface EditorWrapperProps {
  note: Note;
}

export function EditorWrapper({ note }: EditorWrapperProps) {
  const { updateNote } = useNotesStore();
  const font = useSettingsStore((state) => state.font);

  const titleRef = useRef(note.title);
  const contentRef = useRef<EditorOutputData | undefined>(note.content);

  const [wordCount, setWordCount] = useState(0);
  const [lastSaved, setLastSaved] = useState(note.updatedAt);
  const [currentTitle, setCurrentTitle] = useState(note.title);

  const debouncedContent = useDebounce(contentRef.current, 5000);
  const debouncedTitle = useDebounce(currentTitle, 2000);

  const isSavingRef = useRef(false);

  useEffect(() => {
    titleRef.current = note.title;
    contentRef.current = note.content;
    setCurrentTitle(note.title);
    setLastSaved(note.updatedAt);
    if (note.content) {
      const text = getTextFromEditorJS(note.content);
      setWordCount(text.split(/\s+/).filter(Boolean).length);
    }
  }, [note]);

  const handleUpdate = useCallback(
    async (isAutoSave = false) => {
      if (isSavingRef.current) return;

      const titleToSave = titleRef.current;
      const contentToSave = contentRef.current;

      isSavingRef.current = true;
      try {
        await updateNote(note.id, {
          title: titleToSave,
          content: contentToSave,
        });
        const now = Date.now();
        setLastSaved(now);
        if (!isAutoSave) {
          toast.success("নোট সেভ হয়েছে।");
        }
      } catch (error) {
        if (!isAutoSave) {
          toast.error("নোট সেভ করতে সমস্যা হয়েছে।");
        }
        console.error(error);
        if (!isAutoSave) throw error;
      } finally {
        isSavingRef.current = false;
      }
    },
    [note.id, updateNote],
  );

  useEffect(() => {
    if (debouncedContent) {
      handleUpdate(true);
    }
  }, [debouncedContent, handleUpdate]);

  useEffect(() => {
    if (debouncedTitle && debouncedTitle !== note.title) {
      handleUpdate(true);
    }
  }, [debouncedTitle, handleUpdate, note.title]);

  useEffect(() => {
    const saveOnUnmount = () => {
      handleUpdate(false);
    };
    window.addEventListener("beforeunload", saveOnUnmount);
    return () => {
      window.removeEventListener("beforeunload", saveOnUnmount);
      saveOnUnmount();
    };
  }, [handleUpdate]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    titleRef.current = e.target.value;
    setCurrentTitle(e.target.value);
    const target = e.target as HTMLTextAreaElement;
    target.style.height = "auto";
    target.style.height = `${target.scrollHeight}px`;
  };

  const handleContentChange = (newContent: EditorOutputData) => {
    contentRef.current = newContent;
    const text = getTextFromEditorJS(newContent);
    setWordCount(text.split(/\s+/).filter(Boolean).length);
  };

  return (
    <div className="relative min-h-screen bg-background">
      <EditorHeader
        onSave={() => handleUpdate(false)}
        wordCount={wordCount}
        lastSaved={lastSaved}
      />

      <div className="flex-1 overflow-auto bg-transparent pb-40 pt-16 lg:pt-6">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg border bg-card p-4 shadow-sm sm:p-6 md:p-8">
            <textarea
              defaultValue={note.title}
              onChange={handleTitleChange}
              placeholder="শিরোনামহীন নোট"
              className={cn(
                "w-full resize-none overflow-hidden break-words border-none bg-transparent p-0 text-3xl font-bold text-foreground focus:outline-none focus:ring-0 sm:text-4xl placeholder:text-muted-foreground/50 mb-6",
                font.split(" ")[0],
              )}
              rows={1}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = `${target.scrollHeight}px`;
              }}
            />
            <Editor
              content={note.content}
              onChange={handleContentChange}
              placeholder="লেখা শুরু করুন..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
EditorWrapper.displayName = "EditorWrapper";
