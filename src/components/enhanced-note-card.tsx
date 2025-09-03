/**
 * Enhanced Note Card Component
 * Showcases new features like Bengali calendar, privacy indicators, attachments
 */

"use client";

import React from "react";
import { Note } from "@/lib/types";
import { Icons } from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PrivacyIndicator } from "@/components/privacy-mode";
import { BengaliCalendarDisplay } from "@/components/bengali-calendar";
import { FileAttachmentManager } from "@/lib/file-attachments";
import { TaskManager } from "@/lib/task-manager";
import { getTextFromEditorJS, calculateReadingTime, cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { NoteActions } from "./note-actions";
import { useRouter } from "next/navigation";

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
  onOpenAttachments: (note: Note) => void;
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
  onOpenAttachments,
  onTogglePrivacy,
}: EnhancedNoteCardProps) {
  const router = useRouter();
  const content = getTextFromEditorJS(note.content);
  const readingTime = calculateReadingTime(note);
  const tasks = TaskManager.extractTasksFromNote(note);
  const taskStats = TaskManager.groupTasksByStatus(tasks);
  const hasAttachments = note.attachments && note.attachments.length > 0;
  const completionPercentage = TaskManager.getCompletionPercentage(tasks);

  const NoteIcon = () => {
    if (!note.icon) return null;
    const IconComponent = (Icons as any)[note.icon];
    return IconComponent ? (
      <IconComponent className="h-4 w-4 text-muted-foreground" />
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
      className={cn("w-full aspect-video", className)}
    >
      <Card
        onClick={handleCardClick}
        className="group relative flex flex-col cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg border-l-4 border-l-transparent hover:border-l-primary h-full"
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <NoteIcon />
                <h3 className="font-semibold text-xl truncate group-hover:text-primary transition-colors">
                  {note.title || "শিরোনামহীন"}
                </h3>
                {note.isPinned && (
                  <Icons.Pin className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                )}
              </div>
            </div>

            <NoteActions
              note={note}
              onUnlock={onUnlock}
              onShare={onShare}
              onOpenTags={onOpenTags}
              onOpenIconPicker={onOpenIconPicker}
              onOpenHistory={onOpenHistory}
              onOpenAttachments={onOpenAttachments}
              onTogglePrivacy={onTogglePrivacy}
            />
          </div>

          <PrivacyIndicator note={note} />

          <div className="flex flex-wrap gap-1 mt-2">
            {note.tags?.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-sm">
                {tag}
              </Badge>
            ))}
            {note.tags && note.tags.length > 3 && (
              <Badge variant="outline" className="text-sm">
                +{note.tags.length - 3}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3 flex-grow overflow-hidden">
          {showPreview && content && (
            <p className="text-base text-muted-foreground line-clamp-3">
              {content.substring(0, 150)}
              {content.length > 150 && "..."}
            </p>
          )}

          {tasks.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Icons.CheckSquare className="h-3 w-3" />
              <span>
                {taskStats.completed.length}/{tasks.length} কাজ সম্পন্ন
              </span>
              <div className="flex-1 bg-muted rounded-full h-1.5">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all"
                  style={{
                    width: `${completionPercentage}%`,
                  }}
                />
              </div>
            </div>
          )}

          {hasAttachments && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icons.File className="h-3 w-3" />
              <span>{note.attachments!.length} ফাইল সংযুক্ত</span>

              <div className="flex gap-1">
                {note.attachments!.slice(0, 3).map((attachment) => {
                  const iconName =
                    FileAttachmentManager.getAttachmentIcon(attachment);
                  const IconComponent = (Icons as any)[iconName];
                  return IconComponent ? (
                    <IconComponent key={attachment.id} className="h-3 w-3" />
                  ) : null;
                })}
                {note.attachments!.length > 3 && (
                  <span className="text-sm">
                    +{note.attachments!.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>

        <CardContent className="space-y-3 pt-0 mt-auto">
          <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t mt-auto">
            <div className="flex items-center gap-4">
              {note.bengaliDate && (
                <BengaliCalendarDisplay
                  bengaliDate={note.bengaliDate}
                  size="sm"
                  showSeason={false}
                />
              )}

              <div className="flex items-center gap-1">
                <Icons.Clock className="h-3 w-3" />
                <span>{readingTime} মিনিট</span>
              </div>

              {note.history && note.history.length > 0 && (
                <div className="flex items-center gap-1">
                  <Icons.History className="h-3 w-3" />
                  <span>v{note.version || note.history.length}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              <span>
                {new Date(note.updatedAt).toLocaleDateString("bn-BD")}
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
  onOpenAttachments: (note: Note) => void;
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
        "grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
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
