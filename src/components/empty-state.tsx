"use client";

import { motion } from "framer-motion";
import { Plus, FileText } from "lucide-react";
import { Button } from "./button";
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
        duration: 0.5,
        ease: "easeOut",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
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
        delay: 0.2,
      },
    },
  };



  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex min-h-[60vh] flex-col items-center justify-center rounded-2xl p-12 text-center relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5 rounded-2xl" />
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,_theme(colors.emerald.500)_1px,_transparent_0)] bg-[length:24px_24px] opacity-20" />
      </div>

      <motion.div
        className="relative z-10 flex flex-col items-center"
      >
        <motion.div
          variants={iconVariants}
          className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-sm border border-emerald-500/30 shadow-lg mx-auto"
        >
          <FileText className="h-12 w-12 text-emerald-500" />
        </motion.div>

        <motion.h2
          variants={itemVariants}
          className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-3"
        >
          {isSearching ? "কোনো ফলাফল পাওয়া যায়নি" : "আপনার ক্যানভাস প্রস্তুত"}
        </motion.h2>

        <motion.p
          variants={itemVariants}
          className="max-w-md mx-auto text-lg text-muted-foreground leading-relaxed mb-8 text-center"
        >
          {isSearching
            ? "আপনার সার্চের সাথে মেলে এমন কোনো নোট নেই। অন্য কিছু খুঁজে দেখুন।"
            : "আপনার প্রথম নোট তৈরি করুন বা পুরানো নোট ইম্পোর্ট করুন।"}
        </motion.p>

        {!isSearching && (
          <motion.div
            variants={itemVariants}
            className="flex flex-col gap-4 sm:flex-row sm:gap-6 items-center justify-center"
          >
            <motion.div whileTap={{ scale: 0.98 }}>
              <Button
                onClick={onNewNote}
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg border-0 rounded-xl h-14 px-8 text-base"
              >
                <motion.div
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <Plus className="mr-3 h-5 w-5" aria-hidden="true" />
                </motion.div>
                লেখা শুরু করুন
              </Button>
            </motion.div>

            <motion.div whileTap={{ scale: 0.98 }}>
              <Button
                onClick={onImportClick}
                size="lg"
                variant="outline"
                className="backdrop-blur-xl bg-white/5 border-emerald-500/30 hover:border-emerald-500/50 hover:bg-emerald-500/10 rounded-xl h-14 px-8 text-base"
              >
                নোট ইম্পোর্ট
              </Button>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
EmptyStateComponent.displayName = "EmptyStateComponent";

const EmptyState = memo(EmptyStateComponent);
export default EmptyState;
