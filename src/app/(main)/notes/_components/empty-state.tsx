"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
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
        duration: 0.4,
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
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  const iconVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex min-h-[50vh] flex-col items-center justify-center rounded-xl border border-dashed bg-transparent p-8 text-center"
    >
      <motion.div
        variants={iconVariants}
        className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          className="h-8 w-8 text-primary"
          aria-hidden="true"
        >
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <path d="M14 2v6h6" />
          <path d="M10 12h4" />
          <path d="M8 16h8" />
        </svg>
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
            <Plus className="mr-2 h-4 w-4" /> লেখা শুরু করুন
          </Button>
          <Button onClick={onImportClick} size="lg" variant="outline">
            নোট ইম্পোর্ট করুন
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

const EmptyState = memo(EmptyStateComponent);
export default EmptyState;
