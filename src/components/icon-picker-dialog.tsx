"use client";

import React, { useRef } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useNotesStore } from "@/stores/use-notes";
import { Note } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";

interface IconPickerDialogProps {
  note: Note;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function IconPickerDialog({
  note,
  isOpen,
  onOpenChange,
}: IconPickerDialogProps) {
  const { updateNote } = useNotesStore();
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);

  const handleSelectIcon = async (
    e: React.MouseEvent | null,
    iconName: string,
  ) => {
    if (e) e.stopPropagation();
    try {
      await updateNote(note.id, { icon: iconName });
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to update icon:", err);
    }
  };

  const openOsEmojiPicker = () => {
    if (!hiddenInputRef.current) return;
    hiddenInputRef.current.focus();
  };

  const emojiSet = [
    "🔥",
    "✨",
    "📚",
    "📝",
    "💡",
    "🎵",
    "📅",
    "📎",
    "📁",
    "⭐",
    "❤️",
    "🏷️",
    "🧠",
    "🤖",
    "📷",
    "🎬",
    "📌",
    "🔒",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-full max-w-[95vw] sm:max-w-sm md:max-w-md lg:max-w-lg px-3 sm:px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>আইকন নির্বাচন করুন</DialogTitle>
          <DialogDescription>
            আপনার নোটের জন্য একটি উপযুক্ত আইকন বেছে নিন।
          </DialogDescription>
        </DialogHeader>

        <div className="px-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="text-sm font-medium px-3 py-1">Emoji</div>

            <div className="ml-auto flex items-center gap-2">
              <input
                ref={hiddenInputRef}
                aria-hidden
                className="opacity-0 absolute pointer-events-none"
                onInput={(ev) => {
                  const val = (ev.target as HTMLInputElement).value;
                  if (val) {
                    handleSelectIcon(null, val.trim());
                  }
                }}
              />
              <button
                className="px-2 py-1 rounded bg-transparent"
                onClick={() => openOsEmojiPicker()}
                title="Open OS emoji picker"
              >
                😊
              </button>
            </div>
          </div>

          <div>
            <ScrollArea className="h-48 sm:h-56 md:h-64 lg:h-72">
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-8 gap-3 p-2 text-2xl sm:text-xl md:text-2xl">
                {emojiSet.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={(e) => handleSelectIcon(e, emoji)}
                    className="flex items-center justify-center rounded-md p-3 sm:p-2 hover:bg-accent aspect-square touch-manipulation"
                    aria-label={`Select ${emoji} emoji`}
                    title={`Select ${emoji}`}
                  >
                    <span className="leading-none">{emoji}</span>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

IconPickerDialog.displayName = "IconPickerDialog";
