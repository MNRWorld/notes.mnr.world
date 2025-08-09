
"use client";

import React, { memo, useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { bn } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal
} from "@/components/ui/dropdown-menu";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Note } from "@/lib/types";
import { getTextFromEditorJS, cn, calculateReadingTime, isLucideIcon } from "@/lib/utils";
import { useSettingsStore } from "@/stores/use-settings";
import { useNotesStore } from "@/stores/use-notes";
import {
  MoreVertical,
  Edit,
  Trash2,
  Pin,
  PinOff,
  Tag,
  Lock,
  Unlock,
  Clock,
  Download,
  CheckSquare,
  ImageIcon,
  Archive,
  History,
  FileText,
  BookMarked,
  FileJson
} from "lucide-react";
import * as Lucide from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Progress } from "@/components/ui/progress";
import { getNoteAsMarkdown, downloadFile } from "@/lib/storage";

const ManageTagsDialog = dynamic(() => import("./manage-tags-dialog"), {
  ssr: false,
});
const IconPickerDialog = dynamic(() => import("./icon-picker-dialog"), {
  ssr: false,
});
const VersionHistoryDialog = dynamic(() => import("./version-history-dialog"), {
  ssr: false,
});

interface NoteCardProps {
  note: Note;
  onUnlock: (noteId: string, callback: () => void) => void;
}

