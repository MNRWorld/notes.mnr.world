"use client";

import React, { memo, useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Note } from "@/lib/types";
import { getTextFromEditorJS, cn, calculateReadingTime } from "@/lib/utils";
import { useSettingsStore } from "@/stores/use-settings";
import { useNotes } from "@/stores/use-notes";
import {
  MoreVertical,
  Edit,
  Trash2,
  Pin,
  PinOff,
  Tag,
  X,
  Lock,
  Unlock,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";

const ManageTagsDialog = dynamic(() => import('./manage-tags-dialog'), { ssr: false });

interface NoteCardProps {
  note: Note;
  onUnlock: (noteId: string, callback: () => void) => void;
}

function NoteCardComponent({ note, onUnlock }: NoteCardProps) {
  const font = useSettingsStore((state) => state.font);
  const { trashNote, updateNote, togglePin, notes } = useNotes();
  const fontClass = font.split(" ")[0];

  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const [newTitle, setNewTitle] = useState(note.title);
  const [formattedDate, setFormattedDate] = useState("");

  const readingTime = useMemo(() => calculateReadingTime(note), [note]);

  useEffect(() => {
    if (note.updatedAt) {
      setFormattedDate(
        formatDistanceToNow(new Date(note.updatedAt), {
          addSuffix: true,
          locale: bn,
        }),
      );
    }
  }, [note.updatedAt]);

  const contentPreview = useMemo(() => {
    if (note.isLocked) return "এই নোটটি লক করা আছে।";
    const text = getTextFromEditorJS(note.content);
    return text.substring(0, 100) + (text.length > 100 ? "..." : "");
  }, [note.content, note.isLocked]);

  const handleTrash = useCallback(() => {
    trashNote(note.id);
    toast.success("নোটটি ট্র্যাশে পাঠানো হয়েছে।");
  }, [note.id, trashNote]);

  const handleTogglePin = useCallback(() => {
    const pinnedNotesCount = notes.filter((n) => n.isPinned).length;
    if (!note.isPinned && pinnedNotesCount >= 3) {
      toast.error("আপনি সর্বোচ্চ ৩টি নোট পিন করতে পারবেন।");
      return;
    }
    togglePin(note.id);
    toast.success(
      note.isPinned ? "নোটটি আনপিন করা হয়েছে।" : "নোটটি পিন করা হয়েছে।",
    );
  }, [note.id, note.isPinned, togglePin, notes]);

  const handleToggleLock = useCallback(() => {
    onUnlock(note.id, () => {
      updateNote(note.id, { isLocked: !note.isLocked });
      toast.success(
        note.isLocked ? "নোটটি আনলক করা হয়েছে।" : "নোটটি লক করা হয়েছে।",
      );
    });
  }, [note.id, note.isLocked, onUnlock, updateNote]);

  const handleRename = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error("শিরোনাম খালি রাখা যাবে না।");
      return;
    }
    await updateNote(note.id, { title: newTitle });
    setIsRenameOpen(false);
    toast.success("নোট রিনেম করা হয়েছে।");
  }, [newTitle, note.id, updateNote]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.95 },
  };

  const cardLink = note.isLocked ? "#" : `/editor/${note.id}`;
  const onCardClick = note.isLocked
    ? (e: React.MouseEvent) => {
        e.preventDefault();
        onUnlock(note.id, () => {
        });
      }
    : undefined;

  return (
    <>
      <motion.div
        layout
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        whileHover={{ scale: 1.03, y: -5 }}
        whileTap={{ scale: 0.98 }}
        className="h-full"
      >
        <Card
          className={cn(
            "flex h-full flex-col border-2 transition-all duration-300 ease-in-out hover:shadow-2xl",
            note.isPinned
              ? "border-primary/50 shadow-primary/20"
              : "border-transparent",
            note.isLocked ? "bg-muted/50" : "",
            fontClass,
          )}
        >
          <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
            <div className="flex-grow overflow-hidden">
              <div className="flex items-center gap-2">
                {note.isPinned && (
                   <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
                     <Pin className="h-4 w-4 flex-shrink-0 text-primary" />
                   </motion.div>
                )}
                {note.isLocked && (
                  <Lock className="h-4 w-4 flex-shrink-0 text-destructive" />
                )}
                <CardTitle className="line-clamp-1 text-xl font-semibold">
                  <Link href={cardLink} className="hover:underline" onClick={onCardClick}>
                    {note.title || "শিরোনামহীন নোট"}
                  </Link>
                </CardTitle>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenuItem onSelect={handleTogglePin}>
                  {note.isPinned ? (
                    <>
                      <PinOff className="mr-2 h-4 w-4" />
                      <span>আনপিন করুন</span>
                    </>
                  ) : (
                    <>
                      <Pin className="mr-2 h-4 w-4" />
                      <span>পিন করুন</span>
                    </>
                  )}
                </DropdownMenuItem>

                <DropdownMenuItem onSelect={handleToggleLock}>
                  {note.isLocked ? (
                    <>
                      <Unlock className="mr-2 h-4 w-4" />
                      <span>আনলক করুন</span>
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      <span>লক করুন</span>
                    </>
                  )}
                </DropdownMenuItem>

                <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
                  <DialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      disabled={note.isLocked}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      <span>রিনেম করুন</span>
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>নোট রিনেম করুন</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleRename}>
                      <div className="grid gap-4 py-4">
                        <Input
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          placeholder="নতুন শিরোনাম"
                          autoFocus
                        />
                      </div>
                      <Button type="submit">সেভ করুন</Button>
                    </form>
                  </DialogContent>
                </Dialog>

                <DropdownMenuItem
                  onSelect={() => setIsTagsOpen(true)}
                  disabled={note.isLocked}
                >
                  <Tag className="mr-2 h-4 w-4" />
                  <span>ট্যাগ এডিট করুন</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      className="text-destructive"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>ট্র্যাশে পাঠান</span>
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>আপনি কি নিশ্চিত?</AlertDialogTitle>
                      <AlertDialogDescription>
                        এই নোটটি ট্র্যাশে পাঠানো হবে। আপনি ট্র্যাশ থেকে এটি
                        পুনরুদ্ধার করতে পারবেন।
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>বাতিল করুন</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleTrash}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        ট্র্যাশে পাঠান
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <Link
            href={cardLink}
            onClick={onCardClick}
            className="block h-full flex-grow p-6 pt-0"
          >
            <CardContent className="space-y-4 p-0">
              <p className="line-clamp-3 text-sm text-muted-foreground">
                {contentPreview}
              </p>
              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {note.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Link>
          <CardFooter className="flex items-center justify-between p-6 pt-0 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {readingTime} মিনিট পড়া
            </span>
            <span>{formattedDate}</span>
          </CardFooter>
        </Card>
      </motion.div>
      {isTagsOpen && <ManageTagsDialog
        note={note}
        isOpen={isTagsOpen}
        onOpenChange={setIsTagsOpen}
      />}
    </>
  );
}

export const NoteCard = memo(
  NoteCardComponent,
  (prevProps, nextProps) =>
    prevProps.note.id === nextProps.note.id &&
    prevProps.note.title === nextProps.note.title &&
    prevProps.note.updatedAt === nextProps.note.updatedAt &&
    prevProps.note.isPinned === nextProps.note.isPinned &&
    prevProps.note.isLocked === nextProps.note.isLocked &&
    JSON.stringify(prevProps.note.content) ===
      JSON.stringify(nextProps.note.content) &&
    JSON.stringify(prevProps.note.tags) === JSON.stringify(nextProps.note.tags),
);
