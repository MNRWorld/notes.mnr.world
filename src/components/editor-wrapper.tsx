"use client";

import { useCallback, useEffect, useState, useRef, useMemo } from "react";
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

  // Use refs to hold the latest title and content to prevent re-renders on every keystroke
  const titleRef = useRef(note.title);
  const contentRef = useRef<EditorOutputData | undefined>(note.content);

  // Use state only for values that should trigger re-renders
  const [wordCount, setWordCount] = useState(0);
  const [lastSaved, setLastSaved] = useState(note.updatedAt);
  const [currentTitle, setCurrentTitle] = useState(note.title);

  // This is for debouncing the value that will be saved
  const debouncedContent = useDebounce(contentRef.current, 5000);
  const debouncedTitle = useDebounce(currentTitle, 2000);

  const isSavingRef = useRef(false);

  // Effect to update refs and title state when the note prop changes (e.g., navigating between notes)
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
        console.error(error); // Keep for debugging
        // Do not re-throw error for autosave
        if (!isAutoSave) throw error;
      } finally {
        isSavingRef.current = false;
      }
    },
    [note.id, updateNote],
  );

  // Debounced auto-save for content
  useEffect(() => {
    if (debouncedContent) {
      handleUpdate(true);
    }
  }, [debouncedContent, handleUpdate]);

  // Debounced auto-save for title
  useEffect(() => {
    if (debouncedTitle && debouncedTitle !== note.title) {
      handleUpdate(true);
    }
  }, [debouncedTitle, handleUpdate, note.title]);

  // Save on component unmount
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
    // Autosize textarea
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
    <div className="relative min-h-screen bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/50 dark:from-emerald-950/20 dark:via-background dark:to-teal-950/20">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10">
        <EditorHeader
          onSave={() => handleUpdate(false)}
          wordCount={wordCount}
          lastSaved={lastSaved}
        />

        <div className="flex-1 overflow-auto bg-transparent pb-40 pt-6">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="backdrop-blur-xl bg-white/70 dark:bg-white/5 border border-white/20 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden mb-8">
              {/* Gradient border */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-teal-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />

              <div className="relative z-10 p-8">
                <textarea
                  defaultValue={note.title}
                  onChange={handleTitleChange}
                  placeholder="শিরোনামহীন নোট"
                  className={cn(
                    "w-full resize-none overflow-hidden break-words border-none bg-transparent p-0 text-3xl font-bold text-foreground focus:outline-none focus:ring-0 sm:text-4xl placeholder:text-muted-foreground/50",
                    font.split(" ")[0],
                  )}
                  rows={1}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = "auto";
                    target.style.height = `${target.scrollHeight}px`;
                  }}
                />
              </div>
            </div>

            <div className="backdrop-blur-xl bg-white/70 dark:bg-white/5 border border-white/20 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden">
              {/* Gradient border */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-teal-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />

              <div className="relative z-10 p-8">
                <Editor
                  content={note.content}
                  onChange={handleContentChange}
                  placeholder="লেখা শুরু করুন..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
EditorWrapper.displayName = "EditorWrapper";