function NoteCardComponent({ note, onUnlock }: NoteCardProps) {
  const font = useSettingsStore((state) => state.font);
  const { deleteNotePermanently, updateNote, togglePin, notes, archiveNote } = useNotesStore();
  const fontClass = font.split(" ")[0];

  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [newTitle, setNewTitle] = useState(note.title);
  const [formattedDate, setFormattedDate] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const readingTime = useMemo(() => calculateReadingTime(note), [note]);

  const checklistStats = useMemo(() => {
    if (note.isLocked || !note.content?.blocks) return null;
    const checklistBlocks = note.content.blocks.filter(
      (block) => block.type === "checklist",
    );
    if (checklistBlocks.length === 0) return null;

    let totalItems = 0;
    let checkedItems = 0;
    checklistBlocks.forEach((block) => {
      totalItems += block.data.items.length;
      checkedItems += block.data.items.filter(
        (item: { checked: boolean }) => item.checked,
      ).length;
    });

    if (totalItems === 0) return null;

    return {
      total: totalItems,
      checked: checkedItems,
      progress: (checkedItems / totalItems) * 100,
    };
  }, [note.isLocked, note.content]);

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

  const contentPreview = useMemo(() => {
    if (note.isLocked) return "এই নোটটি লক করা আছে।";
    if (!note.content) return "";
    const text = getTextFromEditorJS(note.content);
    return text.substring(0, 100) + (text.length > 100 ? "..." : "");
  }, [note.content, note.isLocked]);

  const handleDelete = useCallback(() => {
    deleteNotePermanently(note.id);
    toast.success("নোটটি স্থায়ীভাবে ডিলিট করা হয়েছে।");
  }, [note.id, deleteNotePermanently]);

  const handleArchive = useCallback(() => {
    archiveNote(note.id);
    toast.success("নোটটি আর্কাইভ করা হয়েছে।");
  }, [note.id, archiveNote]);

  const handleTogglePin = useCallback(() => {
    const pinnedNotesCount = notes.filter((n) => n.isPinned).length;
    if (!note.isPinned && pinnedNotesCount >= 3) {
      toast.error("আপনি সর্বোচ্চ ৩টি নোট পিন করতে পারবেন।");
      return;
    }
    togglePin(note.id);
    toast.success(
      note.isPinned ? "নোটটি আনপিন করা হয়েছে।" : "নোটটি পিন করা হয়েছে।",
    );
  }, [note.id, note.isPinned, togglePin, notes]);

  const handleToggleLock = useCallback(() => {
    onUnlock(note.id, () => {
      updateNote(note.id, { isLocked: !note.isLocked });
      toast.success(
        note.isLocked ? "নোটটি আনলক করা হয়েছে।" : "নোটটি লক করা হয়েছে।",
      );
    });
  }, [note.id, note.isLocked, onUnlock, updateNote]);

  const handleRename = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newTitle.trim()) {
        toast.error("শিরোনাম খালি রাখা যাবে না।");
        return;
      }
      try {
        await updateNote(note.id, { title: newTitle });
        setIsRenameOpen(false);
        toast.success("নোট রিনেম করা হয়েছে।");
      } catch (error) {
        toast.error("নোট রিনেম করতে ব্যর্থ হয়েছে।");
      }
    },
    [newTitle, note.id, updateNote],
  );

  const handleExportToPDF = useCallback(() => {
    if (note.isLocked) {
      toast.error("লক করা নোট এক্সপোর্ট করা যাবে না।");
      return;
    }

    const tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.left = "-9999px";
    tempContainer.style.width = "800px";
    tempContainer.style.padding = "20px";
    tempContainer.className = `prose dark:prose-invert ${fontClass}`;

    let htmlContent = "";
    note.content?.blocks.forEach((block: any) => {
      switch (block.type) {
        case "header":
          htmlContent += `<h${block.data.level}>${block.data.text}</h${block.data.level}>`;
          break;
        case "paragraph":
          htmlContent += `<p>${block.data.text}</p>`;
          break;
        case "list":
          const listTag = block.data.style === "ordered" ? "ol" : "ul";
          htmlContent += `<${listTag}>${block.data.items
            .map((item: string) => `<li>${item}</li>`)
            .join("")}</${listTag}>`;
          break;
        case "quote":
          htmlContent += `<blockquote>${block.data.text}</blockquote>`;
          break;
        case "checklist":
          htmlContent += `<div>${block.data.items
            .map(
              (item: { text: string; checked: boolean }) =>
                `<div><input type="checkbox" ${item.checked ? "checked" : ""} disabled> ${item.text}</div>`,
            )
            .join("")}</div>`;
          break;
        case "inlineCode":
          htmlContent += `<code>${block.data.code}</code>`;
          break;
        case "code":
          htmlContent += `<pre><code>${block.data.code}</code></pre>`;
          break;
        default:
          break;
      }
    });

    tempContainer.innerHTML = htmlContent;
    document.body.appendChild(tempContainer);

    toast.info("পিডিএফ তৈরি করা হচ্ছে...");

    html2canvas(tempContainer, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
    }).then((canvas) => {
      document.body.removeChild(tempContainer);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;
      const imgWidth = pdfWidth - 40;
      const imgHeight = imgWidth / ratio;

      let heightLeft = imgHeight;
      let position = 20;

      pdf.addImage(imgData, "PNG", 20, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 20, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`${note.title || "Untitled Note"}.pdf`);
      toast.success("পিডিএফ সফলভাবে ডাউনলোড হয়েছে!");
    });
  }, [note, fontClass]);

  const handleExportAsMarkdown = () => {
    if (note.isLocked) {
      toast.error("লক করা নোট এক্সপোর্ট করা যাবে না।");
      return;
    }
    const markdownContent = getNoteAsMarkdown(note);
    downloadFile(markdownContent, `${note.title || "Untitled"}.md`, "text/markdown");
    toast.success("মার্কডাউন ফাইল ডাউনলোড হয়েছে!");
  }

  const handleExportAsTxt = () => {
    if (note.isLocked) {
      toast.error("লক করা নোট এক্সপোর্ট করা যাবে না।");
      return;
    }
    const textContent = getTextFromEditorJS(note.content);
    downloadFile(textContent, `${note.title || "Untitled"}.txt`, "text/plain");
    toast.success("টেক্সট ফাইল ডাউনলোড হয়েছে!");
  }

  const handleExportAsJson = () => {
    if (note.isLocked) {
      toast.error("লক করা নোট এক্সপোর্ট করা যাবে না।");
      return;
    }
    const jsonContent = JSON.stringify(note, null, 2);
    downloadFile(jsonContent, `${note.title || "Untitled"}.json`, "application/json");
    toast.success("JSON ফাইল ডাউনলোড হয়েছে!");
  }


  const cardVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, scale: 0.5, transition: { duration: 0.3 } },
  };

  const cardLink = note.isLocked ? "#" : `/editor?noteId=${note.id}`;
  const onCardClick = note.isLocked
    ? (e: React.MouseEvent) => {
        e.preventDefault();
        onUnlock(note.id, () => {});
      }
    : undefined;

  const NoteIcon = () => {
    if (!note.icon) return null;
    if (isLucideIcon(note.icon)) {
      const Icon = Lucide[note.icon as keyof typeof Lucide] as React.ElementType;
      return Icon ? <Icon className="h-5 w-5 mr-2 text-muted-foreground" aria-hidden="true" /> : null;
    }
    return <span className="text-xl mr-2" aria-hidden="true">{note.icon}</span>;
  }

  return (
    <>
      <motion.div
        layout
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.25, ease: "easeOut" }}
        whileHover={{ scale: 1.02, y: -4 }}
        className="h-full"
      >
        <Card
          className={cn(
            "flex h-full flex-col border-2 transition-all duration-300 ease-in-out hover:shadow-lg",
            note.isPinned
              ? "border-primary/50 shadow-primary/10"
              : "border-transparent",
            note.isLocked ? "bg-muted/50" : "",
            fontClass,
          )}
        >
          <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
            <div className="flex-grow overflow-hidden">
              <div className="flex items-center">
                <NoteIcon />
                <CardTitle className="line-clamp-1 text-xl font-semibold">
                  <Link
                    href={cardLink}
                    className="hover:underline focus:outline-none focus:ring-2 focus:ring-ring rounded-sm"
                    onClick={onCardClick}
                    aria-label={`Open note: ${note.title || "শিরোনামহীন নোট"}`}
                  >
                    {note.title || "শিরোনামহীন নোট"}
                  </Link>
                </CardTitle>
              </div>
               <div className="flex items-center gap-2 mt-1">
                {note.isPinned && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.2 }}
                  >
                    <Pin className="h-3 w-3 flex-shrink-0 text-primary" aria-label="Pinned" />
                  </motion.div>
                )}
                {note.isLocked && (
                  <Lock className="h-3 w-3 flex-shrink-0 text-destructive" aria-label="Locked" />
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Note options"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenuItem
                  onSelect={() => setIsIconPickerOpen(true)}
                  disabled={note.isLocked}
                >
                  <ImageIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                  <span>আইকন সেট করুন</span>
                </DropdownMenuItem>

                <DropdownMenuItem onSelect={handleTogglePin}>
                  {note.isPinned ? (
                    <>
                      <PinOff className="mr-2 h-4 w-4" aria-hidden="true" />
                      <span>আনপিন করুন</span>
                    </>
                  ) : (
                    <>
                      <Pin className="mr-2 h-4 w-4" aria-hidden="true" />
                      <span>পিন করুন</span>
                    </>
                  )}
                </DropdownMenuItem>

                <DropdownMenuItem onSelect={handleToggleLock}>
                  {note.isLocked ? (
                    <>
                      <Unlock className="mr-2 h-4 w-4" aria-hidden="true" />
                      <span>আনলক করুন</span>
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" aria-hidden="true" />
                      <span>লক করুন</span>
                    </>
                  )}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onSelect={() => setIsHistoryOpen(true)}
                  disabled={note.isLocked}
                >
                  <History className="mr-2 h-4 w-4" aria-hidden="true" />
                  <span>ভার্সন হিস্টোরি</span>
                </DropdownMenuItem>
                
                <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
                  <DialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      disabled={note.isLocked}
                    >
                      <Edit className="mr-2 h-4 w-4" aria-hidden="true" />
                      <span>রিনেম করুন</span>
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DialogContent>
                    <form onSubmit={handleRename}>
                      <DialogHeader>
                        <DialogTitle>নোট রিনেম করুন</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <Input
                          id="new-title-input"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          placeholder="নতুন শিরোনাম"
                          autoFocus
                          aria-label="New note title"
                        />
                      </div>
                      <DialogFooter>
                         <Button type="button" variant="secondary" onClick={() => setIsRenameOpen(false)}>
                          বাতিল
                        </Button>
                        <Button type="submit">সেভ করুন</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

                <DropdownMenuItem
                  onSelect={() => setIsTagsOpen(true)}
                  disabled={note.isLocked}
                >
                  <Tag className="mr-2 h-4 w-4" aria-hidden="true" />
                  <span>ট্যাগ এডিট করুন</span>
                </DropdownMenuItem>

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger disabled={note.isLocked}>
                    <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                    <span>এক্সপোর্ট</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onSelect={handleExportToPDF}>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>পিডিএফ (.pdf)</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={handleExportAsMarkdown}>
                        <BookMarked className="mr-2 h-4 w-4" />
                        <span>মার্কডাউন (.md)</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={handleExportAsTxt}>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>প্লেইন টেক্সট (.txt)</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={handleExportAsJson}>
                        <FileJson className="mr-2 h-4 w-4" />
                        <span>JSON (.json)</span>
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onSelect={handleArchive}
                  disabled={note.isLocked}
                >
                  <Archive className="mr-2 h-4 w-4" />
                  <span>আর্কাইভ করুন</span>
                </DropdownMenuItem>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      className="text-destructive focus:bg-destructive/90 focus:text-destructive-foreground"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                      <span>ডিলিট করুন</span>
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>আপনি কি নিশ্চিত?</AlertDialogTitle>
                      <AlertDialogDescription>
                        এই নোটটি স্থায়ীভাবে ডিলিট করা হবে। এই ক্রিয়াটি বাতিল করা যাবে না।
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>বাতিল করুন</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        স্থায়ীভাবে ডিলিট করুন
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <Link
            href={cardLink}
            onClick={onCardClick}
            className="block h-full flex-grow p-6 pt-0"
            aria-label={`View content of note: ${note.title || "শিরোনামহীন নোট"}`}
          >
            <CardContent className="space-y-4 p-0">
              <p className="line-clamp-3 text-sm text-muted-foreground">
                {contentPreview}
              </p>
              {checklistStats && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <CheckSquare className="mr-2 h-4 w-4 text-primary" aria-hidden="true" />
                    <span>
                      {checklistStats.checked} টি কাজ সম্পন্ন হয়েছে{" "}
                      {checklistStats.total} টির মধ্যে
                    </span>
                  </div>
                  <Progress
                    value={checklistStats.progress}
                    className="h-1.5"
                    aria-label={`Checklist progress: ${Math.round(checklistStats.progress)}%`}
                  />
                </div>
              )}
              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {note.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Link>
          <CardFooter className="flex items-center justify-between p-6 pt-0 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {readingTime} মিনিট পড়া
            </span>
            <span>{formattedDate}</span>
          </CardFooter>
        </Card>
      </motion.div>
      {isTagsOpen && (
        <ManageTagsDialog
          note={note}
          isOpen={isTagsOpen}
          onOpenChange={setIsTagsOpen}
        />
      )}
      {isIconPickerOpen && (
        <IconPickerDialog
          note={note}
          isOpen={isIconPickerOpen}
          onOpenChange={setIsIconPickerOpen}
        />
      )}
       {isHistoryOpen && (
        <VersionHistoryDialog
          note={note}
          isOpen={isHistoryOpen}
          onOpenChange={setIsHistoryOpen}
        />
      )}
    </>
  );
}

export const NoteCard = memo(
  NoteCardComponent,
  (prevProps, nextProps) =>
    prevProps.note.id === nextProps.note.id &&
    prevProps.note.title === nextProps.note.title &&
    prevProps.note.updatedAt === nextProps.note.updatedAt &&
    prevProps.note.isPinned === nextProps.note.isPinned &&
    prevProps.note.isLocked === nextProps.note.isLocked &&
    prevProps.note.isArchived === nextProps.note.isArchived &&
    prevProps.note.icon === nextProps.note.icon &&
    JSON.stringify(prevProps.note.content) ===
      JSON.stringify(nextProps.note.content) &&
    JSON.stringify(prevProps.note.tags) === JSON.stringify(nextProps.note.tags),
);
