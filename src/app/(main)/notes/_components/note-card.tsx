"use client";

import React, { memo, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { bn } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Note } from "@/lib/types";
import {
  getTextFromEditorJS,
  cn,
  calculateReadingTime,
  isLucideIcon,
  hapticFeedback,
} from "@/lib/utils";
import { useSettingsStore } from "@/stores/use-settings";
import { Lock, Pin, Clock, ListChecks, Archive, Unlock } from "lucide-react";
import * as Lucide from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { NoteActions } from "./note-actions";
import { useNotesStore } from "@/stores/use-notes";
import { toast } from "sonner";

interface NoteCardProps {
  note: Note;
  onUnlock: (noteId: string, callback: () => void) => void;
  onShare: (note: Note, format: "md" | "json" | "txt" | "pdf") => void;
}

const QuickActionButton = ({
  onClick,
  label,
  children,
  delay = 0,
}: {
  onClick: (e: React.MouseEvent) => void;
  label: string;
  children: React.ReactNode;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.5 }}
    transition={{ duration: 0.15, delay }}
  >
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-background/50 backdrop-blur-sm"
            onClick={onClick}
            aria-label={label}
          >
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="capitalize">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </motion.div>
);
QuickActionButton.displayName = "QuickActionButton";

function NoteCardComponent({ note, onUnlock, onShare }: NoteCardProps) {
  const router = useRouter();
  const font = useSettingsStore((state) => state.font);
  const fontClass = font.split(" ")[0];
  const { togglePin, archiveNote, updateNote } = useNotesStore();

  const [isHovering, setIsHovering] = useState(false);

  const formattedDate = useMemo(() => {
    return formatDistanceToNow(new Date(note.updatedAt), {
      addSuffix: true,
      locale: bn,
    });
  }, [note.updatedAt]);

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
      progress: (checkedItems / totalItems) * 100,
    };
  }, [note.isLocked, note.content]);

  const contentPreview = useMemo(() => {
    if (note.isLocked) return "এই নোটটি লক করা আছে।";
    if (!note.content) return "";
    const text = getTextFromEditorJS(note.content);
    return text.substring(0, 100) + (text.length > 100 ? "..." : "");
  }, [note.content, note.isLocked]);

  const handleArchive = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        await archiveNote(note.id);
      } catch {
        toast.error("নোটটি আর্কাইভ করতে সমস্যা হয়েছে।");
      }
    },
    [archiveNote, note.id],
  );

  const handleLock = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onUnlock(note.id, async () => {
        await updateNote(note.id, { isLocked: !note.isLocked });
        hapticFeedback("light");
      });
    },
    [onUnlock, note.id, note.isLocked, updateNote],
  );

  const handlePin = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        await togglePin(note.id);
      } catch (error) {
        toast.error("নোটটি পিন করতে সমস্যা হয়েছে।");
      }
    },
    [togglePin, note.id],
  );

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.15 } },
  };

  const onCardClick = (e: React.MouseEvent) => {
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
    if (isLucideIcon(note.icon)) {
      const Icon = Lucide[
        note.icon as keyof typeof Lucide
      ] as React.ElementType;
      return Icon ? (
        <motion.div whileHover={{ scale: 1.2, rotate: -5 }}>
          <Icon
            className="mr-2 h-5 w-5 text-muted-foreground"
            aria-hidden="true"
          />
        </motion.div>
      ) : null;
    }
    return (
      <motion.div whileHover={{ scale: 1.2, rotate: -5 }}>
        <span className="mr-2 text-xl" aria-hidden="true">
          {note.icon}
        </span>
      </motion.div>
    );
  };
  NoteIcon.displayName = "NoteIcon";

  return (
    <motion.div
      variants={cardVariants}
      layoutId={`note-card-${note.id}`}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileHover={{ y: -5, transition: { duration: 0.2, ease: "easeOut" } }}
      className="relative h-full"
      onHoverStart={() => setIsHovering(true)}
      onHoverEnd={() => setIsHovering(false)}
      onPointerEnter={onCardHover}
    >
      <Card
        onClick={onCardClick}
        className={cn(
          "flex h-full flex-col transition-shadow duration-300 hover:shadow-xl min-h-[160px]",
          note.isPinned
            ? "border-primary/20 shadow-lg shadow-primary/10"
            : "border-border/50",
          note.isLocked ? "bg-muted/50" : "",
          fontClass,
        )}
      >
        <CardHeader className="flex flex-row items-start justify-between gap-4 p-4 pb-2">
          <div className="flex-grow overflow-hidden">
            <div className="flex items-center">
              {note.isPinned && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.2 }}
                  className="mr-2 flex-shrink-0"
                >
                  <Pin className="h-4 w-4 text-primary" aria-label="Pinned" />
                </motion.div>
              )}
              <NoteIcon />
              <CardTitle className="line-clamp-1 text-base font-semibold">
                {note.title || "শিরোনামহীন নোট"}
              </CardTitle>
            </div>
            <div className="mt-1 flex items-center gap-2">
              {note.isLocked && (
                <Lock
                  className="h-3 w-3 flex-shrink-0 text-destructive"
                  aria-label="Locked"
                />
              )}
            </div>
          </div>

          <AnimatePresence>
            {isHovering && !note.isLocked && (
              <div className="absolute bottom-16 right-2 z-10 flex flex-col gap-1">
                <QuickActionButton
                  onClick={handleArchive}
                  label="আর্কাইভ"
                  delay={0}
                >
                  <Archive className="h-4 w-4" />
                </QuickActionButton>
                <QuickActionButton
                  onClick={handleLock}
                  label={note.isLocked ? "আনলক" : "লক"}
                  delay={0.05}
                >
                  {note.isLocked ? (
                    <Unlock className="h-4 w-4" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                </QuickActionButton>
                <QuickActionButton
                  onClick={handlePin}
                  label={note.isPinned ? "আনপিন" : "পিন"}
                  delay={0.1}
                >
                  <motion.div
                    animate={{
                      rotate: note.isPinned ? [0, 20, -10, 0] : 0,
                      scale: note.isPinned ? [1, 1.2, 0.8, 1] : 1,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <Pin
                      className={cn(
                        "h-4 w-4",
                        note.isPinned ? "fill-current text-primary" : "",
                      )}
                    />
                  </motion.div>
                </QuickActionButton>
              </div>
            )}
          </AnimatePresence>
        </CardHeader>

        <div
          className="block h-full flex-grow p-4 pt-0 cursor-pointer"
          aria-label={`View content of note: ${note.title || "শিরোনামহীন নোট"}`}
        >
          <CardContent className="space-y-4 p-0">
            <p className="line-clamp-3 text-sm text-muted-foreground">
              {contentPreview}
            </p>
            {checklistStats && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center text-xs text-muted-foreground">
                  <ListChecks
                    className="mr-2 h-4 w-4 text-primary"
                    aria-hidden="true"
                  />
                  <span>
                    {checklistStats.checked} টি কাজ সম্পন্ন হয়েছে{" "}
                    {checklistStats.total} টির মধ্যে
                  </span>
                </div>
                <Progress
                  value={checklistStats.progress}
                  className="h-1.5"
                  aria-label={`Checklist progress: ${Math.round(
                    checklistStats.progress,
                  )}%`}
                />
              </div>
            )}
            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {note.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </div>

        <CardFooter className="flex items-center justify-between p-4 pt-0 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {readingTime > 0 ? `${readingTime} মিনিট পড়া` : "১ মিনিটের কম"}
            </span>
            <span>{formattedDate}</span>
          </div>
          <NoteActions note={note} onUnlock={onUnlock} onShare={onShare} />
        </CardFooter>
      </Card>
    </motion.div>
  );
}
NoteCardComponent.displayName = "NoteCardComponent";

export const NoteCard = memo(
  NoteCardComponent,
  (prevProps, nextProps) =>
    prevProps.note.id === nextProps.note.id &&
    prevProps.note.title === nextProps.note.title &&
    prevProps.note.updatedAt === nextProps.note.updatedAt &&
    prevProps.note.isPinned === nextProps.note.isPinned &&
    prevProps.note.isLocked === nextProps.note.isLocked &&
    prevProps.note.isArchived === nextProps.note.isArchived &&
    prevProps.note.icon === nextProps.note.icon &&
    JSON.stringify(prevProps.note.content) ===
      JSON.stringify(nextProps.note.content) &&
    JSON.stringify(prevProps.note.tags) === JSON.stringify(nextProps.note.tags),
);
