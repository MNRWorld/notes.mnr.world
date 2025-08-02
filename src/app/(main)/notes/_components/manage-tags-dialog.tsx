"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotes } from "@/stores/use-notes";
import { Note } from "@/lib/types";
import { Tag, X } from "lucide-react";
import { toast } from "sonner";

interface ManageTagsDialogProps {
  note: Note;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function ManageTagsDialog({
  note,
  isOpen,
  onOpenChange,
}: ManageTagsDialogProps) {
  const { updateNote } = useNotes();
  const [tags, setTags] = useState<string[]>(note.tags || []);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    setTags(note.tags || []);
  }, [note.tags]);

  const handleAddTag = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!newTag) {
        toast.error("ট্যাগ খালি রাখা যাবে না।");
        return;
      }
      if (tags.includes(newTag)) {
        toast.error(`ট্যাগ "${newTag}" ইতিমধ্যে যোগ করা হয়েছে।`);
        return;
      }
      if (tags.length >= 5) {
        toast.error("আপনি সর্বোচ্চ ৫টি ট্যাগ যোগ করতে পারবেন।");
        return;
      }
      setTags((prevTags) => [...prevTags, newTag]);
      setTagInput("");
    }
  }, [tagInput, tags]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setTags((prevTags) => prevTags.filter((tag) => tag !== tagToRemove));
  }, []);

  const handleSaveTags = useCallback(async () => {
    await updateNote(note.id, { tags });
    toast.success("ট্যাগ সফলভাবে সেভ হয়েছে।");
    onOpenChange(false);
  }, [note.id, onOpenChange, tags, updateNote]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>"{note.title}" এর ট্যাগ পরিচালনা করুন</DialogTitle>
          <DialogDescription>
            এই নোটের জন্য ট্যাগ যোগ করুন বা সরান। Enter চেপে ট্যাগ যোগ করুন।
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="নতুন ট্যাগ যোগ করুন..."
              className="pl-9"
            />
          </div>
          <div className="flex min-h-[48px] flex-wrap gap-2 rounded-md border p-2">
            {tags.length > 0 ? (
              tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="rounded-full hover:bg-muted-foreground/20"
                    aria-label={`Remove tag ${tag}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">
                কোনও ট্যাগ নেই।
              </span>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            বাতিল
          </Button>
          <Button onClick={handleSaveTags}>সেভ করুন</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
