
"use client";

import { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Note } from "@/lib/types";
import { NoteCard } from "./note-card";

interface NotesGridProps {
  notes: Note[];
  onUnlock: (noteId: string, callback: () => void) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

function NotesGridComponent({ notes, onUnlock }: NotesGridProps) {
  return (
    <motion.div 
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence>
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} onUnlock={onUnlock} />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

export const NotesGrid = memo(NotesGridComponent);
