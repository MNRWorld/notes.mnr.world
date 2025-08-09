
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNotesStore } from "@/stores/use-notes";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/use-settings";
import { Trash2, RotateCcw } from "lucide-react";
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
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { bn } from "date-fns/locale";
import EmptyTrashState from "./_components/empty-trash-state";
import { Note } from "@/lib/types";

const TrashedNoteItem = ({
  note,
  onRestore,
  onDelete,
}: {
  note: Note;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  const [formattedDate, setFormattedDate] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (note.updatedAt && isClient) {
      setFormattedDate(
        formatDistanceToNow(new Date(note.updatedAt), {
          addSuffix: true,
          locale: bn,
        }),
      );
    }
  }, [note.updatedAt, isClient]);

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      key={note.id}
      layout
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex flex-col rounded-lg border p-4 transition-colors hover:bg-accent sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="mb-4 flex-1 sm:mb-0">
        <h3 className="font-semibold text-foreground">
          {note.title || "শিরোনামহীন নোট"}
        </h3>
        <p className="text-sm text-muted-foreground">
          ট্র্যাশে পাঠানো হয়েছে: {formattedDate}
        </p>
      </div>
      <div className="flex items-center gap-2 self-end sm:self-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRestore(note.id)}
          aria-label="Restore note"
        >
          <RotateCcw className="h-5 w-5" />
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

export default function TrashPage() {
  const font = useSettingsStore((state) => state.font);

  const trashedNotes = useNotesStore((state) => state.trashedNotes);
  const fetchTrashedNotes = useNotesStore((state) => state.fetchTrashedNotes);
  const restoreNote = useNotesStore((state) => state.restoreNote);
  const deleteNotePermanently = useNotesStore(
    (state) => state.deleteNotePermanently,
  );

  useEffect(() => {
    fetchTrashedNotes();
  }, [fetchTrashedNotes]);

  const handleRestore = async (id: string) => {
    try {
      await restoreNote(id);
      toast.success("নোটটি পুনরুদ্ধার করা হয়েছে!");
    } catch (error) {
      toast.error("নোটটি পুনরুদ্ধার করতে ব্যর্থ হয়েছে।");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotePermanently(id);
      toast.success("নোটটি স্থায়ীভাবে ডিলিট করা হয়েছে।");
    } catch (error) {
      toast.error("নোটটি স্থায়ীভাবে ডিলিট করতে ব্যর্থ হয়েছে।");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div
      className={cn(
        "space-y-6 p-4 sm:p-6 lg:p-8",
        font.split(" ")[0],
      )}
    >
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1
          className={cn(
            "text-2xl font-bold tracking-tight text-foreground sm:text-3xl",
            font.split(" ")[0],
          )}
        >
          ট্র্যাশ
        </h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          ডিলিট করা নোটগুলো এখানে ৩০ দিন পর্যন্ত থাকবে।
        </p>
      </motion.header>

      {trashedNotes.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
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
        </motion.div>
      ) : (
        <EmptyTrashState />
      )}
    </div>
  );
}
