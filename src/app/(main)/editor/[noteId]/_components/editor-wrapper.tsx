"use client";

import React, { useRef, useEffect, useCallback, memo, useState } from "react";
import EditorJS, { type OutputData, type API } from "@editorjs/editorjs";
import { EDITOR_TOOLS } from "@/lib/editor";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Minimize } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const FloatingMenu = dynamic(() => import("./floating-menu"));

const EDITOR_HOLDER_ID = "editorjs-container";

interface EditorWrapperProps {
  noteId: string;
  initialData: OutputData;
  onSave: (data: OutputData) => Promise<void>;
  isZenMode: boolean;
  setIsZenMode: (isZen: boolean) => void;
  setCharCount: (count: number) => void;
  setSaveStatus: (status: "unsaved" | "saving" | "saved") => void;
}

const EditorWrapper = ({
  noteId,
  initialData,
  onSave,
  isZenMode,
  setIsZenMode,
  setCharCount,
  setSaveStatus,
}: EditorWrapperProps) => {
  const ejInstance = useRef<EditorJS | null>(null);
  const isDirty = useRef(false);
  const [selection, setSelection] = useState<{
    top: number;
    left: number;
    right: number;
  } | null>(null);

  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const editorHolder = document
        .getElementById(EDITOR_HOLDER_ID)
        ?.getBoundingClientRect();

      if (editorHolder) {
        setSelection({
          top: rect.top - editorHolder.top,
          left: rect.left - editorHolder.left,
          right: rect.right - editorHolder.left,
        });
      }
    } else {
      setSelection(null);
    }
  }, []);

  const saveContent = useCallback(async () => {
    if (ejInstance.current && isDirty.current) {
      setSaveStatus("saving");
      try {
        const content = await ejInstance.current.saver.save();
        await onSave(content);
        isDirty.current = false;
        setSaveStatus("saved");
      } catch (error) {
        console.error("Failed to save content", error);
        setSaveStatus("unsaved");
      }
    }
  }, [onSave, setSaveStatus]);

  const initEditor = useCallback(() => {
    if (ejInstance.current) {
      return;
    }

    const editor = new EditorJS({
      holder: EDITOR_HOLDER_ID,
      data: initialData,
      onReady: () => {
        ejInstance.current = editor;
        document.addEventListener("selectionchange", handleSelectionChange);
      },
      onChange: async (api: API) => {
        isDirty.current = true;
        setSaveStatus("unsaved");

        const content = await api.saver.save();
        const text = content.blocks
          .map((block) => block.data.text || "")
          .join(" ");
        setCharCount(text.replace(/&nbsp;|<[^>]+>/g, "").length);
      },
      placeholder: "আসুন একটি অসাধারণ গল্প লিখি!",
      tools: EDITOR_TOOLS,
    });
  }, [initialData, setCharCount, setSaveStatus, handleSelectionChange]);

  useEffect(() => {
    const editorHolder = document.getElementById(EDITOR_HOLDER_ID);
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    editorHolder?.addEventListener("contextmenu", handleContextMenu);

    if (!ejInstance.current) {
      initEditor();
    }
    return () => {
      saveContent();
      editorHolder?.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("selectionchange", handleSelectionChange);

      if (ejInstance.current?.destroy) {
        ejInstance.current.destroy();
        ejInstance.current = null;
      }
    };
  }, [initEditor, saveContent, handleSelectionChange]);

  useEffect(() => {
    const interval = setInterval(() => {
      saveContent();
    }, 30000);

    return () => clearInterval(interval);
  }, [saveContent]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isZenMode) {
        setIsZenMode(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isZenMode, setIsZenMode]);

  return (
    <div
      className={cn(
        "prose prose-stone dark:prose-invert max-w-full lg:py-8 relative",
        isZenMode &&
          "prose-lg fixed inset-0 bg-background z-50 overflow-auto p-4 md:p-8 lg:p-12",
      )}
    >
      <AnimatePresence>
        {isZenMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-4 right-4 z-[60]"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsZenMode(false)}
            >
              <Minimize className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      {selection && ejInstance.current && (
        <FloatingMenu editor={ejInstance.current} position={selection} />
      )}
      <div
        id={EDITOR_HOLDER_ID}
        className={cn(isZenMode && "max-w-3xl mx-auto")}
      />
    </div>
  );
};

export default memo(EditorWrapper);
