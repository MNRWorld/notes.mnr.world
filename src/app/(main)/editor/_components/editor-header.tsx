"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Maximize, Loader2 } from "lucide-react";
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
  const [saveStatus, setSaveStatus] = useState<"unsaved" | "saving" | "saved">("saved");
  const { updateNote } = useNotesStore();

  const handleSave = async () => {
    if (!note) return;
    setSaveStatus("saving");
    try {
      await updateNote(note.id, { content: note.content });
      setSaveStatus("saved");
    } catch (error) {
      setSaveStatus("unsaved");
    }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case "saving":
        return "Saving...";
      case "saved":
        return "Saved";
      default:
        return "Unsaved changes";
    }
  };

  return (
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
            <span className="text-sm text-muted-foreground">
              {getSaveStatusText()}
            </span>
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
              disabled={saveStatus === "saving"}
            >
              {saveStatus === "saving" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
