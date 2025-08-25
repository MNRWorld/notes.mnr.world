"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { useNotesStore } from "@/stores/use-notes";
import { cn } from "@/lib/utils";
import { App as CapacitorApp } from "@capacitor/app";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const createNote = useNotesStore((state) => state.createNote);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isEditorPage = pathname.startsWith("/editor");

  useEffect(() => {
    const registerBackButtonListener = async () => {
      if (!CapacitorApp || !CapacitorApp.addListener) return;
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
    };

    const listenerPromise = registerBackButtonListener();

    return () => {
      const unregister = async () => {
        const listener = await listenerPromise;
        await listener?.remove();
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
      console.error("An unexpected error occurred while creating a note.", error);
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
            !isEditorPage && "pb-16 lg:pb-0 pt-16 lg:pt-0",
            isEditorPage && "h-full",
          )}
        >
          <div className={cn("h-full", !isEditorPage && "lg:pb-0")}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
