"use client";

import React from "react";
import { Note } from "@/lib/types";
import { Icons } from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PrivacyIndicator } from "@/components/privacy-mode";
import { BengaliCalendarDisplay } from "@/components/bengali-calendar";
import { TaskManager } from "@/lib/task-manager";
import { getTextFromEditorJS, calculateReadingTime, cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { NoteActions } from "./note-actions";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "@/hooks/use-media-query";

interface EnhancedNoteCardProps {
  note: Note;
  index?: number;
  className?: string;
  showPreview?: boolean;
  onUnlock: (noteId: string, callback: () => void) => void;
  onShare: (note: Note, format: "md" | "json" | "txt" | "pdf") => void;
  onOpenTags: (note: Note) => void;
  onOpenIconPicker: (note: Note) => void;
  onOpenHistory: (note: Note) => void;
  onTogglePrivacy: (note: Note) => void;
}

export const EnhancedNoteCard = React.memo(function EnhancedNoteCard({
  note,
  index = 0,
  className,
  showPreview = true,
  onUnlock,
  onShare,
  onOpenTags,
  onOpenIconPicker,
  onOpenHistory,
  onTogglePrivacy,
}: EnhancedNoteCardProps) {
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const content = getTextFromEditorJS(note.content);
  const readingTime = calculateReadingTime(note);
  const tasks = note.tasks || [];
  const taskStats = TaskManager.groupTasksByStatus(tasks);
  const completionPercentage = TaskManager.getCompletionPercentage(tasks);

  const NoteIcon = () => {
    if (!note.icon) return null;
    // Typed lookup to avoid `any` and satisfy ESLint/TS rules.
    const IconMap = Icons as unknown as Record<
      string,
      React.ComponentType<React.SVGProps<SVGSVGElement>>
    >;
    const iconKey = note.icon as string;
    // Detect emoji (Extended Pictographic) and render as text so device-native emoji can be used.
    const isEmoji =
      typeof iconKey === "string" && /\p{Extended_Pictographic}/u.test(iconKey);

    if (isEmoji) {
      return (
        <span className="inline-flex items-center text-base sm:text-lg mr-1 leading-none">
          <span aria-hidden className="align-middle text-[1em]">
            {iconKey}
          </span>
        </span>
      );
    }

    const IconComponent = IconMap[iconKey];
    return IconComponent ? (
      // Use em-based sizing so the icon matches the surrounding text size
      <span className="inline-flex items-center text-base sm:text-lg mr-1">
        <IconComponent className="h-[1em] w-[1em] text-muted-foreground" />
      </span>
    ) : null;
  };

  const handleCardClick = (e: React.MouseEvent) => {
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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          duration: 0.3,
          delay: index * 0.05,
          ease: [0.25, 1, 0.5, 1],
        },
      }}
      whileHover={{ y: -2, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "w-full min-w-[220px] lg:min-w-[260px] xl:min-w-[300px] flex-shrink-0",
        className,
      )}
    >
      <Card
        onClick={handleCardClick}
        className="group relative flex flex-col flex-shrink-0 cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg border-l-4 border-l-transparent hover:border-l-primary h-full min-h-[220px] sm:min-h-[240px] max-h-[280px]"
      >
        <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-4 px-3 sm:px-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 sm:gap-2">
                <NoteIcon />
                <h3 className="font-semibold text-sm sm:text-base md:text-lg truncate group-hover:text-primary transition-colors">
                  {note.title || "শিরোনামহীন"}
                </h3>
                {note.isPinned && (
                  // Make pin icon sit inline with text size
                  <Icons.Pin className="h-[1em] w-[1em] text-yellow-500 flex-shrink-0" />
                )}
              </div>
            </div>

            <div className="flex-shrink-0">
              <NoteActions
                note={note}
                onUnlock={onUnlock}
                onShare={onShare}
                onOpenTags={onOpenTags}
                onOpenIconPicker={onOpenIconPicker}
                onOpenHistory={onOpenHistory}
                onTogglePrivacy={onTogglePrivacy}
              />
            </div>
          </div>

          <div className="mt-1 sm:mt-2">
            <PrivacyIndicator note={note} />
          </div>

          <div className="flex flex-wrap gap-1 mt-1 sm:mt-2">
            {note.tags?.slice(0, 2).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs px-1.5 py-0.5"
              >
                {tag.length > 8 ? `${tag.substring(0, 8)}...` : tag}
              </Badge>
            ))}
            {note.tags && note.tags.length > 2 && (
              <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                +{note.tags.length - 2}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-1 sm:space-y-2 flex-grow overflow-hidden px-3 sm:px-4 py-0">
          {showPreview && content && (
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {content.substring(0, 100)}
              {content.length > 100 && "..."}
            </p>
          )}

          {tasks.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Icons.CheckSquare className="h-3 w-3" />
                <span>
                  {taskStats.completed.length}/{tasks.length} কাজ সম্পন্ন
                </span>
              </div>
              <div className="flex-1 bg-muted rounded-full h-1">
                <div
                  className="bg-primary h-1 rounded-full transition-all"
                  style={{
                    width: `${completionPercentage}%`,
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>

        <CardContent className="pt-0 mt-auto px-3 sm:px-4 pb-2 sm:pb-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 sm:pt-2 border-t">
            <div className="flex items-center gap-2 flex-wrap">
              {note.bengaliDate && (
                <div className="flex-shrink-0">
                  <BengaliCalendarDisplay
                    bengaliDate={note.bengaliDate}
                    size="sm"
                    showSeason={false}
                  />
                </div>
              )}

              <div className="flex items-center gap-1 flex-shrink-0">
                <Icons.Clock className="h-3 w-3" />
                <span>{readingTime}মি</span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-right flex-shrink-0">
              <span className="truncate max-w-[70px] sm:max-w-none">
                {new Date(note.updatedAt).toLocaleDateString("bn-BD", {
                  day: "2-digit",
                  month: "2-digit",
                  year: isMobile ? "2-digit" : "numeric",
                })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

interface EnhancedNotesGridProps {
  notes: Note[];
  className?: string;
  onUnlock: (noteId: string, callback: () => void) => void;
  onShare: (note: Note, format: "md" | "json" | "txt" | "pdf") => void;
  onOpenTags: (note: Note) => void;
  onOpenIconPicker: (note: Note) => void;
  onOpenHistory: (note: Note) => void;
  onTogglePrivacy: (note: Note) => void;
}

export function EnhancedNotesGrid({
  notes,
  className,
  ...actionProps
}: EnhancedNotesGridProps) {
  return (
    <div
      className={cn(
        "grid gap-2 sm:gap-3 md:gap-4",
        "grid-cols-1", // Always 1 column on mobile
        "sm:grid-cols-2", // 2 columns on small tablets
        "lg:grid-cols-3", // 3 columns on large screens
        "xl:grid-cols-4", // 4 columns on extra large screens
        "2xl:grid-cols-5", // 5 columns on 2xl screens
        className,
      )}
    >
      {notes.map((note, index) => (
        <EnhancedNoteCard
          key={note.id}
          note={note}
          index={index}
          {...actionProps}
        />
      ))}
    </div>
  );
}
