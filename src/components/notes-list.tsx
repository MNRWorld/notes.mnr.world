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

    const onCardClick = (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('button, [role="menu"]')) {
        e.preventDefault();
        return;
      }
      if (note.isLocked) {
        e.preventDefault();
        onUnlock(note.id, () => {
          router.push(`/editor?noteId=${note.id}`);
        });
      } else {
        router.push(`/editor?noteId=${note.id}`);
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
          whileHover={{ x: 2, transition: { duration: 0.2 } }}
          className={cn(
            "group relative flex cursor-pointer flex-col rounded-xl bg-card/80 backdrop-blur-xl border border-border/50 hover:border-primary/40 transition-all duration-300 hover:shadow-md overflow-hidden",
            note.isPinned ? "bg-primary/5 border-primary/30" : "",
          )}
          onClick={onCardClick}
          onMouseEnter={onCardHover}
        >
          <div className="flex flex-col p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {note.isPinned && (
                  <Icons.Pin className="h-4 w-4 flex-shrink-0 text-primary" />
                )}
                <NoteIcon />
                <h3 className="line-clamp-1 flex-1 font-semibold text-foreground">
                  {note.title || "শিরোনামহীন"}
                </h3>
              </div>
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

            <p className="line-clamp-2 text-sm text-muted-foreground">
              {note.isLocked
                ? "নোটটি লক করা আছে।"
                : getTextFromEditorJS(note.content).substring(0, 150) || "কোনো কনটেন্ট নেই..."}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              {note.tags?.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
              <div className="flex items-center gap-2">
                <Icons.Circle className="h-2 w-2" />
                <span>{dayjs(note.updatedAt).format("DD/MM/YYYY")}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </StaggerItem>
    );
  },
);

ListItem.displayName = "ListItem";

function NotesListComponent({ notes, ...noteActionProps }: NotesListProps) {
  return (
    <StaggerContainer className="space-y-3" delay={0.075}>
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
