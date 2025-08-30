"use client";

import { memo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Pin } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { format } from "date-fns";
import { bn } from "date-fns/locale";

import { Note } from "@/lib/types";
import { cn, getTextFromEditorJS } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useSettingsStore } from "@/stores/use-settings";
import { NoteActions } from "@/components/note-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NoteCardProps {
  note: Note;
  onUnlock: (noteId: string, callback: () => void) => void;
  onShare: (note: Note, format: "md" | "json" | "txt" | "pdf") => void;
  onOpenTags: (note: Note) => void;
  onOpenIconPicker: (note: Note) => void;
  onOpenHistory: (note: Note) => void;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

function NoteCardComponent({
  note,
  onUnlock,
  onShare,
  onOpenTags,
  onOpenIconPicker,
  onOpenHistory,
}: NoteCardProps) {
  const router = useRouter();
  const font = useSettingsStore((state) => state.font);
  const fontClass = font.split(" ")[0];

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
      variants={itemVariants}
      whileHover={{ y: -8, scale: 1.01, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card
        className={cn(
          "group h-full flex flex-col glass-card hover-lift border-border hover:border-primary/40 overflow-hidden transition-all duration-300",
          note.isPinned ? "glass-primary border-primary/30 shadow-lg" : "",
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
            fontClass,
          )}
        >
          <CardHeader className="p-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center flex-1 min-w-0">
                {note.isPinned && (
                  <motion.div
                    whileHover={{ rotate: 15 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Pin className="mr-2 h-4 w-4 flex-shrink-0 text-primary" />
                  </motion.div>
                )}
                <NoteIcon />
                <CardTitle className="line-clamp-2 text-base font-semibold text-foreground group-hover:gradient-text-primary transition-all duration-300 truncate">
                  {note.title || "শিরোনামহীন"}
                </CardTitle>
              </div>
              {note.isLocked && (
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Lock className="h-4 w-4 flex-shrink-0 text-destructive" />
                </motion.div>
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
              {note.tags?.slice(0, 2).map((tag, index) => (
                <motion.div
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 transition-colors"
                  >
                    {tag}
                  </Badge>
                </motion.div>
              ))}
              {note.tags.length > 2 && (
                <Badge
                  variant="outline"
                  className="glass-muted border-border text-muted-foreground"
                >
                  +{note.tags.length - 2}
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary/60" />
              {format(new Date(note.updatedAt), "PP", { locale: bn })}
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <NoteActions
                note={note}
                onUnlock={onUnlock}
                onShare={onShare}
                onOpenTags={onOpenTags}
                onOpenIconPicker={onOpenIconPicker}
                onOpenHistory={onOpenHistory}
              />
            </motion.div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

const NoteCard = memo(NoteCardComponent);
export default NoteCard;
