"use client";

import { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Note } from "@/lib/types";
import dynamic from "next/dynamic";

const NoteCard = dynamic(() => import("./note-card"), {
  ssr: false,
});

interface NotesGridProps {
  notes: Note[];
  onUnlock: (noteId: string, callback: () => void) => void;
  onShare: (note: Note, format: "md" | "json" | "txt" | "pdf") => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

function NotesGridComponent({ notes, onUnlock, onShare }: NotesGridProps) {
  return (
    <motion.div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence>
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onUnlock={onUnlock}
            onShare={onShare}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
NotesGridComponent.displayName = "NotesGridComponent";

const NotesGrid = memo(NotesGridComponent);
export default NotesGrid;
