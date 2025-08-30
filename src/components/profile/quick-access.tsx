"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText,
  Archive,
  Trash2,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export default function QuickAccess({
  stats,
}: {
  stats: { archivedNotes: number; trashedNotes: number };
}) {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div
        variants={itemVariants}
        className="mb-4 flex items-center gap-2 sm:mb-6"
      >
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.2 }}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20"
        >
          <Sparkles className="h-4 w-4 text-primary" />
        </motion.div>
        <h2 className="text-xl font-semibold gradient-text-primary">
          দ্রুত অ্যাক্সেস
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <motion.div variants={itemVariants}>
          <Link href="/archive" passHref>
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="group relative flex cursor-pointer items-center justify-between rounded-xl glass-card hover-lift border-border hover:border-primary/40 p-4 transition-all overflow-hidden"
            >
              {/* Background decoration - theme aware */}
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="flex items-center relative z-10">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                  className="mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/20"
                >
                  <Archive className="h-5 w-5 text-primary" />
                </motion.div>
                <div>
                  <p className="font-semibold text-foreground group-hover:gradient-text-primary transition-all duration-300">
                    আর্কাইভ
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                    {stats.archivedNotes} টি নোট
                  </p>
                </div>
              </div>
              <motion.div
                whileHover={{ x: 2, scale: 1.1 }}
                transition={{ duration: 0.2 }}
                className="relative z-10"
              >
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </motion.div>
            </motion.div>
          </Link>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Link href="/trash" passHref>
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="group relative flex cursor-pointer items-center justify-between rounded-xl glass-card hover-lift border-border hover:border-destructive/40 p-4 transition-all overflow-hidden"
            >
              {/* Background decoration - theme aware */}
              <div className="absolute inset-0 bg-destructive/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="flex items-center relative z-10">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                  className="mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-destructive/20"
                >
                  <Trash2 className="h-5 w-5 text-destructive" />
                </motion.div>
                <div>
                  <p className="font-semibold text-foreground group-hover:text-destructive transition-colors">
                    ট্র্যাশ
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive/60" />
                    {stats.trashedNotes} টি নোট
                  </p>
                </div>
              </div>
              <motion.div
                whileHover={{ x: 2, scale: 1.1 }}
                transition={{ duration: 0.2 }}
                className="relative z-10"
              >
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-destructive transition-colors" />
              </motion.div>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
