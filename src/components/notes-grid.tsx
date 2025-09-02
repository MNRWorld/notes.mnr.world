"use client";

import { memo } from "react";
import { AnimatePresence } from "framer-motion";
import { Note } from "@/lib/types";
import NoteCard from "@/components/note-card-item";
import { StaggerContainer } from "@/components/page-transition";

interface NotesGridProps {
  notes: Note[];
  onUnlock: (noteId: string, callback: () => void) => void;
  onShare: (note: Note, format: "md" | "json" | "txt" | "pdf") => void;
  onOpenTags: (note: Note) => void;
  onOpenIconPicker: (note: Note) => void;
  onOpenHistory: (note: Note) => void;
  onOpenAttachments?: (note: Note) => void;
  onOpenTasks?: (note: Note) => void;
  onTogglePrivacy?: (note: Note) => void;
}

const NotesGridComponent = ({ notes, ...noteActionProps }: NotesGridProps) => {
  if (notes.length === 0) return null;

  return (
    <StaggerContainer
      className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))] sm:grid-cols-1 sm:gap-3 xl:grid-cols-[repeat(auto-fill,minmax(320px,1fr))] xl:gap-6"
      delay={0.075}
    >
      <AnimatePresence>
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} {...noteActionProps} />
        ))}
      </AnimatePresence>
    </StaggerContainer>
  );
};
NotesGridComponent.displayName = "NotesGridComponent";

const NotesGrid = memo(NotesGridComponent);
export default NotesGrid;
