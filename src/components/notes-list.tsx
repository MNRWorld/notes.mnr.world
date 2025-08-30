"use client";

import { memo, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { bn } from "date-fns/locale";
import { Lock, Clock, List, Pin } from "lucide-react";
import * as LucideIcons from "lucide-react";

import { Note } from "@/lib/types";
import { cn, getTextFromEditorJS, calculateReadingTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useSettingsStore } from "@/stores/use-settings";
import { NoteActions } from "@/components/note-actions";

interface NotesListProps {
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
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20, scale: 0.98 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
};

function NotesListComponent({
  notes,
  onUnlock,
  onShare,
  onOpenTags,
  onOpenIconPicker,
  onOpenHistory,
}: NotesListProps) {
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
    const onCardClick = (e: React.MouseEvent) => {
      if (note.isLocked) {
        e.preventDefault();
        onUnlock(note.id, () => {
          router.push(`/editor?noteId=${note.id}`);
        });
      } else {
        router.push(cardLink);
      }
    };

    const onCardHover = useCallback(() => {
      if (!note.isLocked) {
        router.prefetch(`/editor?noteId=${note.id}`);
      }
    }, [note.id, note.isLocked, router]);

    const NoteIcon = () => {
      if (!note.icon) return null;
      const IconComponent = (LucideIcons as any)[note.icon];
      return IconComponent ? <IconComponent className="mr-2 h-4 w-4" /> : null;
    };
    NoteIcon.displayName = "NoteIcon";

    return (
      <motion.div
        layoutId={`note-card-${note.id}`}
        key={note.id}
        variants={itemVariants}
        exit="exit"
        whileHover={{
          x: 4,
          scale: 1.01,
          transition: { duration: 0.2 },
        }}
        className="group relative"
      >
        {/* Background decoration - theme aware */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />

        <div
          className={cn(
            "flex items-stretch rounded-lg glass-card hover-lift border-border hover:border-primary/40 transition-all duration-300 overflow-hidden",
            note.isPinned ? "glass-primary border-primary/30 shadow-lg" : "",
            note.isLocked ? "bg-destructive/5 border-destructive/20" : "",
          )}
        >
          <Link
            href={cardLink}
            onClick={onCardClick}
            onMouseEnter={onCardHover}
            className={cn(
              "flex-grow block p-3 sm:p-4 transition-colors cursor-pointer",
              fontClass,
            )}
          >
            <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                {note.isPinned && (
                  <Pin className="h-4 w-4 flex-shrink-0 text-primary" />
                )}
                <NoteIcon />
                <h3 className="line-clamp-1 flex-1 font-semibold text-foreground">
                  {note.title || "শিরোনামহীন নোট"}
                </h3>
                {note.isLocked && (
                  <Lock className="h-4 w-4 flex-shrink-0 text-destructive" />
                )}
              </div>
              <p className="flex-shrink-0 text-xs text-muted-foreground">
                {format(new Date(note.updatedAt), "PP", { locale: bn })}
              </p>
            </div>
            <p className="my-2 line-clamp-2 text-sm text-muted-foreground sm:my-3">
              {note.isLocked
                ? "এই নোটটি লক করা আছে।"
                : `${getTextFromEditorJS(note.content).substring(0, 150)}...`}
            </p>
            <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-4">
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
                    <List className="h-3 w-3 text-primary" />
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
          <div className="flex flex-col justify-center pr-2 flex-shrink-0">
            <NoteActions
              note={note}
              onUnlock={onUnlock}
              onShare={onShare}
              onOpenTags={onOpenTags}
              onOpenIconPicker={onOpenIconPicker}
              onOpenHistory={onOpenHistory}
            />
          </div>
        </div>
      </motion.div>
    );
  });

  ListItem.displayName = "ListItem";

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-2 sm:space-y-3"
    >
      <AnimatePresence>
        {notes.map((note) => (
          <ListItem key={note.id} note={note} />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

const NotesList = memo(NotesListComponent);
export default NotesList;
