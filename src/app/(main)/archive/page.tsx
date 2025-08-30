"use client";

import { useEffect, useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNotesStore } from "@/stores/use-notes";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/use-settings";
import { Archive, Trash2, Undo, Home, Clock, Tag } from "lucide-react";
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
import { formatDistanceToNow } from "date-fns";
import { bn } from "date-fns/locale";
import { Note } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

const EmptyArchiveState = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0, rotateY: 180 }}
        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: "backOut" }}
        className="relative mb-8"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse" />
        <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-muted/80 to-muted/40 backdrop-blur-sm border border-border/50 shadow-2xl">
          <Archive className="h-16 w-16 text-muted-foreground drop-shadow-lg" />
        </div>
      </motion.div>
      
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="space-y-4 max-w-md"
      >
        <h2 className="text-4xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          আর্কাইভ খালি
        </h2>
        
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-transparent rounded-lg blur-sm" />
          <p className="relative text-lg text-muted-foreground leading-relaxed px-4 py-2">
            আর্কাইভ করা নোট এখানে থাকে। গুরুত্বপূর্ণ নোট সংরক্ষণ করতে আর্কাইভ ব্যবহার করুন এবং পরে দরকার মতো ব্যবহার করুন।
          </p>
        </div>
      </motion.div>
      
      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="flex flex-col sm:flex-row gap-4 mt-8"
      >
        <Link href="/">
          <Button 
            variant="outline" 
            className="group border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 px-6 py-3"
          >
            <Home className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            মূল পৃষ্ঠা
          </Button>
        </Link>
        <Link href="/trash">
          <Button 
            variant="default" 
            className="group bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 px-6 py-3"
          >
            <Trash2 className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            ট্র্যাশ দেখুন
          </Button>
        </Link>
      </motion.div>
    </motion.div>
  );
};
EmptyArchiveState.displayName = "EmptyArchiveState";

const ArchivedNoteItemComponent = ({
  note,
  onUnarchive,
  onDelete,
  isLoading,
  index = 0,
}: {
  note: Note;
  onUnarchive: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
  index?: number;
}) => {
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    setFormattedDate(
      formatDistanceToNow(new Date(note.updatedAt), {
        addSuffix: true,
        locale: bn,
      }),
    );
  }, [note.updatedAt]);

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        delay: index * 0.08,
        ease: "easeOut"
      }
    }),
    exit: {
      opacity: 0,
      x: -30,
      scale: 0.95,
      transition: { duration: 0.3, ease: "easeIn" }
    }
  };

  return (
    <motion.div
      layout
      custom={index}
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="group relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-r from-background/80 to-background/40 p-5 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            {(note as any).emoji && (
              <motion.span 
                className="text-2xl drop-shadow-sm"
                whileHover={{ scale: 1.2, rotate: 10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {(note as any).emoji}
              </motion.span>
            )}
            <h3 className="font-bold text-lg text-foreground truncate group-hover:text-primary transition-colors">
              {note.title || "শিরোনামহীন"}
            </h3>
          </div>
          
          {note.content && (
            <p className="text-sm text-muted-foreground/80 mb-3 line-clamp-2 leading-relaxed">
              {typeof (note.content as any) === 'string' 
                ? (note.content as any).replace(/[#*`_~]/g, '').slice(0, 150) + '...'
                : 'নোট কনটেন্ট'
              }
            </p>
          )}
          
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-2 text-muted-foreground/70 bg-muted/30 px-2 py-1 rounded-md">
              <div className="w-2 h-2 rounded-full bg-blue-400/60" />
              <Clock className="w-3 h-3" />
              {formattedDate ? `আর্কাইভ: ${formattedDate}` : <>&nbsp;</>}
            </span>
            {(note as any).tags && (note as any).tags.length > 0 && (
              <span className="flex items-center gap-1 text-muted-foreground/70 bg-primary/10 px-2 py-1 rounded-md">
                <Tag className="w-3 h-3" />
                {(note as any).tags.length} ট্যাগ
              </span>
            )}
          </div>
        </div>
        
        <div className="flex shrink-0 items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUnarchive(note.id)}
            disabled={isLoading}
            className="group/btn border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950/50 transition-all duration-200 hover:scale-105"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
            ) : (
              <>
                <Undo className="h-4 w-4 mr-1 group-hover/btn:scale-110 transition-transform" />
                পুনরুদ্ধার
              </>
            )}
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="group/btn border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/50 transition-all duration-200 hover:scale-105"
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 mr-1 group-hover/btn:scale-110 transition-transform" />
                মুছুন
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-destructive">
                  আপনি কি নিশ্চিত?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  নোটটি স্থায়ীভাবে মুছে যাবে, এটি ফেরানো যাবে না।
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isLoading}>বাতিল</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(note.id)}
                  className="bg-destructive hover:bg-destructive/90"
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
};
ArchivedNoteItemComponent.displayName = "ArchivedNoteItem";
const ArchivedNoteItem = memo(ArchivedNoteItemComponent);

