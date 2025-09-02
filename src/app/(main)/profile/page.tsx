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
import ProfileOverview from "@/components/profile/profile-overview";
import QuickAccess from "@/components/profile/quick-access";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const SettingsComponent = dynamic(
  () => import("@/components/profile/settings-component"),
  {
    loading: () => (
      <div className="h-48 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    ),
    ssr: false,
  },
);

const getWordCount = (note: Note): number => {
  if (!note.content || !note.content.blocks) return 0;
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
            <div className="relative mb-8">
              {/* Background decorative elements */}
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-xl opacity-60" />
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-xl opacity-40" />

              <div className="relative z-10 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent/15 border border-primary/20 shadow-lg">
                  <Icons.User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                    প্রোফাইল ও সেটিংস
                  </h1>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    আপনার লেখার পরিসংখ্যান এবং অ্যাপ কাস্টমাইজেশন
                  </p>
                </div>
              </div>
            </div>
          </StaggerItem>

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
                    তৈরি করেছেন
                  </span>
                  <span className="font-bold text-foreground">FrostFoe</span>
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
    </PageTransition>
  );
}
