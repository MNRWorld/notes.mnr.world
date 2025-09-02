"use client";

import React from "react";
import { Icons } from "@/components/ui/icons";

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

const iconList = [
  "Lightbulb",
  "Book",
  "Feather",
  "CheckSquare",
  "Briefcase",
  "GraduationCap",
  "Heart",
  "Code",
  "Movie",
  "Home",
  "User",
  "Settings",
  "Star",
  "Sparkles",
  "Plane",
  "Music",
  "Flag",
  "Tag",
];

const IconComponent = ({ name }: { name: string }) => {
  const Icon = (Icons as any)[name];
  if (!Icon) return null;
  return <Icon className="h-6 w-6 text-foreground" />;
};
IconComponent.displayName = "IconComponent";

export default function IconPickerDialog({
  note,
  isOpen,
  onOpenChange,
}: IconPickerDialogProps) {
  const { updateNote } = useNotesStore();

  const handleSelectIcon = async (e: React.MouseEvent, iconName: string) => {
    e.stopPropagation();
    try {
      await updateNote(note.id, { icon: iconName });
      onOpenChange(false);
    } catch (error) {}
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>আইকন নির্বাচন করুন</DialogTitle>
          <DialogDescription>
            আপনার নোটের জন্য একটি উপযুক্ত আইকন বেছে নিন।
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-64">
          <div className="grid grid-cols-4 gap-4 p-4">
            {iconList.map((iconName) => (
              <button
                key={iconName}
                onClick={(e) => handleSelectIcon(e, iconName)}
                className="flex items-center justify-center rounded-md p-4 transition-colors hover:bg-accent aspect-square"
                aria-label={`Select ${iconName} icon`}
              >
                <IconComponent name={iconName} />
              </button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
IconPickerDialog.displayName = "IconPickerDialog";
