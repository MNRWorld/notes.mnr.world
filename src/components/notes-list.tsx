"use client";

import { memo, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import { Icons } from "@/components/ui/icons";

import { Note } from "@/lib/types";
import { cn, getTextFromEditorJS, calculateReadingTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useSettingsStore } from "@/stores/use-settings";
import { NoteActions } from "@/components/note-actions";
import { StaggerContainer, StaggerItem } from "./page-transition";

interface NotesListProps {
  notes: Note[];
  onUnlock: (noteId: string, callback: () => void) => void;
  onShare: (note: Note, format: "md" | "json" | "txt" | "pdf") => void;
  onOpenTags: (note: Note) => void;
  onOpenIconPicker: (note: Note) => void;
  onOpenHistory: (note: Note) => void;
  onOpenAttachments: (note: Note) => void;
  onOpenTasks: (note: Note) => void;
  onTogglePrivacy: (note: Note) => void;
}

const ListItem = memo(
  ({
    note,
    onUnlock,
    onShare,
    onOpenTags,
    onOpenIconPicker,
    onOpenHistory,
    onOpenAttachments,
    onOpenTasks,
    onTogglePrivacy,
  }: { note: Note } & Omit<NotesListProps, "notes">) => {
    const router = useRouter();
    const font = useSettingsStore((state) => state.font);

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
      const IconComponent = (Icons as any)[note.icon];
      return IconComponent ? <IconComponent className="mr-2 h-4 w-4" /> : null;
    };
    NoteIcon.displayName = "NoteIcon";

    return (
      <StaggerItem>
        <motion.div
          layoutId={`note-card-${note.id}`}
          whileHover={{ x: 4, scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className={cn(
            "group relative flex min-h-[220px] items-stretch rounded-lg bg-card/80 backdrop-blur-xl border-border hover:border-primary/40 transition-all duration-300 hover:shadow-md overflow-hidden",
            note.isPinned ? "bg-primary/5 border-primary/30 shadow-sm" : "",
            note.isLocked ? "bg-destructive/5 border-destructive/20" : "",
          )}
        >
          <Link
            href={cardLink}
            onClick={onCardClick}
            onMouseEnter={onCardHover}
            className={cn(
              "flex-grow block p-3 sm:p-4 transition-colors cursor-pointer",
              font,
            )}
          >
            <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                {note.isPinned && (
                  <Icons.Pin className="h-4 w-4 flex-shrink-0 text-primary" />
                )}
                <NoteIcon />
                <h3 className="line-clamp-1 flex-1 font-semibold text-foreground">
                  {note.title || "শিরোনামহীন"}
                </h3>
                {note.isLocked && (
                  <Icons.Lock className="h-4 w-4 flex-shrink-0 text-destructive" />
                )}
              </div>
              <p className="flex-shrink-0 text-xs text-muted-foreground">
                {dayjs(note.updatedAt).format("DD/MM/YYYY")}
              </p>
            </div>
            <p className="my-2 line-clamp-2 text-sm text-muted-foreground sm:my-3">
              {note.isLocked
                ? "নোটটি লক করা আছে।"
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
                    <Icons.ListCheck className="h-3 w-3 text-primary" />
                    {checklistStats.checked}/{checklistStats.total}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Icons.Clock className="h-3 w-3" />
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
              onOpenAttachments={onOpenAttachments}
              onOpenTasks={onOpenTasks}
              onTogglePrivacy={onTogglePrivacy}
            />
          </div>
        </motion.div>
      </StaggerItem>
    );
  },
);

ListItem.displayName = "ListItem";

function NotesListComponent({ notes, ...noteActionProps }: NotesListProps) {
  return (
    <StaggerContainer className="space-y-2 sm:space-y-3" delay={0.075}>
      <AnimatePresence>
        {notes.map((note) => (
          <ListItem key={note.id} note={note} {...noteActionProps} />
        ))}
      </AnimatePresence>
    </StaggerContainer>
  );
}

const NotesList = memo(NotesListComponent);
export default NotesList;
