"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotesStore } from "@/stores/use-notes";
import { Note } from "@/lib/types";
import { Icons } from "@/components/ui/icons";
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
  const { updateNote } = useNotesStore();
  const [tags, setTags] = useState<string[]>(note.tags || []);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    setTags(note.tags || []);
  }, [note.tags]);

  const handleAddTag = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
        e.preventDefault();
        const newTag = tagInput.trim().toLowerCase();
        if (!newTag) {
          toast.error("ট্যাগের নাম খালি হতে পারবে না।");
          return;
        }
        if (tags.includes(newTag)) {
          toast.warning(`"${newTag}" ট্যাগটি ইতিমধ্যে যুক্ত আছে।`);
          return;
        }
        if (tags.length >= 5) {
          toast.error("আপনি একটি নোটে সর্বোচ্চ ৫টি ট্যাগ যোগ করতে পারবেন।");
          return;
        }
        setTags((prevTags) => [...prevTags, newTag]);
        setTagInput("");
      }
    },
    [tagInput, tags],
  );

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setTags((prevTags) => prevTags.filter((tag) => tag !== tagToRemove));
  }, []);

  const handleSaveTags = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      await updateNote(note.id, { tags });
      onOpenChange(false);
    },
    [note.id, onOpenChange, tags, updateNote],
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>
            &quot;{note.title}&quot; এর জন্য ট্যাগ পরিচালনা
          </DialogTitle>
          <DialogDescription>
            ট্যাগ যুক্ত অথবা অপসারণ করুন। কমা বা এন্টার চেপে নতুন ট্যাগ যুক্ত
            করুন।
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="relative">
            <Icons.Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="নতুন ট্যাগ লিখুন..."
              className="pl-9"
            />
          </div>
          <div className="flex min-h-[48px] flex-wrap items-center gap-2 rounded-md border p-2">
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
                    aria-label={`ট্যাগ ${tag} মুছুন`}
                  >
                    <Icons.X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            ) : (
              <span className="p-2 text-sm text-muted-foreground">
                এই নোটটিতে কোনো ট্যাগ যুক্ত করা নেই।
              </span>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onOpenChange(false);
            }}
          >
            বাতিল করুন
          </Button>
          <Button onClick={handleSaveTags}>সংরক্ষণ করুন</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
