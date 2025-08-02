"use client";

import { memo, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { bn } from "date-fns/locale";
import { Pin, Lock, Clock } from "lucide-react";
import { Note } from "@/lib/types";
import { cn, getTextFromEditorJS, calculateReadingTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useSettingsStore } from "@/stores/use-settings";

interface NotesListProps {
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

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

function NotesListComponent({ notes, onUnlock }: NotesListProps) {
  const font = useSettingsStore((state) => state.font);
  const fontClass = font.split(" ")[0];

  const ListItem = memo(({ note }: { note: Note }) => {
    const readingTime = useMemo(() => calculateReadingTime(note), [note]);

    const cardLink = note.isLocked ? "#" : `/editor/${note.id}`;
    const onCardClick = note.isLocked
      ? (e: React.MouseEvent) => {
          e.preventDefault();
          onUnlock(note.id, () => {});
        }
      : undefined;

    return (
      <motion.div
        layout
        key={note.id}
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        whileHover={{ x: 5 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
      >
        <Link
          href={cardLink}
          onClick={onCardClick}
          className={cn(
            "block rounded-lg p-4 transition-colors hover:bg-accent",
            note.isPinned ? "border-primary/30 bg-primary/5 border" : "border",
            note.isLocked ? "bg-muted/50" : "",
            fontClass,
          )}
        >
          <div className="mb-2 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              {note.isPinned && (
                <Pin className="h-4 w-4 flex-shrink-0 text-primary" />
              )}
              {note.isLocked && (
                <Lock className="h-4 w-4 flex-shrink-0 text-destructive" />
              )}
              <h3 className="line-clamp-1 flex-1 font-semibold text-foreground">
                {note.title || "শিরোনামহীন নোট"}
              </h3>
            </div>
            <p className="flex-shrink-0 text-xs text-muted-foreground">
              {format(new Date(note.updatedAt), "PP", { locale: bn })}
            </p>
          </div>
          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
            {note.isLocked
              ? "এই নোটটি লক করা আছে।"
              : `${getTextFromEditorJS(note.content).substring(0, 150)}...`}
          </p>
          <div className="flex flex-wrap items-center justify-between gap-2">
            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {note.tags.slice(0, 5).map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            <span className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
              <Clock className="h-3 w-3" />
              {readingTime} মিনিট পড়া
            </span>
          </div>
        </Link>
      </motion.div>
    );
  });
  
  ListItem.displayName = 'ListItem';


  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      {notes.map((note) => (
        <ListItem key={note.id} note={note} />
      ))}
    </motion.div>
  );
}

export const NotesList = memo(NotesListComponent);
