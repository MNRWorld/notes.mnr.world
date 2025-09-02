"use client";

import { useRouter } from "next/navigation";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/bn";
dayjs.extend(relativeTime);
dayjs.locale("bn");

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
  const [lastSavedText, setLastSavedText] = useState("");

  useEffect(() => {
    if (lastSaved) {
      setLastSavedText(`শেষ সেভ: ${dayjs(lastSaved).fromNow()}`);
    }
  }, [lastSaved]);

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

  return (
    <div className="absolute top-0 left-0 right-0 z-20 lg:relative">
      <AnimatePresence>
        {!isZenMode && (
          <motion.div
            variants={headerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex items-center justify-between p-2 sm:p-4 bg-background lg:bg-transparent"
          >
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/")}
                aria-label="নোটস এ ফিরে যান"
              >
                <Icons.ArrowLeft className="h-5 w-5" />
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
                aria-label="জেন মোড"
              >
                <Icons.Expand className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSave}
                disabled={isSaving}
                aria-label="নোট সংরক্ষণ করুন"
              >
                {isSaving ? (
                  <Icons.Loader className="h-5 w-5 animate-spin" />
                ) : (
                  <Icons.DeviceFloppy className="h-5 w-5" />
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
              aria-label="জেন মোড থেকে বের হন"
            >
              <Icons.Minimize className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
EditorHeader.displayName = "EditorHeader";
