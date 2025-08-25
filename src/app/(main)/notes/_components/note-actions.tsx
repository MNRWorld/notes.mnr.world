"use client";

import React, { useState, useCallback } from "react";
import {
  MoreVertical,
  Edit,
  Trash2,
  Pin,
  PinOff,
  Tag,
  Lock,
  Unlock,
  ImageIcon,
  Archive,
  History,
  Cloud,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Note } from "@/lib/types";
import { useNotesStore } from "@/stores/use-notes";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { hapticFeedback } from "@/lib/utils";

const ManageTagsDialog = dynamic(() => import("./manage-tags-dialog"));
const IconPickerDialog = dynamic(() => import("./icon-picker-dialog"));
const VersionHistoryDialog = dynamic(() => import("./version-history-dialog"));

interface NoteActionsProps {
  note: Note;
  onUnlock: (noteId: string, callback: () => void) => void;
  onShare: (note: Note, format: "md" | "json" | "txt" | "pdf") => void;
}

export function NoteActions({ note, onUnlock, onShare }: NoteActionsProps) {
  const { updateNote, togglePin, archiveNote, deleteNotePermanently } =
    useNotesStore();

  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [newTitle, setNewTitle] = useState(() => note.title);

  const handleDropdownSelect = (e: Event, callback: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    callback();
  };

  const handleAction = useCallback(
    async (action: "pin" | "lock" | "archive" | "delete") => {
      switch (action) {
        case "pin":
          await togglePin(note.id);
          break;
        case "lock":
          onUnlock(note.id, async () => {
            await updateNote(note.id, { isLocked: !note.isLocked });
            hapticFeedback("light");
          });
          break;
        case "archive":
          await archiveNote(note.id);
          break;
        case "delete":
          setIsDeleteDialogOpen(true);
          break;
      }
    },
    [note.id, note.isLocked, togglePin, archiveNote, onUnlock, updateNote],
  );

  const handleActionWithLockCheck = (callback: () => void) => (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    if (note.isLocked) {
      toast.error("লক করা নোটে এই কাজটি করা যাবে না।");
      return;
    }
    callback();
  };

  const handleFinalDelete = async () => {
    await deleteNotePermanently(note.id);
    setIsDeleteDialogOpen(false);
  };

  const handleRenameSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newTitle.trim()) {
        toast.error("শিরোনাম খালি রাখা যাবে না।");
        return;
      }
      try {
        await updateNote(note.id, { title: newTitle });
        setIsRenameOpen(false);
      } catch (error) {
        toast.error("নোট রিনেম করতে ব্যর্থ হয়েছে।");
      }
    },
    [newTitle, note.id, updateNote],
  );

  const handleShareClick = (format: "md" | "json" | "txt" | "pdf") => {
    if (note.isLocked) {
      toast.error("লক করা নোট শেয়ার করা যাবে না।");
      return;
    }
    onShare(note, format);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="-mr-2 h-9 w-9 flex-shrink-0"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            aria-label="নোট অপশন"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem
            onSelect={handleActionWithLockCheck(() =>
              setIsIconPickerOpen(true),
            )}
            disabled={note.isLocked}
          >
            <ImageIcon className="mr-2 h-4 w-4" aria-hidden="true" />
            <span>আইকন সেট করুন</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={(e) => handleDropdownSelect(e, () => handleAction("pin"))}
          >
            {note.isPinned ? (
              <>
                <PinOff className="mr-2 h-4 w-4" aria-hidden="true" />
                <span>আনপিন করুন</span>
              </>
            ) : (
              <>
                <Pin className="mr-2 h-4 w-4" aria-hidden="true" />
                <span>পিন করুন</span>
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={(e) =>
              handleDropdownSelect(e, () => handleAction("lock"))
            }
          >
            {note.isLocked ? (
              <>
                <Unlock className="mr-2 h-4 w-4" aria-hidden="true" />
                <span>আনলক করুন</span>
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" aria-hidden="true" />
                <span>লক করুন</span>
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={handleActionWithLockCheck(() => setIsHistoryOpen(true))}
            disabled={note.isLocked}
          >
            <History className="mr-2 h-4 w-4" aria-hidden="true" />
            <span>ভার্সন হিস্টোরি</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={handleActionWithLockCheck(() => {
              setNewTitle(note.title);
              setIsRenameOpen(true);
            })}
            disabled={note.isLocked}
          >
            <Edit className="mr-2 h-4 w-4" aria-hidden="true" />
            <span>রিনেম করুন</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={handleActionWithLockCheck(() => setIsTagsOpen(true))}
            disabled={note.isLocked}
          >
            <Tag className="mr-2 h-4 w-4" aria-hidden="true" />
            <span>ট্যাগ এডিট করুন</span>
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger disabled={note.isLocked}>
              <Cloud className="mr-2 h-4 w-4" />
              <span>ক্লাউডে সেভ করুন</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem onSelect={() => handleShareClick("md")}>
                  (.md) হিসেবে
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleShareClick("json")}>
                  (.json) হিসেবে
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleShareClick("txt")}>
                  (.txt) হিসেবে
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleShareClick("pdf")}>
                  (.pdf) হিসেবে
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onSelect={(e) =>
              handleDropdownSelect(e, () => handleAction("archive"))
            }
            disabled={note.isLocked}
          >
            <Archive className="mr-2 h-4 w-4" />
            <span>আর্কাইভ করুন</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            variant="destructive"
            onSelect={(e) =>
              handleDropdownSelect(e, () => handleAction("delete"))
            }
          >
            <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
            <span>ডিলিট করুন</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent>
          <form onSubmit={handleRenameSubmit}>
            <DialogHeader>
              <DialogTitle>নোট রিনেম করুন</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                id="new-title-input"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="নতুন শিরোনাম"
                autoFocus
                aria-label="New note title"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsRenameOpen(false)}
              >
                বাতিল
              </Button>
              <Button type="submit">সেভ করুন</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>আপনি কি নিশ্চিত?</AlertDialogTitle>
            <AlertDialogDescription>
              এই নোটটি স্থায়ীভাবে ডিলিট করা হবে। এই ক্রিয়াটি বাতিল করা যাবে
              না।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              বাতিল করুন
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleFinalDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              স্থায়ীভাবে ডিলিট করুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isTagsOpen && (
        <ManageTagsDialog
          note={note}
          isOpen={isTagsOpen}
          onOpenChange={setIsTagsOpen}
        />
      )}
      {isIconPickerOpen && (
        <IconPickerDialog
          note={note}
          isOpen={isIconPickerOpen}
          onOpenChange={setIsIconPickerOpen}
        />
      )}
      {isHistoryOpen && (
        <VersionHistoryDialog
          note={note}
          isOpen={isHistoryOpen}
          onOpenChange={setIsHistoryOpen}
        />
      )}
    </>
  );
}
NoteActions.displayName = "NoteActions";
