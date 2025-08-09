
"use client";

import { memo } from "react";
import { AnimatePresence } from "framer-motion";
import { Note } from "@/lib/types";
import { NoteCard } from "./note-card";

interface NotesGridProps {
  notes: Note[];
  onUnlock: (noteId: string, callback: () => void) => void;
}

function NotesGridComponent({ notes, onUnlock }: NotesGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <AnimatePresence>
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} onUnlock={onUnlock} />
        ))}
      </AnimatePresence>
    </div>
  );
}

export const NotesGrid = memo(NotesGridComponent);

    