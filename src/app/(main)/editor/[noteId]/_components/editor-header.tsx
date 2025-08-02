"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Maximize, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

type SaveStatus = "unsaved" | "saving" | "saved";

interface EditorHeaderProps {
  saveStatus: SaveStatus;
  onSave: () => void;
  isZenMode: boolean;
  setIsZenMode: (isZen: boolean) => void;
  charCount: number;
}

export default function EditorHeader({
  saveStatus,
  onSave,
  isZenMode,
  setIsZenMode,
  charCount,
}: EditorHeaderProps) {
  const router = useRouter();

  const headerVariants = {
    hidden: { opacity: 0, y: -40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    exit: { opacity: 0, y: -40, transition: { duration: 0.2 } },
  };

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case "saving":
        return "সংরক্ষণ করা হচ্ছে...";
      case "saved":
        return "সংরক্ষিত";
      default:
        return "পরিবর্তনগুলি সংরক্ষিত হয়নি";
    }
  };

  return (
    <AnimatePresence>
      {!isZenMode && (
        <motion.header
          variants={headerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed top-0 left-0 right-0 z-10 flex h-auto flex-col gap-2 border-b bg-background px-4 py-2 lg:relative lg:h-auto lg:border-none lg:bg-transparent lg:px-0 lg:py-0"
        >
          <div className="flex w-full flex-wrap items-center justify-between gap-2">
            <motion.div whileHover={{ x: -4 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                onClick={() => router.push("/notes")}
                className="hidden lg:inline-flex"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                নোটে ফিরে যান
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/notes")}
                className="lg:hidden"
                aria-label="Back to notes"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </motion.div>
            <div className="flex flex-shrink-0 items-center gap-2">
              <motion.p 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                key={charCount}
                className="hidden text-sm text-muted-foreground sm:block"
              >
                {charCount} অক্ষর
              </motion.p>
              <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
                {saveStatus === "saving" && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                <AnimatePresence mode="out-in">
                  <motion.span
                    key={saveStatus}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                     {getSaveStatusText()}
                  </motion.span>
                </AnimatePresence>
              </div>
              <Button
                variant="outline"
                onClick={onSave}
                size="icon"
                aria-label="Save Note"
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsZenMode(true)}
                aria-label="Enter Zen Mode"
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.header>
      )}
    </AnimatePresence>
  );
}
