"use client";

import { useEffect, useState, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNotesStore } from "@/stores/use-notes";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/use-settings";
import { Trash2, Undo } from "lucide-react";
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

const EmptyTrashState = () => {
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
      rotate: [0, -5, 5, 0],
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
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-rose-500/5 rounded-2xl" />
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,_theme(colors.red.500)_1px,_transparent_0)] bg-[length:24px_24px] opacity-20" />
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
          className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-red-500/20 to-rose-500/20 backdrop-blur-sm border border-red-500/30 shadow-lg"
        >
          <Trash2 className="h-12 w-12 text-red-500" />
        </motion.div>
        <motion.h2
          className="text-3xl font-bold tracking-tight bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          ট্র্যাশ খালি
        </motion.h2>
        <motion.p
          className="max-w-md text-lg text-muted-foreground leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          আপনি যখন কোনো নোট ডিলিট করবেন, তখন সেটি এখানে নিরাপদে রাখা হবে।
        </motion.p>
      </motion.div>
    </motion.div>
  );
};
EmptyTrashState.displayName = "EmptyTrashState";

const TrashedNoteItemComponent = ({
  note,
  onRestore,
  onDelete,
}: {
  note: Note;
  onRestore: (id: string) => void;
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
      className="flex flex-col rounded-lg p-4 transition-colors hover:bg-accent sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="mb-4 flex-1 sm:mb-0">
        <h3 className="font-semibold text-foreground">
          {note.title || "শিরোনামহীন নোট"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {formattedDate ? `ডিলিট করা হয়েছে: ${formattedDate}` : <>&nbsp;</>}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRestore(note.id)}
          aria-label="Restore note"
        >
          <Undo className="h-5 w-5" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              aria-label="Delete permanently"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>আপনি কি নিশ্চিত?</AlertDialogTitle>
              <AlertDialogDescription>
                এই নোটটি স্থায়ীভাবে ডিলিট করা হবে। এই ক্রিয়াটি বাতিল করা যাবে
                না।
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>বাতিল করুন</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(note.id)}
                className="bg-destructive hover:bg-destructive/90"
              >
                স্থায়ীভাবে ডিলিট করুন
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </motion.div>
  );
};
TrashedNoteItemComponent.displayName = "TrashedNoteItem";
const TrashedNoteItem = memo(TrashedNoteItemComponent);

const TrashPageSkeleton = () => (
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
TrashPageSkeleton.displayName = "TrashPageSkeleton";

export default function TrashPage() {
  const font = useSettingsStore((state) => state.font);

  const trashedNotes = useNotesStore((state) => state.trashedNotes);
  const fetchTrashedNotes = useNotesStore((state) => state.fetchTrashedNotes);
  const restoreNote = useNotesStore((state) => state.restoreNote);
  const deleteNotePermanently = useNotesStore(
    (state) => state.deleteNotePermanently,
  );
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    fetchTrashedNotes();
    setIsClient(true);
  }, [fetchTrashedNotes]);

  const handleRestore = async (id: string) => {
    try {
      await restoreNote(id);
    } catch (error) {
      console.error("Failed to restore note.", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotePermanently(id);
    } catch (error) {
      console.error("Failed to delete note permanently.", error);
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
    return <TrashPageSkeleton />;
  }

  return (
    <div
      className={cn(
        "min-h-screen bg-gradient-to-br from-background via-background/95 to-red-500/5",
        font.split(" ")[0],
      )}
    >
      {/* Floating background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -right-20 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"
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
          className="absolute -bottom-20 -left-20 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl"
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

      {/* Content Section */}
      <div className="container mx-auto max-w-4xl px-4 py-6 md:px-6 lg:py-8 relative z-10">
        {trashedNotes.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Enhanced Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8"
            >
              <motion.div
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-red-500/20 to-rose-500/20 backdrop-blur-sm border border-red-500/30 mb-4"
                whileHover={{ scale: 1.05, rotate: -5 }}
                transition={{ duration: 0.2 }}
              >
                <Trash2 className="h-8 w-8 text-red-500" />
              </motion.div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent mb-2">
                ট্র্যাশ সংগ্রহ
              </h1>
              <p className="text-muted-foreground max-w-md mx-auto">
                মুছে ফেলা নোটগুলো পুনরুদ্ধার করুন বা স্থায়ীভাবে সরিয়ে দিন
              </p>
            </motion.div>

            <Card className="overflow-hidden backdrop-blur-xl bg-white/5 border-red-500/20 shadow-2xl">
              <CardHeader className="pb-4 bg-gradient-to-r from-red-500/10 to-rose-500/10">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500/20 to-rose-500/20 flex items-center justify-center">
                    <Trash2 className="h-5 w-5 text-red-500" />
                  </div>
                  ডিলিট করা নোটসমূহ ({trashedNotes.length})
                </CardTitle>
                <CardDescription className="text-base">
                  নোট পুনরুদ্ধার করতে বা স্থায়ীভাবে মুছতে প্রয়োজনীয় বোতাম
                  ব্যবহার করুন
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-red-500/10">
                  <AnimatePresence>
                    {trashedNotes.map((note) => (
                      <TrashedNoteItem
                        key={note.id}
                        note={note}
                        onRestore={handleRestore}
                        onDelete={handleDelete}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <EmptyTrashState />
        )}
      </div>

      {/* Bottom spacing for mobile navigation */}
      <div className="pb-16 lg:pb-8" />
    </div>
  );
}
