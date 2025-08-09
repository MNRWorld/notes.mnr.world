
"use client";

import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Sidebar from "@/components/layout/sidebar";
import ScrollProgress from "@/components/ui/scroll-progress";
import { useNotesStore } from "@/stores/use-notes";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const createNote = useNotesStore((state) => state.createNote);

  const handleNewNote = useCallback(async () => {
    try {
      router.push(`/editor`);
    } catch (error) {
      toast.error("নোট তৈরি করতে ব্যর্থ হয়েছে।");
    }
  }, [router]);

  return (
    <div className="flex h-screen bg-background">
      <ScrollProgress />
      <Sidebar onNewNote={handleNewNote} />
      <main className="flex-1 overflow-y-auto lg:pl-72 h-full pb-16 lg:pb-0">
        {children}
      </main>
    </div>
  );
}
