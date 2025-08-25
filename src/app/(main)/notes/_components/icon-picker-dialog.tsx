"use client";

import React from "react";
import * as Lucide from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useNotesStore } from "@/stores/use-notes";
import { Note } from "@/lib/types";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface IconPickerDialogProps {
  note: Note;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const iconList = [
  "Lightbulb",
  "Book",
  "Code",
  "CheckCircle",
  "Star",
  "Heart",
  "Pin",
  "Pencil",
  "Target",
  "ClipboardCheck",
  "BrainCircuit",
  "Quote",
  "Users",
  "Briefcase",
  "FileText",
  "MessageSquare",
  "Link",
  "Camera",
] as const;

type IconName = (typeof iconList)[number];

const IconComponent = ({ name }: { name: IconName }) => {
  const Icon = Lucide[name] as React.ElementType;
  if (!Icon) return null;
  return <Icon className="h-6 w-6 text-foreground" />;
};

export default function IconPickerDialog({
  note,
  isOpen,
  onOpenChange,
}: IconPickerDialogProps) {
  const { updateNote } = useNotesStore();

  const handleSelectIcon = async (iconName: string) => {
    try {
      await updateNote(note.id, { icon: iconName });
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update icon.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select an Icon</DialogTitle>
          <DialogDescription>
            Choose an icon that best represents your note.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-64">
          <div className="grid grid-cols-4 gap-4 p-4">
            {iconList.map((iconName) => (
              <button
                key={iconName}
                onClick={() => handleSelectIcon(iconName)}
                className="flex items-center justify-center rounded-md p-3 transition-colors hover:bg-accent"
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
