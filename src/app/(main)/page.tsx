"use client";

import React, {
  useState,
  useMemo,
  useRef,
  useCallback,
  useEffect,
} from "react";
import dynamic from "next/dynamic";
import { useSettingsStore } from "@/stores/use-settings";
import { useNotesStore } from "@/stores/use-notes";
import { sortNotes } from "@/lib/utils";
import { importNotes, shareNote } from "@/lib/storage";
import type { SortOption, ViewMode } from "@/components/notes-header";
import { NotesHeaderSkeleton } from "@/components/notes-header";
import { useRouter } from "next/navigation";
import { welcomeNote } from "@/lib/welcome-note";
import EmptyState from "@/components/empty-state";
import { Note } from "@/lib/types";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const NotesHeader = dynamic(() => import("@/components/notes-header"), {
  ssr: false,
  loading: () => <NotesHeaderSkeleton />,
});
const PasscodeDialog = dynamic(() => import("@/components/passcode-dialog"), {
  ssr: false,
});
const OnboardingDialog = dynamic(
  () => import("@/components/onboarding-dialog"),
  { ssr: false },
);
const NotesGrid = dynamic(() => import("@/components/notes-grid"), {
  ssr: false,
});
const NotesList = dynamic(() => import("@/components/notes-list"), {
  ssr: false,
});

const ManageTagsDialog = dynamic(
  () => import("@/components/manage-tags-dialog"),
  { ssr: false },
);
const IconPickerDialog = dynamic(
  () => import("@/components/icon-picker-dialog"),
  { ssr: false },
);
const VersionHistoryDialog = dynamic(
  () => import("@/components/version-history-dialog"),
  { ssr: false },
);

