"use client";

import { motion } from "framer-motion";
import { Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { memo } from "react";

function EmptyStateComponent({
  onNewNote,
  onImportClick,
  isSearching,
}: {
  onNewNote: () => void;
  onImportClick: () => void;
  isSearching: boolean;
}) {
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.25, ease: "easeOut" },
    },
  };

  const iconVariants = {
    hidden: { scale: 0.8, opacity: 0, rotate: -15 },
    visible: {
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.1,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex min-h-[50vh] flex-col items-center justify-center rounded-xl bg-transparent p-8 text-center"
    >
      <motion.div
        variants={iconVariants}
        className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
      >
        <FileText className="h-8 w-8 text-primary" />
      </motion.div>
      <motion.h2
        variants={itemVariants}
        className="text-2xl font-semibold tracking-tight text-foreground"
      >
        {isSearching ? "কোনও ফলাফল পাওয়া যায়নি" : "আপনার ক্যানভাস অপেক্ষা করছে"}
      </motion.h2>
      <motion.p
        variants={itemVariants}
        className="mt-2 max-w-sm text-muted-foreground"
      >
        {isSearching
          ? "আপনার সার্চ কোয়েরির সাথে মেলে এমন কোনো নোট পাওয়া যায়নি।"
          : "আপনার প্রথম নোট তৈরি করে লেখা শুরু করুন অথবা আপনার আগের নোটগুলো ইম্পোর্ট করুন।"}
      </motion.p>
      {!isSearching && (
        <motion.div
          variants={itemVariants}
          className="mt-6 flex flex-col gap-4 sm:flex-row"
        >
          <Button onClick={onNewNote} size="lg">
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" /> লেখা শুরু করুন
          </Button>
          <Button onClick={onImportClick} size="lg" variant="outline">
            নোট ইম্পোর্ট করুন
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
EmptyStateComponent.displayName = "EmptyStateComponent";

const EmptyState = memo(EmptyStateComponent);
export default EmptyState;
