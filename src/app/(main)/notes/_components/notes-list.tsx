
"use client";

import { memo, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { bn } from "date-fns/locale";
import { Pin, Lock, Clock, CheckSquare } from "lucide-react";
import * as Lucide from "lucide-react";
import { Note } from "@/lib/types";
import { cn, getTextFromEditorJS, calculateReadingTime, isLucideIcon } from "@/lib/utils";
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
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.2, ease: "easeOut" } },
  exit: { opacity: 0, x: 10, transition: { duration: 0.15 } },
};

function NotesListComponent({ notes, onUnlock }: NotesListProps) {
  const font = useSettingsStore((state) => state.font);
  const fontClass = font.split(" ")[0];

  const ListItem = memo(({ note }: { note: Note }) => {
    const router = useRouter();
    const readingTime = useMemo(() => calculateReadingTime(note), [note]);

    const checklistStats = useMemo(() => {
      if (note.isLocked || !note.content?.blocks) return null;
      const checklistBlocks = note.content.blocks.filter(
        (block) => block.type === "checklist",
      );
      if (checklistBlocks.length === 0) return null;

      let totalItems = 0;
      let checkedItems = 0;
      checklistBlocks.forEach((block) => {
        totalItems += block.data.items.length;
        checkedItems += block.data.items.filter(
          (item: { checked: boolean }) => item.checked,
        ).length;
      });

      if (totalItems === 0) return null;

      return {
        total: totalItems,
        checked: checkedItems,
      };
    }, [note.isLocked, note.content]);

    const cardLink = note.isLocked ? "#" : `/editor?noteId=${note.id}`;
    const onCardClick = note.isLocked
      ? (e: React.MouseEvent) => {
          e.preventDefault();
          onUnlock(note.id, () => {});
        }
      : undefined;

    const onCardHover = () => {
      router.prefetch(cardLink);
    }

    const NoteIcon = () => {
      if (!note.icon) return null;
      if (isLucideIcon(note.icon)) {
        const Icon = Lucide[note.icon as keyof typeof Lucide] as React.ElementType;
        return Icon ? <Icon className="h-4 w-4 mr-2" /> : null;
      }
      return <span className="text-lg mr-2">{note.icon}</span>;
    }

    return (
      <motion.div
        layoutId={`note-card-${note.id}`}
        key={note.id}
        variants={itemVariants}
        exit="exit"
        whileHover={{ x: 2 }}
        transition={{ duration: 0.15 }}
        onHoverStart={onCardHover}
      >
        <Link
          href={cardLink}
          onClick={onCardClick}
          className={cn(
            "block rounded-lg p-4 transition-colors hover:bg-accent",
            note.isPinned ? "bg-primary/5" : "",
            note.isLocked ? "bg-muted/50" : "",
            fontClass,
          )}
        >
          <div className="mb-2 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <NoteIcon />
              <h3 className="line-clamp-1 flex-1 font-semibold text-foreground">
                {note.title || "শিরোনামহীন নোট"}
              </h3>
               {note.isPinned && (
                <Pin className="h-4 w-4 flex-shrink-0 text-primary" />
              )}
              {note.isLocked && (
                <Lock className="h-4 w-4 flex-shrink-0 text-destructive" />
              )}
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
            <div className="flex items-center gap-4 text-xs text-muted-foreground ml-auto">
              {checklistStats && (
                <span className="flex items-center gap-1">
                  <CheckSquare className="h-3 w-3 text-primary" />
                  {checklistStats.checked}/{checklistStats.total}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {readingTime} মিনিট পড়া
              </span>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  });

  ListItem.displayName = "ListItem";

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      <AnimatePresence>
        {notes.map((note) => (
          <ListItem key={note.id} note={note} />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

export const NotesList = memo(NotesListComponent);
