"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/use-settings";
import { Icons } from "@/components/ui/icons";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/bn";
dayjs.extend(relativeTime);
dayjs.locale("bn");
import { Note } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import PageTransition from "@/components/page-transition";

type PageType = "archive" | "trash";

interface NoteManagementPageProps {
  pageType: PageType;
  notes: Note[];
  onRestore: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onRestoreAll?: () => Promise<void>;
  onDeleteAll?: () => Promise<void>;
  isLoading: boolean;
}

const EmptyState = memo(({ pageType }: { pageType: PageType }) => {
  const config = {
    archive: {
      icon: Icons.Archive,
      title: "আর্কাইভ খালি",
      description: "আর্কাইভ করা নোট এখানে প্রদর্শিত হবে।",
    },
    trash: {
      icon: Icons.Trash,
      title: "ট্র্যাশ খালি",
      description: "মুছে ফেলা নোট এখানে পাওয়া যাবে।",
    },
  };
  const current = config[pageType];
  const Icon = current.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.2,
        }}
        className="relative mb-8"
      >
        <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-muted/80 to-muted/40 backdrop-blur-sm border border-border/50 shadow-2xl">
          <Icon className="h-16 w-16 text-muted-foreground drop-shadow-lg" />
        </div>
      </motion.div>
      <div className="space-y-4 max-w-md">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          {current.title}
        </h2>
        <p className="relative text-lg text-muted-foreground leading-relaxed px-4 py-2">
          {current.description}
        </p>
      </div>
      <Link href="/" passHref>
        <Button variant="outline" className="mt-8">
          <Icons.Home className="w-5 h-5 mr-2" />
          হোম পেজে ফিরুন
        </Button>
      </Link>
    </motion.div>
  );
});
EmptyState.displayName = "EmptyState";

const NoteItem = memo(
  ({
    note,
    onRestore,
    onDelete,
    isLoading,
    index = 0,
  }: {
    note: Note;
    onRestore: (id: string) => void;
    onDelete: (id: string) => void;
    isLoading: boolean;
    index?: number;
  }) => {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: 0.5,
            delay: index * 0.05,
            ease: [0.25, 1, 0.5, 1],
          },
        }}
        exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
        className="group relative overflow-hidden rounded-xl border bg-card/80 p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-md"
      >
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-foreground truncate group-hover:text-primary transition-colors">
              {note.title || "শিরোনামহীন"}
            </h3>
            <p className="text-sm text-muted-foreground/80 my-2 line-clamp-2 leading-relaxed">
              {note.content?.blocks?.[0]?.data.text || "No content"}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <Icons.Clock className="w-3 h-3" />
              <span>{dayjs(note.updatedAt).fromNow()}</span>
              {note.tags && note.tags.length > 0 && (
                <span className="flex items-center gap-1">
                  <Icons.Tag className="w-3 h-3" />
                  {note.tags.length} ট্যাগ
                </span>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRestore(note.id)}
              disabled={isLoading}
              aria-label="Restore note"
            >
              <Icons.RotateCcw className="h-4 w-4 mr-1" />
              পুনরুদ্ধার
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isLoading}
                  aria-label="Delete note permanently"
                >
                  <Icons.Trash className="h-4 w-4 mr-1" />
                  মুছুন
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>আপনি কি নিশ্চিত?</AlertDialogTitle>
                  <AlertDialogDescription>
                    নোটটি স্থায়ীভাবে মুছে যাবে এবং ফেরানো যাবে না।
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isLoading}>
                    বাতিল
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(note.id)}
                    disabled={isLoading}
                  >
                    {isLoading ? "মুছে ফেলা হচ্ছে..." : "মুছে ফেলুন"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </motion.div>
    );
  },
);
NoteItem.displayName = "NoteItem";

const PageSkeleton = () => (
  <div className="space-y-6 px-4 py-6 md:px-6 lg:py-8">
    <div className="space-y-2">
      <Skeleton className="h-9 w-1/4" />
      <Skeleton className="h-6 w-1/2" />
    </div>
    <div className="mt-8 space-y-4">
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-xl" />
      ))}
    </div>
  </div>
);
PageSkeleton.displayName = "PageSkeleton";

function NoteManagementPageComponent({
  pageType,
  notes,
  onRestore,
  onDelete,
  onRestoreAll,
  onDeleteAll,
  isLoading,
}: NoteManagementPageProps) {
  const { font } = useSettingsStore();

  const config = {
    archive: {
      title: "আর্কাইভ",
      icon: Icons.Archive,
      description: "সংরক্ষিত নোট পুনরুদ্ধার বা স্থায়ীভাবে মুছুন।",
    },
    trash: {
      title: "ট্র্যাশ",
      icon: Icons.Trash,
      description: "মুছে ফেলা নোট পুনরুদ্ধার বা স্থায়ীভাবে সরান।",
    },
  };

  const current = config[pageType];
  const Icon = current.icon;

  if (isLoading && notes.length === 0) {
    return <PageSkeleton />;
  }

  return (
    <PageTransition className={cn("flex-1 overflow-y-auto", font)}>
      <div className="container mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">
        {notes.length > 0 ? (
          <div className="space-y-8">
            <Card className="bg-card/70 backdrop-blur-xl border-border/50 shadow-lg">
              <CardHeader className="relative pb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Icon className="h-6 w-6 text-muted-foreground" />
                    <div>
                      <CardTitle>{current.title}</CardTitle>
                      <CardDescription>{current.description}</CardDescription>
                    </div>
                  </div>
                  {pageType === "trash" && onDeleteAll && onRestoreAll && (
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onRestoreAll}
                        disabled={isLoading}
                      >
                        <Icons.RotateCcw className="w-4 h-4 mr-2" />
                        সব পুনরুদ্ধার
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={isLoading}
                          >
                            <Icons.Trash className="w-4 h-4 mr-2" />
                            ট্র্যাশ খালি করুন
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              ট্র্যাশ খালি করবেন?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              ট্র্যাশে থাকা সব নোট ({notes.length} টি)
                              স্থায়ীভাবে মুছে যাবে।
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={isLoading}>
                              বাতিল
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={onDeleteAll}
                              disabled={isLoading}
                            >
                              {isLoading ? "খালি হচ্ছে..." : "নিশ্চিত করুন"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <AnimatePresence>
                    {notes.map((note, index) => (
                      <NoteItem
                        key={note.id}
                        note={note}
                        onRestore={onRestore}
                        onDelete={onDelete}
                        isLoading={isLoading}
                        index={index}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <EmptyState pageType={pageType} />
        )}
      </div>
      <div className="pb-16 lg:pb-8" />
    </PageTransition>
  );
}

const NoteManagementPage = memo(NoteManagementPageComponent);
export default NoteManagementPage;