const ArchivePageSkeleton = () => (
  <div className="space-y-6 px-4 py-6 md:px-6 lg:py-8">
    <div className="space-y-2">
      <Skeleton className="h-9 w-1/4" />
      <Skeleton className="h-6 w-1/2" />
    </div>
    <div className="mt-8 space-y-4">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
  </div>
);
ArchivePageSkeleton.displayName = "ArchivePageSkeleton";

export default function ArchivePage() {
  const font = useSettingsStore((state: any) => state.font);

  const archivedNotes = useNotesStore((state: any) => state.archivedNotes);
  const fetchArchivedNotes = useNotesStore((state: any) => state.fetchArchivedNotes);
  const unarchiveNote = useNotesStore((state: any) => state.unarchiveNote);
  const deleteNotePermanently = useNotesStore(
    (state: any) => state.deleteNotePermanently,
  );
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadArchivedNotes = async () => {
      setIsLoading(true);
      try {
        await fetchArchivedNotes();
      } catch (error) {
        console.error("Failed to fetch archived notes:", error);
      } finally {
        setIsLoading(false);
        setIsClient(true);
      }
    };
    loadArchivedNotes();
  }, [fetchArchivedNotes]);

  const handleUnarchive = async (id: string) => {
    setIsLoading(true);
    try {
      await unarchiveNote(id);
      // Refresh the archived notes list
      await fetchArchivedNotes();
    } catch (error) {
      console.error("Failed to unarchive note:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      await deleteNotePermanently(id);
      // Refresh the archived notes list
      await fetchArchivedNotes();
    } catch (error) {
      console.error("Failed to delete note permanently:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClient) {
    return <ArchivePageSkeleton />;
  }

  return (
    <div className={cn(
      "flex-1 overflow-y-auto bg-gradient-to-br from-background via-background/95 to-accent/5", 
      font.split(" ")[0]
    )}>
      <div className="container mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">
        {archivedNotes.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <motion.div 
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative mb-8"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-purple-500/10 rounded-2xl blur-xl" />
              <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-lg">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent mb-3">
                  📚 আর্কাইভ
                </h1>
                <p className="text-muted-foreground text-lg">
                  সংরক্ষিত নোট পুনরুদ্ধার বা মুছুন।
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Card className="bg-card/70 backdrop-blur-xl border-border/50 shadow-2xl overflow-hidden">
                <motion.div
                  initial={{ backgroundPosition: "0% 50%" }}
                  animate={{ backgroundPosition: "100% 50%" }}
                  transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 bg-[length:200%_100%]"
                />
                <CardHeader className="relative pb-6">
                  <CardTitle className="flex items-center gap-4 text-2xl">
                    <motion.div 
                      className="w-12 h-12 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center shadow-lg"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Archive className="h-6 w-6 text-muted-foreground" />
                    </motion.div>
                    <div>
                      <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                        আর্কাইভ করা নোট ({archivedNotes.length})
                      </span>
                      {isLoading && (
                        <motion.div 
                          className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin ml-3"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring" }}
                        />
                      )}
                    </div>
                  </CardTitle>
                  
                  <CardDescription className="text-muted-foreground text-base mt-2">
                    নোট পুনরুদ্ধার বা মুছতে বোতাম ব্যবহার করুন।
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="p-6">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-4"
                  >
                    <AnimatePresence mode="popLayout">
                      {archivedNotes.map((note: any, index: number) => (
                        <ArchivedNoteItem
                          key={note.id}
                          note={note}
                          onUnarchive={handleUnarchive}
                          onDelete={handleDelete}
                          isLoading={isLoading}
                          index={index}
                        />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        ) : (
          <EmptyArchiveState />
        )}
      </div>
    </div>
  );
}
