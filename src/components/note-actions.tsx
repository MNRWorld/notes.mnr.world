"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/button";
import {
  MoreVertical,
  Pin,
  Archive,
  Trash2,
  Share,
  Lock,
  FileText,
  Tag,
  Palette,
  History,
} from "lucide-react";

import { useNotesStore } from "@/stores/use-notes";
import { useTemplatesStore } from "@/stores/use-templates";
import { Note } from "@/lib/types";

interface NoteActionsProps {
  note: Note;
  onUnlock: (noteId: string, callback: () => void) => void;
  onShare: (note: Note, format: "md" | "json" | "txt" | "pdf") => void;
  onOpenTags: (note: Note) => void;
  onOpenIconPicker: (note: Note) => void;
  onOpenHistory: (note: Note) => void;
}

export function NoteActions({
  note,
  onUnlock,
  onShare,
  onOpenTags,
  onOpenIconPicker,
  onOpenHistory,
}: NoteActionsProps) {
  const { archiveNote, trashNote, togglePin } = useNotesStore();
  const { addCustomTemplate } = useTemplatesStore();

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const handleLockClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUnlock(note.id, () => {});
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuItem
          onClick={(e) => handleAction(e, () => togglePin(note.id))}
        >
          <Pin className="mr-2 h-4 w-4" />
          <span>{note.isPinned ? "আনপিন" : "পিন"}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLockClick}>
          <Lock className="mr-2 h-4 w-4" />
          <span>{note.isLocked ? "আনলক" : "লক"}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => handleAction(e, () => archiveNote(note.id))}
        >
          <Archive className="mr-2 h-4 w-4" />
          <span>আর্কাইভ</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => handleAction(e, () => onOpenTags(note))}
        >
          <Tag className="mr-2 h-4 w-4" />
          <span>ট্যাগ</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => handleAction(e, () => onOpenIconPicker(note))}
        >
          <Palette className="mr-2 h-4 w-4" />
          <span>আইকন</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => handleAction(e, () => onOpenHistory(note))}
        >
          <History className="mr-2 h-4 w-4" />
          <span>ইতিহাস</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(e) => handleAction(e, () => onShare(note, "pdf"))}
        >
          <Share className="mr-2 h-4 w-4" />
          <span>শেয়ার (PDF)</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => handleAction(e, () => addCustomTemplate(note))}
        >
          <FileText className="mr-2 h-4 w-4" />
          <span>টেমপ্লেট</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={(e) => handleAction(e, () => trashNote(note.id))}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>মুছুন</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
