"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";

import { useNotesStore } from "@/stores/use-notes";
import { useTemplatesStore } from "@/stores/use-templates";
import { Note } from "@/lib/types";
import { useLoadingState } from "@/hooks/use-loading-state";
import { toast } from "sonner";

interface NoteActionsProps {
  note: Note;
  onUnlock: (noteId: string, callback: () => void) => void;
  onShare: (note: Note, format: "md" | "json" | "txt" | "pdf") => void;
  onOpenTags: (note: Note) => void;
  onOpenIconPicker: (note: Note) => void;
  onOpenHistory: (note: Note) => void;
  onTogglePrivacy: (note: Note) => void;
}

export function NoteActions({
  note,
  onUnlock,
  onOpenTags,
  onOpenIconPicker,
  onOpenHistory,
  onShare,
  onTogglePrivacy,
}: NoteActionsProps) {
  const { archiveNote, trashNote, togglePin } = useNotesStore();
  const { addCustomTemplate } = useTemplatesStore();
  const [isLoading, handleAction] = useLoadingState();

  const handleGenericAction = (
    e: React.MouseEvent,
    action: () => Promise<any> | void,
  ) => {
    e.stopPropagation();
    handleAction(async () => {
      await action();
    });
  };

  const handleShareClick = (
    e: React.MouseEvent,
    format: "md" | "json" | "txt" | "pdf",
  ) => {
    e.stopPropagation();
    if (note.isLocked) {
      toast.error("লক করা নোট এক্সপোর্ট করা যাবে না।");
      return;
    }
    handleAction(async () => {
      try {
        await onShare(note, format);
      } catch (e) {
        toast.error("নোট এক্সপোর্ট করা যায়নি।");
      }
    });
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
          className="h-8 w-8 flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
          aria-label="Note options"
        >
          {isLoading ? (
            <Icons.Loader className="h-4 w-4 animate-spin" />
          ) : (
            <Icons.DotsVertical className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuItem
          onClick={(e) => handleGenericAction(e, () => togglePin(note.id))}
        >
          <Icons.Pin className="mr-2 h-4 w-4" />
          <span>{note.isPinned ? "আনপিন করুন" : "পিন করুন"}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLockClick}>
          <Icons.Lock className="mr-2 h-4 w-4" />
          <span>{note.isLocked ? "আনলক করুন" : "লক করুন"}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => handleGenericAction(e, () => archiveNote(note.id))}
        >
          <Icons.Archive className="mr-2 h-4 w-4" />
          <span>আর্কাইভ করুন</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onOpenTags(note);
          }}
        >
          <Icons.Tag className="mr-2 h-4 w-4" />
          <span>ট্যাগ পরিচালনা</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onOpenIconPicker(note);
          }}
        >
          <Icons.Palette className="mr-2 h-4 w-4" />
          <span>আইকন পরিবর্তন</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onOpenHistory(note);
          }}
        >
          <Icons.History className="mr-2 h-4 w-4" />
          <span>ভার্সন হিস্টোরি</span>
        </DropdownMenuItem>

        {onTogglePrivacy && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onTogglePrivacy(note);
            }}
          >
            <Icons.Eye className="mr-2 h-4 w-4" />
            <span>
              {note.isAnonymous ? "পরিচয় প্রকাশ করুন" : "গোপনীয় করুন"}
            </span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Icons.Download className="mr-2 h-4 w-4" />
            <span>এক্সপোর্ট করুন</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={(e) => handleShareClick(e, "pdf")}>
              <Icons.FileText className="mr-2 h-4 w-4" />
              <span>PDF হিসেবে</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => handleShareClick(e, "md")}>
              <Icons.Code className="mr-2 h-4 w-4" />
              <span>Markdown হিসেবে</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => handleShareClick(e, "txt")}>
              <Icons.File className="mr-2 h-4 w-4" />
              <span>TXT হিসেবে</span>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem onClick={(e) => handleShareClick(e, "txt")}>
          <Icons.Share className="mr-2 h-4 w-4" />
          <span>শেয়ার করুন</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => handleGenericAction(e, () => addCustomTemplate(note))}
        >
          <Icons.DeviceFloppy className="mr-2 h-4 w-4" />
          <span>টেমপ্লেট হিসেবে সেভ</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={(e) => handleGenericAction(e, () => trashNote(note.id))}
        >
          <Icons.Trash className="mr-2 h-4 w-4" />
          <span>ট্র্যাশে পাঠান</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
