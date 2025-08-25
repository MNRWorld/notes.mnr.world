"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle as AlertDialogTitleComponent,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Note, NoteHistory } from "@/lib/types";
import { useNotesStore } from "@/stores/use-notes";
import { formatDistanceToNow } from "date-fns";
import { bn } from "date-fns/locale";
import { RotateCcw } from "lucide-react";
import Editor from "@/lib/editor";

interface VersionHistoryDialogProps {
  note: Note;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function VersionHistoryDialog({
  note,
  isOpen,
  onOpenChange,
}: VersionHistoryDialogProps) {
  const { updateNote } = useNotesStore();

  const allVersions = [
    { content: note.content, updatedAt: note.updatedAt },
    ...(note.history || []),
  ];

  const [selectedHistory, setSelectedHistory] = useState<NoteHistory | null>(
    allVersions[0] || null,
  );

  useEffect(() => {
    if (isOpen) {
      const latestVersion = {
        content: note.content,
        updatedAt: note.updatedAt,
      };
      setSelectedHistory(latestVersion);
    }
  }, [isOpen, note.content, note.updatedAt]);

  const handleRestore = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedHistory) {
      try {
        await updateNote(note.id, { content: selectedHistory.content });
        onOpenChange(false);
      } catch (error) {
        console.error("Failed to restore version.", error);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>&quot;{note.title}&quot; এর ভার্সন হিস্টোরি</DialogTitle>
          <DialogDescription>
            একটি ভার্সন সিলেক্ট করে প্রিভিউ দেখুন এবং পুনরুদ্ধার করুন।
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
          <div className="md:col-span-1 flex flex-col h-full">
            <h3 className="text-lg font-semibold mb-2">ভার্সনসমূহ</h3>
            <ScrollArea className="flex-grow rounded-lg">
              <div className="p-2 space-y-1">
                {allVersions.map((history, index) => (
                  <button
                    key={history.updatedAt}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedHistory(history);
                    }}
                    className={`w-full text-left p-3 rounded-md transition-colors ${
                      selectedHistory?.updatedAt === history.updatedAt
                        ? "bg-accent"
                        : "hover:bg-accent/50"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">
                        {formatDistanceToNow(new Date(history.updatedAt), {
                          addSuffix: true,
                          locale: bn,
                        })}
                      </span>
                      {index === 0 && <Badge>বর্তমান</Badge>}
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
          <div className="md:col-span-2 flex flex-col h-full overflow-hidden">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">প্রিভিউ</h3>
              {selectedHistory && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      disabled={selectedHistory.updatedAt === note.updatedAt}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      পুনরুদ্ধার করুন
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                      <AlertDialogTitleComponent>
                        আপনি কি নিশ্চিত?
                      </AlertDialogTitleComponent>
                      <AlertDialogDescription>
                        এই ভার্সনটি পুনরুদ্ধার করলে বর্তমান লেখাটি পরিবর্তন হয়ে
                        যাবে। আপনার বর্তমান লেখাটি হিস্টোরিতে সেভ হয়ে থাকবে।
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
                        বাতিল
                      </AlertDialogCancel>
                      <AlertDialogAction onClick={handleRestore}>
                        পুনরুদ্ধার করুন
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            <ScrollArea className="flex-grow rounded-lg bg-muted/20">
              <div className="p-4 prose dark:prose-invert max-w-none">
                {selectedHistory ? (
                  <Editor
                    content={selectedHistory.content}
                    onChange={() => {}}
                    isReadOnly={true}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>প্রিভিউ দেখার জন্য একটি ভার্সন সিলেক্ট করুন।</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
VersionHistoryDialog.displayName = "VersionHistoryDialog";
