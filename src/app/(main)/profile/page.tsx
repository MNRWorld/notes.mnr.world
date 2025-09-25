"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { useSettingsStore } from "@/stores/use-settings";
import { cn } from "@/lib/utils";
import { useNotesStore } from "@/stores/use-notes";
import { Note } from "@/lib/types";
import { Icons } from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StaggerContainer, StaggerItem } from "@/components/page-transition";
import PageTransition from "@/components/page-transition";
import QuickAccess from "@/components/profile/quick-access";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Skeleton } from "@/components/ui/skeleton";

const ProfileOverview = dynamic(
  () => import("@/components/profile/profile-overview"),
  {
    ssr: false,
    loading: () => (
      <Card className="relative overflow-hidden bg-card/80 backdrop-blur-xl border-border w-full">
        <CardContent className="p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left animate-pulse">
            <Skeleton className="w-24 h-24 sm:w-28 sm:h-28 rounded-full" />
            <div className="w-full space-y-2">
              <Skeleton className="h-8 rounded w-1/2 mx-auto sm:mx-0" />
              <Skeleton className="h-5 rounded w-1/3 mx-auto sm:mx-0" />
            </div>
          </div>
        </CardContent>
      </Card>
    ),
  },
);

const SettingsComponent = dynamic(
  () => import("@/components/profile/settings-component"),
  {
    ssr: false,
    loading: () => (
      <div className="h-48 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    ),
  },
);

const getWordCount = (note: Note): number => {
  if (typeof note.content !== 'object' || !note.content || !note.content.blocks) return 0;
  const text = note.content.blocks
    .map((block) => block.data.text || "")
    .join(" ");
  return text.split(/\s+/).filter(Boolean).length;
};

export default function ProfilePage() {
  const { font } = useSettingsStore();
  const { notes, archivedNotes, trashedNotes, isLoading, hasFetched } =
    useNotesStore();

  const stats = useMemo(() => {
    const allNotes = [...notes, ...archivedNotes, ...trashedNotes];
    const totalNotes = allNotes.length;
    const totalWords = allNotes.reduce(
      (acc, note) => acc + getWordCount(note),
      0,
    );
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

  if (isLoading || !hasFetched) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-muted-foreground mt-4">প্রোফাইল লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition
      className={cn(
        "min-h-screen bg-gradient-to-br from-background via-background to-muted/30",
        font,
      )}
    >
      <div className="container mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <StaggerContainer className="space-y-8 lg:space-y-12">
          <StaggerItem>
            <ProfileOverview stats={stats} />
          </StaggerItem>

          <StaggerItem>
            <QuickAccess stats={stats} />
          </StaggerItem>

          <StaggerItem>
            <SettingsComponent />
          </StaggerItem>

          <StaggerItem>
            <Card className="bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-xl border border-border/50 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="pb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                <CardTitle className="relative z-10 flex items-center gap-3 text-xl font-bold">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-accent/15 border border-primary/20">
                    <Icons.Info className="h-5 w-5 text-primary" />
                  </div>
                  অ্যাপলিকেশন তথ্য
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 space-y-4 text-sm">
                <div className="flex items-center justify-between rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm p-4 transition-all duration-300 hover:bg-background/80">
                  <span className="text-muted-foreground font-medium">
                    ডেভেলপার
                  </span>
                  <a 
                    href="https://frostfoe.netlify.app" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-bold text-foreground hover:text-primary transition-colors duration-200 hover:underline"
                  >
                    FrostFoe
                  </a>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm p-4 transition-all duration-300 hover:bg-background/80">
                  <span className="text-muted-foreground font-medium">
                    প্রকাশক
                  </span>
                  <span className="font-bold text-foreground">MNR World</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm p-4 transition-all duration-300 hover:bg-background/80">
                  <span className="text-muted-foreground font-medium">
                    সংস্করণ
                  </span>
                  <Badge
                    variant="outline"
                    className="font-mono font-bold bg-primary/10 border-primary/30 text-primary"
                  >
                    v1.0.0
                  </Badge>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm p-4 transition-all duration-300 hover:bg-background/80">
                  <span className="text-muted-foreground font-medium">
                    লাইসেন্স
                  </span>
                  <Badge variant="secondary" className="font-medium">
                    MIT
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerContainer>
      </div>

      <div className="pb-16 lg:pb-8"></div>
    </PageTransition>
  );
}
