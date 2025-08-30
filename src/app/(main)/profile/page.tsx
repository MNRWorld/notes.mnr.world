"use client";

import { useState, useMemo, useEffect } from "react";
import { useSettingsStore } from "@/stores/use-settings";
import { cn } from "@/lib/utils";
import { useNotesStore } from "@/stores/use-notes";
import { motion } from "framer-motion";
import { Note } from "@/lib/types";
import { Info, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import ProfileOverview from "@/components/profile/profile-overview";
import QuickAccess from "@/components/profile/quick-access";
import SettingsComponent from "@/components/profile/settings-component";

const getWordCount = (note: Note): number => {
  if (!note.content || !note.content.blocks) return 0;
  const text = note.content.blocks
    .map((block) => block.data.text || "")
    .join(" ");
  return text.split(/\s+/).filter(Boolean).length;
};

export default function ProfilePage() {
  const { font } = useSettingsStore();
  const notes = useNotesStore((state) => state.notes);
  const archivedNotes = useNotesStore((state) => state.archivedNotes);
  const trashedNotes = useNotesStore((state) => state.trashedNotes);
  const fetchNotes = useNotesStore((state) => state.fetchNotes);
  const fetchArchivedNotes = useNotesStore((state) => state.fetchArchivedNotes);
  const fetchTrashedNotes = useNotesStore((state) => state.fetchTrashedNotes);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchNotes(),
          fetchArchivedNotes(), 
          fetchTrashedNotes(),
        ]);
      } catch (error) {
        // Error is already handled in the store
      } finally {
        setIsLoading(false);
        setIsClient(true);
      }
    };
    loadAllData();
  }, [fetchNotes, fetchArchivedNotes, fetchTrashedNotes]);

  const stats = useMemo(() => {
    const allNotes = [...notes, ...archivedNotes, ...trashedNotes];
    const totalNotes = allNotes.length;
    const totalWords = allNotes.reduce((acc, note) => acc + getWordCount(note), 0);
    const archivedCount = archivedNotes.length;
    const trashedCount = trashedNotes.length;
    const lockedNotes = allNotes.filter((note) => note.isLocked).length;

    return {
      totalNotes,
      totalWords,
      archivedNotes: archivedCount,
      trashedNotes: trashedCount,
      lockedNotes,
      activeNotes: notes.length,
    };
  }, [notes, archivedNotes, trashedNotes]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  if (!isClient || isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">প্রোফাইল লোড হচ্ছে...</p>
      </div>
    </div>;
  }

  return (
    <div
      className={cn(
        "min-h-screen bg-gradient-to-br from-background to-muted/20",
        font.split(" ")[0],
      )}
    >
      <div className="container mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6 lg:space-y-8"
        >
          <motion.div variants={itemVariants} className="mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">প্রোফাইল</h2>
                <p className="text-sm text-muted-foreground">
                  আপনার লেখার পরিসংখ্যান দেখুন
                </p>
              </div>
            </div>
          </motion.div>

          <motion.section variants={itemVariants}>
            <ProfileOverview stats={stats} />
          </motion.section>

          <motion.section variants={itemVariants}>
            <QuickAccess stats={stats} />
          </motion.section>

          <motion.section variants={itemVariants}>
            <SettingsComponent />
          </motion.section>

          <motion.section variants={itemVariants}>
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Info className="h-4 w-4" />
                  অ্যাপলিকেশন
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <span className="text-muted-foreground">তৈরি করেছেন</span>
                  <span className="font-medium text-foreground">FrostFoe</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <span className="text-muted-foreground">প্রকাশক</span>
                  <span className="font-medium text-foreground">MNR World</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <span className="text-muted-foreground">সংস্করণ</span>
                  <Badge variant="outline" className="font-mono">
                    1.0.0
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.section>
        </motion.div>
      </div>

      <div className="pb-16 lg:pb-8" />
    </div>
  );
}
