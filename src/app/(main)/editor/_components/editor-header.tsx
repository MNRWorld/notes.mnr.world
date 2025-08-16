"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Maximize, Loader2, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Note } from "@/lib/types";
import { useNotesStore } from "@/stores/use-notes";
import { useState } from "react";

interface EditorHeaderProps {
  note: Note | null;
}

export function EditorHeader({ note }: EditorHeaderProps) {
  const router = useRouter();
  const [isZenMode, setIsZenMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { updateNote } = useNotesStore();

  const handleSave = async () => {
    if (!note) return;
    setIsSaving(true);
    try {
      // The updateNote in the store is already debounced/handled.
      // This manual save is for user-triggered saves.
      // We can pass the full note content here if needed, but for now we rely on the store's state.
      await updateNote(note.id, { content: note.content });
    } catch (error) {
      // Error is already handled by toast in store
    } finally {
      setIsSaving(false);
    }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.2, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.15 } },
  };

  return (
    <>
      <AnimatePresence>
        {!isZenMode && (
          <motion.div
            variants={headerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex items-center justify-between px-4 py-2"
          >
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/notes")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsZenMode(true)}
              >
                <Maximize className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isZenMode && (
          <motion.div
             variants={headerVariants}
             initial="hidden"
             animate="visible"
             exit="exit"
             className="fixed top-4 right-4 z-50"
          >
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setIsZenMode(false)}
              className="rounded-full shadow-lg"
            >
              <Minimize className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
