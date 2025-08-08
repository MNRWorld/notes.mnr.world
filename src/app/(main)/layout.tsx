
"use client";

import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Sidebar from "@/components/layout/sidebar";
import ScrollProgress from "@/components/ui/scroll-progress";
import { useNotesStore } from "@/stores/use-notes";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { createNote } = useNotesStore();

  const handleNewNote = useCallback(async () => {
    try {
      const noteId = await createNote();
      if (noteId) {
        toast.success("নতুন নোট তৈরি হয়েছে!");
        router.push(`/editor?noteId=${noteId}`);
      }
    } catch (error) {
      toast.error("নোট তৈরি করতে ব্যর্থ হয়েছে।");
      console.error(error);
    }
  }, [createNote, router]);

  return (
    <div className="flex h-screen bg-background">
      <ScrollProgress />
      <Sidebar onNewNote={handleNewNote} />
      <main className="flex-1 overflow-y-auto pb-16 lg:pb-0 lg:pl-72 h-full">
        {children}
      </main>
    </div>
  );
}
