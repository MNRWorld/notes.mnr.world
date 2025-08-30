"use client";

import React from "react";
import * as LucideIcons from "lucide-react";

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
  "Film",
];

const IconComponent = ({ name }: { name: string }) => {
  const Icon = (LucideIcons as any)[name];
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
    } catch (error) {
      //
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>আইকন নির্বাচন</DialogTitle>
          <DialogDescription>
            নোটের জন্য একটি আইকন বেছে নিন।
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-4 p-4">
          {iconList.map((iconName) => (
            <button
              key={iconName}
              onClick={(e) => handleSelectIcon(e, iconName)}
              className="flex items-center justify-center rounded-md p-4 transition-colors hover:bg-accent aspect-square"
              aria-label={`${iconName} আইকন নির্বাচন`}
            >
              <IconComponent name={iconName} />
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
IconPickerDialog.displayName = "IconPickerDialog";
