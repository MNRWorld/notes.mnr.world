"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Note } from "@/lib/types";
import type { OutputData } from "@editorjs/editorjs";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { getNoteTitle } from "@/lib/storage";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import EditorHeader from "./editor-header";
import { useSettingsStore } from "@/stores/use-settings";
import { useNotes } from "@/stores/use-notes";

const EditorWrapper = dynamic(() => import("./editor-wrapper"), {
  ssr: false,
});

export default function EditorPageClient({ note }: { note: Note }) {
  const [isZenMode, setIsZenMode] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"unsaved" | "saving" | "saved">(
    "saved",
  );
  const [charCount, setCharCount] = useState(note.charCount || 0);
  const font = useSettingsStore((state) => state.font);
  const updateNoteInStore = useNotes((state) => state.updateNote);
  const [fontClass, setFontClass] = useState("");
  const noteRef = useRef(note);

  useEffect(() => {
    noteRef.current = note;
    setCharCount(note.charCount || 0);
  }, [note]);

  useEffect(() => {
    if (font) {
      setFontClass(font.split(" ")[0]);
    }
  }, [font]);

  const handleSave = useCallback(
    async (data: OutputData) => {
      const currentNote = noteRef.current;
      if (!currentNote) return;

      try {
        const title = getNoteTitle(data) || "শিরোনামহীন নোট";
        const totalChars = data.blocks
          .map((block) => block.data.text || "")
          .join(" ")
          .replace(/&nbsp;|<[^>]+>/g, "").length;

        await updateNoteInStore(currentNote.id, {
          title,
          content: data,
          charCount: totalChars,
        });

        setCharCount(totalChars);
      } catch (error) {
        toast.error("নোট সংরক্ষণ করতে ব্যর্থ হয়েছে।");
        console.error("Save error:", error);
      }
    },
    [updateNoteInStore],
  );

  const handleManualSave = useCallback(async () => {
    setSaveStatus("saving");
    toast.success("নোট সফলভাবে সংরক্ষণ করা হয়েছে!");
    setTimeout(() => setSaveStatus("saved"), 1000);
  }, []);

  return (
    <motion.div
      layout
      transition={{ duration: 0.5, type: "spring", bounce: 0.2 }}
      className={cn("flex-1", isZenMode ? "lg:pl-0" : "lg:pl-2")}
    >
      <div
        className={cn(
          "mx-auto h-full max-w-5xl px-4 pt-16 sm:px-6 lg:px-0 lg:py-0 lg:pt-0",
          fontClass,
        )}
      >
        <EditorHeader
          saveStatus={saveStatus}
          onSave={handleManualSave}
          isZenMode={isZenMode}
          setIsZenMode={setIsZenMode}
          charCount={charCount}
        />
        <EditorWrapper
          noteId={note.id}
          initialData={note.content}
          onSave={handleSave}
          isZenMode={isZenMode}
          setIsZenMode={setIsZenMode}
          setCharCount={setCharCount}
          setSaveStatus={setSaveStatus}
        />
      </div>
    </motion.div>
  );
}
