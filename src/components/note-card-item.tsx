"use client";

import { memo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import { Icons } from "@/components/ui/icons";

import { Note } from "@/lib/types";
import { cn, getTextFromEditorJS } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useSettingsStore } from "@/stores/use-settings";
import { NoteActions } from "@/components/note-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StaggerItem } from "./page-transition";
import { getCurrentBengaliDate } from "@/lib/bengali-calendar";

interface NoteCardProps {
  note: Note;
  onUnlock: (noteId: string, callback: () => void) => void;
  onShare: (note: Note, format: "md" | "json" | "txt" | "pdf") => void;
  onOpenTags: (note: Note) => void;
  onOpenIconPicker: (note: Note) => void;
  onOpenHistory: (note: Note) => void;
  onOpenAttachments?: (note: Note) => void;
  onOpenTasks?: (note: Note) => void;
  onTogglePrivacy?: (note: Note) => void;
}

function NoteCardComponent({
  note,
  onUnlock,
  onShare,
  onOpenTags,
  onOpenIconPicker,
  onOpenHistory,
  onOpenAttachments,
  onOpenTasks,
  onTogglePrivacy,
}: NoteCardProps) {
  const router = useRouter();
  const font = useSettingsStore((state) => state.font);

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
    <StaggerItem className="h-full">
      <motion.div
        layoutId={`note-card-${note.id}`}
        whileHover={{ y: -5, scale: 1.03 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Card
          className={cn(
            "group h-full flex flex-col bg-card/80 backdrop-blur-xl border-border overflow-hidden transition-all duration-300",
            note.isPinned
              ? "border-primary/30 shadow-lg"
              : "hover:border-primary/40",
            note.isLocked ? "bg-destructive/5 border-destructive/20" : "",
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <Link
            href={cardLink}
            onClick={onCardClick}
            onMouseEnter={onCardHover}
            className={cn(
              "block flex-grow cursor-pointer p-5 pb-0 relative z-10",
              font,
            )}
            aria-label={`নোট খুলুন: ${note.title || "শিরোনামহীন"}`}
          >
            <CardHeader className="p-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center flex-1 min-w-0">
                  {note.isPinned && (
                    <Icons.Pin className="mr-2 h-4 w-4 flex-shrink-0 text-primary" />
                  )}
                  <NoteIcon />
                  <CardTitle className="truncate text-base font-semibold text-foreground transition-colors duration-300 group-hover:text-primary">
                    {note.title || "শিরোনামহীন"}
                  </CardTitle>
                </div>
                {note.isLocked && (
                  <Icons.Lock className="h-4 w-4 flex-shrink-0 text-destructive" />
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0 pt-4">
              <p className="line-clamp-3 text-sm text-muted-foreground leading-relaxed">
                {note.isLocked
                  ? "🔒 নোটটি লক করা আছে।"
                  : getTextFromEditorJS(note.content)}
              </p>
            </CardContent>
          </Link>

          <div className="flex flex-col justify-end flex-grow p-5 pt-3 relative z-10">
            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {note.tags?.slice(0, 2).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 transition-colors"
                  >
                    {tag}
                  </Badge>
                ))}
                {note.tags.length > 2 && (
                  <Badge
                    variant="outline"
                    className="bg-muted/80 backdrop-blur-xl border-border text-muted-foreground"
                  >
                    +{note.tags.length - 2}
                  </Badge>
                )}
              </div>
            )}

            {/* Enhanced Features Indicators */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {note.isAnonymous && (
                <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700 border-purple-200">
                  <Icons.Eye className="h-3 w-3 mr-1" />
                  গোপনীয়
                </Badge>
              )}
              
              {note.attachments && note.attachments.length > 0 && (
                <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                  <Icons.File className="h-3 w-3 mr-1" />
                  {note.attachments.length}
                </Badge>
              )}
              
              {note.tasks && note.tasks.length > 0 && (
                <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-200">
                  <Icons.CheckSquare className="h-3 w-3 mr-1" />
                  {note.tasks.filter(t => t.completed).length}/{note.tasks.length}
                </Badge>
              )}
              
              {note.bengaliDate && (
                <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700 border-orange-200">
                  <Icons.Calendar className="h-3 w-3 mr-1" />
                  {note.bengaliDate.day} {note.bengaliDate.monthName}
                </Badge>
              )}
              
              {note.history && note.history.length > 0 && (
                <Badge variant="outline" className="text-xs bg-gray-100 text-gray-700 border-gray-200">
                  <Icons.History className="h-3 w-3 mr-1" />
                  v{note.history.length + 1}
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary/60" />
                {dayjs(note.updatedAt).format("DD/MM/YYYY")}
              </p>
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
          </div>
        </Card>
      </motion.div>
    </StaggerItem>
  );
}

const NoteCard = memo(NoteCardComponent);
export default NoteCard;
