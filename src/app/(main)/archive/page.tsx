"use client";

import { useEffect, useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNotesStore } from "@/stores/use-notes";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/use-settings";
import { Archive, Trash2, Undo } from "lucide-react";
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
  const iconVariants = {
    hidden: { scale: 0.8, opacity: 0, rotate: -15 },
    visible: {
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.2,
      },
    },
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex min-h-[60vh] flex-col items-center justify-center rounded-2xl p-12 text-center relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-amber-500/5 rounded-2xl" />
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,_theme(colors.orange.500)_1px,_transparent_0)] bg-[length:24px_24px] opacity-20" />
      </div>

      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="relative z-10"
      >
        <motion.div
          variants={iconVariants}
          initial="hidden"
          animate="visible"
          className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/20 backdrop-blur-sm border border-orange-500/30 shadow-lg"
        >
          <Archive className="h-12 w-12 text-orange-500" />
        </motion.div>
        <motion.h2
          className="text-3xl font-bold tracking-tight bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          আর্কাইভ খালি
        </motion.h2>
        <motion.p
          className="max-w-md text-lg text-muted-foreground leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          আর্কাইভ করা নোটগুলো এখানে থাকবে।
        </motion.p>
      </motion.div>
    </motion.div>
  );
};
EmptyArchiveState.displayName = "EmptyArchiveState";

const ArchivedNoteItemComponent = ({
  note,
  onUnarchive,
  onDelete,
}: {
  note: Note;
  onUnarchive: (id: string) => void;
  onDelete: (id: string) => void;
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
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      key={note.id}
      layout
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group flex flex-col rounded-xl p-5 transition-all duration-300 hover:bg-orange-500/5 border-l-4 border-l-orange-500/20 hover:border-l-orange-500/40 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="mb-4 flex-1 sm:mb-0">
        <motion.h3
          className="font-semibold text-foreground group-hover:text-orange-600 transition-colors duration-200 mb-1"
          whileHover={{ x: 5 }}
          transition={{ duration: 0.2 }}
        >
          {note.title || "শিরোনামহীন"}
        </motion.h3>
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-orange-500/60" />
          {formattedDate ? `আর্কাইভ করা: ${formattedDate}` : <>&nbsp;</>}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3 self-end sm:self-center">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onUnarchive(note.id)}
            aria-label="পুনরুদ্ধার করুন"
            className="h-9 w-9 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-600 hover:text-green-700 border border-green-500/20"
          >
            <Undo className="h-4 w-4" />
          </Button>
        </motion.div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 hover:text-red-700 border border-red-500/20"
                aria-label="স্থায়ীভাবে মুছুন"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </motion.div>
          </AlertDialogTrigger>
          <AlertDialogContent className="backdrop-blur-xl bg-white/10 border-red-500/20">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-600">
                আপনি কি নিশ্চিত?
              </AlertDialogTitle>
              <AlertDialogDescription>
                নোটটি স্থায়ীভাবে মুছে ফেলা হবে। এটি ফেরানো যাবে না।
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>বাতিল</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(note.id)}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                স্থায়ীভাবে মুছুন
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
  const font = useSettingsStore((state) => state.font);

  const archivedNotes = useNotesStore((state) => state.archivedNotes);
  const fetchArchivedNotes = useNotesStore((state) => state.fetchArchivedNotes);
  const unarchiveNote = useNotesStore((state) => state.unarchiveNote);
  const deleteNotePermanently = useNotesStore(
    (state) => state.deleteNotePermanently,
  );
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    fetchArchivedNotes();
    setIsClient(true);
  }, [fetchArchivedNotes]);

  const handleUnarchive = async (id: string) => {
    try {
      await unarchiveNote(id);
    } catch (error) {
      console.error("নোটটি আনআর্কাইভ করা যায়নি।", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotePermanently(id);
    } catch (error) {
      console.error("নোটটি স্থায়ীভাবে মোছা যায়নি।", error);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
      },
    },
  };

  if (!isClient) {
    return <ArchivePageSkeleton />;
  }

  return (
    <div
      className={cn(
        "min-h-screen bg-gradient-to-br from-background via-background/95 to-orange-500/5",
        font.split(" ")[0],
      )}
    >
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -right-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-6 md:px-6 lg:py-8 relative z-10">
        {archivedNotes.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8"
            >
              <motion.div
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/20 backdrop-blur-sm border border-orange-500/30 mb-4"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <Archive className="h-8 w-8 text-orange-500" />
              </motion.div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
                আর্কাইভ
              </h1>
              <p className="text-muted-foreground max-w-md mx-auto">
                সংরক্ষিত নোট পুনরুদ্ধার বা স্থায়ীভাবে মুছুন।
              </p>
            </motion.div>

            <Card className="overflow-hidden backdrop-blur-xl bg-white/5 border-orange-500/20 shadow-2xl">
              <CardHeader className="pb-4 bg-gradient-to-r from-orange-500/10 to-amber-500/10">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center">
                    <Archive className="h-5 w-5 text-orange-500" />
                  </div>
                  আর্কাইভ করা নোট ({archivedNotes.length})
                </CardTitle>
                <CardDescription className="text-base">
                  নোট পুনরুদ্ধার বা মুছতে বোতাম ব্যবহার করুন।
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-orange-500/10">
                  <AnimatePresence>
                    {archivedNotes.map((note) => (
                      <ArchivedNoteItem
                        key={note.id}
                        note={note}
                        onUnarchive={handleUnarchive}
                        onDelete={handleDelete}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <EmptyArchiveState />
        )}
      </div>

      <div className="pb-16 lg:pb-8" />
    </div>
  );
}
