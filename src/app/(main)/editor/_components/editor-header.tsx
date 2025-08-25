"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Maximize, Loader2, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { bn } from "date-fns/locale";

interface EditorHeaderProps {
  onSave: () => Promise<void>;
  wordCount: number;
  lastSaved: number;
}

export function EditorHeader({
  onSave,
  wordCount,
  lastSaved,
}: EditorHeaderProps) {
  const router = useRouter();
  const [isZenMode, setIsZenMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave();
    } catch (error) {
      // Error toast is handled in the wrapper
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

  const lastSavedText = lastSaved
    ? `শেষ সেভ: ${formatDistanceToNow(lastSaved, { addSuffix: true, locale: bn })}`
    : "";

  return (
    <>
      <AnimatePresence>
        {!isZenMode && (
          <motion.div
            variants={headerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex items-center justify-between p-2 sm:p-4"
          >
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/notes")}
                aria-label="Back to notes"
              >
                <ArrowLeft className="h-5 w-5 sm:h-4 sm:w-4" />
              </Button>
              <div className="text-xs sm:text-sm text-muted-foreground">
                <p>{wordCount} শব্দ</p>
                {lastSavedText && (
                  <p className="hidden sm:block">{lastSavedText}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsZenMode(true)}
                aria-label="Enter Zen Mode"
              >
                <Maximize className="h-5 w-5 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSave}
                disabled={isSaving}
                aria-label="Save note"
              >
                {isSaving ? (
                  <Loader2 className="h-5 w-5 sm:h-4 sm:w-4 animate-spin" />
                ) : (
                  <Save className="h-5 w-5 sm:h-4 sm:w-4" />
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
            className="fixed top-4 right-4 z-[9999]"
          >
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setIsZenMode(false)}
              className="rounded-full shadow-lg"
              aria-label="Exit Zen Mode"
            >
              <Minimize className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
EditorHeader.displayName = "EditorHeader";
