
"use client";

import React, { useCallback, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { useNotesStore } from "@/stores/use-notes";
import { cn } from "@/lib/utils";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const createNote = useNotesStore((state) => state.createNote);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isEditorPage = pathname.startsWith("/editor");

  const handleNewNote = useCallback(async () => {
    try {
      const newNoteId = await createNote();
      if (newNoteId) {
        router.push(`/editor?noteId=${newNoteId}`);
        setSidebarOpen(false);
      } else {
        toast.error("নতুন নোট তৈরি করতে ব্যর্থ হয়েছে।");
      }
    } catch (error) {
      console.error(error);
      toast.error("নোট তৈরি করতে একটি অপ্রত্যাশিত ত্রুটি ঘটেছে।");
    }
  }, [createNote, router]);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        onNewNote={handleNewNote}
        isOpen={sidebarOpen}
        setOpen={setSidebarOpen}
        isEditorPage={isEditorPage}
      />

      <div className="flex flex-1 flex-col lg:pl-72">
        <Header />
        <main
          className={cn(
            "flex-1 overflow-y-auto",
            "pt-16 lg:pt-0",
          )}
        >
          <div
            className={cn(
              "h-full",
              !isEditorPage && "pb-16 lg:pb-0",
            )}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
