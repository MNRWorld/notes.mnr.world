"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import { useNotesStore } from "@/stores/use-notes";
import { cn } from "@/lib/utils";
import { App as CapacitorApp } from "@capacitor/app";
import { useSettingsStore } from "@/stores/use-settings";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { fetchNotes, hasFetched } = useNotesStore();
  const font = useSettingsStore((state) => state.font);

  const isEditorPage = pathname.startsWith("/editor");
  const isAiPage = pathname.startsWith("/mnrAI");

  useEffect(() => {
    if (!hasFetched) {
      fetchNotes();
    }
  }, [fetchNotes, hasFetched]);

  useEffect(() => {
    const registerBackButtonListener = async () => {
      if (
        typeof window !== "undefined" &&
        (window as any).Capacitor?.isPluginAvailable("App")
      ) {
        const listener = await CapacitorApp.addListener(
          "backButton",
          ({ canGoBack }) => {
            const nonRootPages = [
              "/editor",
              "/archive",
              "/profile",
              "/templates",
              "/mnrAI",
              "/trash",
            ];
            const isNonRootPage = nonRootPages.some((p) =>
              pathname.startsWith(p),
            );

            if (isNonRootPage) {
              router.back();
            } else if (canGoBack) {
              router.back();
            } else {
              CapacitorApp.exitApp();
            }
          },
        );
        return listener;
      }
      return null;
    };

    const listenerPromise = registerBackButtonListener();

    return () => {
      const unregister = async () => {
        const listener = await listenerPromise;
        if (listener) {
          await listener.remove();
        }
      };
      unregister();
    };
  }, [pathname, router]);

  const handleNewNote = async () => {
    try {
      const { createNote } = useNotesStore.getState();
      const newNoteId = await createNote();
      if (newNoteId) {
        router.push(`/editor?noteId=${newNoteId}&isNew=true`);
      }
    } catch (error) {}
  };

  return (
    <div
      className={cn(
        "flex h-screen overflow-hidden bg-gradient-to-br from-background via-background to-muted/20",
        font,
      )}
    >
      <Sidebar onNewNote={handleNewNote} />

      <div className="flex flex-1 flex-col lg:pl-72">
        {!isEditorPage && !isAiPage && <Header />}
        <main
          className={cn(
            "flex-1 overflow-y-auto",
            !isEditorPage &&
              !isAiPage &&
              "pt-16 lg:pt-0",
            isEditorPage && "h-full bg-background",
            isAiPage && "h-full bg-transparent",
          )}
        >
          <div className={cn("h-full", !isEditorPage && "pb-24 lg:pb-0")}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
