
"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { useNotesStore } from "@/stores/use-notes";
import { cn } from "@/lib/utils";
import { App as CapacitorApp } from "@capacitor/app";
import { AnimatePresence, motion } from "framer-motion";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const createNote = useNotesStore((state) => state.createNote);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isEditorPage = pathname.startsWith("/editor");

  useEffect(() => {
    const registerBackButtonListener = async () => {
      if (
        typeof window !== "undefined" &&
        CapacitorApp &&
        CapacitorApp.addListener
      ) {
        const listener = await CapacitorApp.addListener(
          "backButton",
          ({ canGoBack }) => {
            if (
              canGoBack &&
              (pathname.startsWith("/editor") ||
                pathname.startsWith("/archive") ||
                pathname.startsWith("/profile") ||
                pathname.startsWith("/dashboard"))
            ) {
              router.back();
            } else if (!canGoBack || pathname === "/notes" || pathname === "/") {
              CapacitorApp.exitApp();
            } else {
              router.back();
            }
          },
        );
        return listener;
      }
    };

    const listenerPromise = registerBackButtonListener();

    return () => {
      const unregister = async () => {
        const listener = await listenerPromise;
        if (listener) {
          listener.remove();
        }
      };
      unregister();
    };
  }, [pathname, router]);

  const handleNewNote = async () => {
    try {
      const newNoteId = await createNote();
      if (newNoteId) {
        router.push(`/editor?noteId=${newNoteId}&isNew=true`);
        setSidebarOpen(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("নোট তৈরি করতে একটি অপ্রত্যাশিত ত্রুটি ঘটেছে।");
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        onNewNote={handleNewNote}
        isOpen={sidebarOpen}
        setOpen={setSidebarOpen}
        isEditorPage={isEditorPage}
      />

      <div className="flex flex-1 flex-col lg:pl-72">
        {!isEditorPage && <Header onSidebarOpen={() => setSidebarOpen(true)} />}
        <main
          className={cn(
            "flex-1 overflow-y-auto bg-card/50",
            !isEditorPage && "pb-16 lg:pb-0",
            isEditorPage ? "h-full" : "pt-16 lg:pt-0",
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className={cn("h-full", !isEditorPage && "lg:pb-0")}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