export default function NotesPage() {
  const {
    notes: initialNotes,
    isLoading,
    hasFetched,
    fetchNotes,
    addImportedNotes,
    addNote,
    createNote,
  } = useNotesStore();
  const router = useRouter();
  const {
    font,
    passcode,
    setSetting,
    hasSeenOnboarding,
    setHasSeenOnboarding,
  } = useSettingsStore();
  const [sortOption, setSortOption] = useState<SortOption>("updatedAt-desc");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isPasscodeDialogOpen, setIsPasscodeDialogOpen] = useState(false);
  const [passcodeAction, setPasscodeAction] = useState<{
    action: "lock" | "unlock";
    callback: () => void;
  } | null>(null);

  const importInputRef = useRef<HTMLInputElement>(null);

  const [dialogs, setDialogs] = useState({
    tags: false,
    icon: false,
    history: false,
  });
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const openDialog = (dialog: "tags" | "icon" | "history", note: Note) => {
    setSelectedNote(note);
    setDialogs((prev) => ({ ...prev, [dialog]: true }));
  };

  const closeDialog = (dialog: "tags" | "icon" | "history") => {
    setDialogs((prev) => ({ ...prev, [dialog]: false }));
    setSelectedNote(null);
  };

  useEffect(() => {
    if (!hasFetched) {
      fetchNotes().then((notes) => {
        if (!hasSeenOnboarding && notes.length === 0) {
          addNote(welcomeNote);
        }
      });
    }
  }, [fetchNotes, hasFetched, hasSeenOnboarding, addNote]);

  const handleNewNote = useCallback(async () => {
    try {
      const newNoteId = await createNote();
      if (newNoteId) {
        router.push(`/editor?noteId=${newNoteId}`);
      }
    } catch (error) {
      console.error("Failed to create note.", error);
    }
  }, [createNote, router]);

  const handleShare = useCallback(
    async (note: Note, format: "md" | "json" | "txt" | "pdf") => {
      if (note.isLocked) {
        toast.error("একটি লক করা নোট শেয়ার করা যাবে না।");
        return;
      }
      try {
        await shareNote(note, format);
        toast.success("নোট সফলভাবে শেয়ার করা হয়েছে।");
      } catch (e) {
        toast.error("নোট শেয়ার করতে সমস্যা হয়েছে।");
      }
    },
    [],
  );

  const handleImportClick = useCallback(() => {
    importInputRef.current?.click();
  }, []);

  const handleFileImport = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        try {
          const imported = await importNotes(file);
          addImportedNotes(imported);
          toast.success(`${imported.length}টি নোট সফলভাবে ইম্পোর্ট করা হয়েছে।`);
        } catch (error) {
          toast.error("নোট ইম্পোর্ট করতে সমস্যা হয়েছে।");
          console.error("Failed to import notes.", error);
        } finally {
          if (importInputRef.current) {
            importInputRef.current.value = "";
          }
        }
      }
    },
    [addImportedNotes],
  );

  const handleUnlockRequest = useCallback(
    (noteId: string, callback: () => void) => {
      const note = initialNotes.find((n) => n.id === noteId);
      if (!note) return;

      if (!note.isLocked) {
        if (!passcode) {
          setPasscodeAction({ action: "lock", callback });
          setIsPasscodeDialogOpen(true);
        } else {
          callback();
        }
        return;
      }

      setPasscodeAction({ action: "unlock", callback });
      setIsPasscodeDialogOpen(true);
    },
    [initialNotes, passcode],
  );

  const handlePasscodeConfirm = useCallback(
    (enteredPasscode: string) => {
      if (passcodeAction?.action === "lock") {
        setSetting("passcode", enteredPasscode);
        toast.success("পাসকোড সেট করা হয়েছে।");
        passcodeAction.callback();
      } else if (passcodeAction?.action === "unlock") {
        if (enteredPasscode === passcode) {
          passcodeAction.callback();
          setIsPasscodeDialogOpen(false);
          setPasscodeAction(null);
          return;
        } else {
          toast.error("পাসকোড সঠিক নয়!");
        }
      }

      setIsPasscodeDialogOpen(false);
      setPasscodeAction(null);
    },
    [passcode, passcodeAction, setSetting],
  );

  const filteredAndSortedNotes = useMemo(() => {
    const activeNotes = initialNotes.filter(
      (note) => !note.isArchived && !note.isTrashed,
    );
    const lowercasedQuery = debouncedSearchQuery.toLowerCase();

    const filtered = debouncedSearchQuery
      ? activeNotes.filter((note) => {
          const titleMatch = note.title.toLowerCase().includes(lowercasedQuery);
          const contentMatch =
            !note.isLocked &&
            note.content?.blocks
              ?.map((block) => block.data.text || "")
              .join(" ")
              .toLowerCase()
              .includes(lowercasedQuery);
          const tagMatch = note.tags?.some((tag) =>
            tag.toLowerCase().includes(lowercasedQuery),
          );
          return titleMatch || !!contentMatch || !!tagMatch;
        })
      : activeNotes;

    return sortNotes(filtered, sortOption);
  }, [initialNotes, debouncedSearchQuery, sortOption]);

  const handleOnboardingComplete = () => {
    setHasSeenOnboarding(true);
  };

  const renderContent = () => {
    if (isLoading && !hasFetched) {
      return (
        <div className="flex h-full w-full items-center justify-center">
          <LoadingSpinner />
        </div>
      );
    }

    if (initialNotes.length === 0 && !debouncedSearchQuery) {
      return (
        <EmptyState
          onNewNote={handleNewNote}
          onImportClick={handleImportClick}
          isSearching={false}
        />
      );
    }

    const noteActionProps = {
      onUnlock: handleUnlockRequest,
      onShare: handleShare,
      onOpenTags: (note: Note) => openDialog("tags", note),
      onOpenIconPicker: (note: Note) => openDialog("icon", note),
      onOpenHistory: (note: Note) => openDialog("history", note),
    };

    if (filteredAndSortedNotes.length > 0) {
      return viewMode === "grid" ? (
        <NotesGrid notes={filteredAndSortedNotes} {...noteActionProps} />
      ) : (
        <NotesList notes={filteredAndSortedNotes} {...noteActionProps} />
      );
    }

    return (
      <EmptyState
        onNewNote={handleNewNote}
        onImportClick={handleImportClick}
        isSearching={!!debouncedSearchQuery}
      />
    );
  };
  renderContent.displayName = "renderContent";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "min-h-screen bg-gradient-to-br from-background to-muted/20",
        font.split(" ")[0],
      )}
    >
      <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm lg:static lg:border-none lg:bg-transparent lg:backdrop-blur-none">
        <div className="container mx-auto px-4 py-3 md:px-6 lg:px-8 lg:py-6">
          <NotesHeader
            sortOption={sortOption}
            setSortOption={setSortOption}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-4 md:px-6 lg:px-8">
        {renderContent()}
      </div>

      <input
        type="file"
        ref={importInputRef}
        onChange={handleFileImport}
        className="hidden"
        accept=".json"
      />
      {isPasscodeDialogOpen && (
        <PasscodeDialog
          isOpen={isPasscodeDialogOpen}
          onOpenChange={setIsPasscodeDialogOpen}
          onConfirm={handlePasscodeConfirm}
          isSettingNew={!passcode && passcodeAction?.action === "lock"}
        />
      )}
      {selectedNote && dialogs.tags && (
        <ManageTagsDialog
          note={selectedNote}
          isOpen={dialogs.tags}
          onOpenChange={() => closeDialog("tags")}
        />
      )}
      {selectedNote && dialogs.icon && (
        <IconPickerDialog
          note={selectedNote}
          isOpen={dialogs.icon}
          onOpenChange={() => closeDialog("icon")}
        />
      )}
      {selectedNote && dialogs.history && (
        <VersionHistoryDialog
          note={selectedNote}
          isOpen={dialogs.history}
          onOpenChange={() => closeDialog("history")}
        />
      )}
      <OnboardingDialog
        isOpen={!hasSeenOnboarding && hasFetched && initialNotes.length <= 1}
        onOpenChange={setHasSeenOnboarding}
        onComplete={handleOnboardingComplete}
      />
      <div className="pb-16 lg:pb-8" />
    </motion.div>
  );
}
