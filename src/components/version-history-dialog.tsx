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
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/bn";
dayjs.extend(relativeTime);
dayjs.locale("bn");
import { Icons } from "@/components/ui/icons";
import dynamic from "next/dynamic";
const Editor = dynamic(() => import("@/lib/editor"), { ssr: false });

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
      } catch (error) {}
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
            প্রয়োজনে পুরনো ভার্সন পুনরুদ্ধার করুন।
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
          <div className="md:col-span-1 flex flex-col h-full">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Icons.History className="w-5 h-5" />
              ভার্সনসমূহ
            </h3>
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
                        {dayjs(history.updatedAt).fromNow()}
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
                      <Icons.RotateCcw className="mr-2 h-4 w-4" />
                      পুনরুদ্ধার
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                      <AlertDialogTitleComponent>
                        এই ভার্সনটি পুনরুদ্ধার করবেন?
                      </AlertDialogTitleComponent>
                      <AlertDialogDescription>
                        এই কাজটি আপনার নোটের বর্তমান লেখাকে নির্বাচিত ভার্সন
                        দিয়ে পরিবর্তন করবে। আপনার বর্তমান লেখাটিও হিস্টোরিতে সেভ
                        হয়ে থাকবে।
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
                        বাতিল
                      </AlertDialogCancel>
                      <AlertDialogAction onClick={handleRestore}>
                        পুনরুদ্ধার
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
