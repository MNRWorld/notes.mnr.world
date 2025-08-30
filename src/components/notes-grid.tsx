"use client";

import { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Note } from "@/lib/types";
import NoteCard from "@/components/note-card-item";

interface NotesGridProps {
  notes: Note[];
  onUnlock: (noteId: string, callback: () => void) => void;
  onShare: (note: Note, format: "md" | "json" | "txt" | "pdf") => void;
  onOpenTags: (note: Note) => void;
  onOpenIconPicker: (note: Note) => void;
  onOpenHistory: (note: Note) => void;
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

function NotesGridComponent({ notes, ...noteActionProps }: NotesGridProps) {
  return (
    <motion.div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence>
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} {...noteActionProps} />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
NotesGridComponent.displayName = "NotesGridComponent";

const NotesGrid = memo(NotesGridComponent);
export default NotesGrid;
