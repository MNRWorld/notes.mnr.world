
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
import { importNotes, shareNote, createDemoNotes } from "@/lib/storage";
import type { SortOption, ViewMode } from "@/components/notes-header";
import { NotesHeaderSkeleton } from "@/components/notes-header";
import { useRouter } from "next/navigation";
import EmptyState from "@/components/empty-state";
import { Note } from "@/lib/types";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import PageTransition from "@/components/page-transition";
import { EnhancedNotesGrid } from "@/components/enhanced-note-card";
import NotesList from "@/components/notes-list";
import { useMediaQuery } from "@/hooks/use-media-query";
import { welcomeNote } from "@/lib/welcome-note";
import OnboardingDialog from "@/components/onboarding-dialog";

const NotesHeader = dynamic(() => import("@/components/notes-header"), {
  ssr: false,
  loading: () => <NotesHeaderSkeleton />,
});
const PasscodeDialog = dynamic(() => import("@/components/passcode-dialog"), {
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

// Enhanced feature dialogs
const FileAttachmentsDialog = dynamic(
  () => import("@/components/file-attachments-dialog"),
  { ssr: false },
);
const TasksDialog = dynamic(
  () => import("@/components/task-management"),
  { ssr: false },
);
const IncognitoModeDialog = dynamic(
  () =>
    import("@/components/privacy-mode").then((m) => ({
      default: m.IncognitoModeDialog,
    })),
  { ssr: false },
);

export default function NotesPage() {
  const { notes, isLoading, hasFetched, addImportedNotes, addNote } =
    useNotesStore();
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
  const isDesktop = useMediaQuery("(min-width: 768px)");
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
    attachments: false,
    tasks: false,
    incognito: false,
  });
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  useEffect(() => {
    setViewMode(isDesktop ? "grid" : "list");
  }, [isDesktop]);

  const openDialog = (dialog: keyof typeof dialogs, note?: Note) => {
    if (note) setSelectedNote(note);
    setDialogs((prev) => ({ ...prev, [dialog]: true }));
  };

  const closeDialog = (dialog: keyof typeof dialogs) => {
    setDialogs((prev) => ({ ...prev, [dialog]: false }));
    setSelectedNote(null);
  };

  const handleNewNote = useCallback(async () => {
    try {
      const { createNote } = useNotesStore.getState();
      const newNoteId = await createNote();
      if (newNoteId) {
        router.push(`/editor?noteId=${newNoteId}`);
      }
    } catch (error) {}
  }, [router]);

  const handleCreateDemoNotes = useCallback(async () => {
    try {
      const newNotes = await createDemoNotes();
      if (newNotes.length > 0) {
        const { refreshNotes } = useNotesStore.getState();
        await refreshNotes();
        toast.success(`${newNotes.length}টি ডেমো নোট তৈরি করা হয়েছে`);
      }
    } catch (error) {
      toast.error("ডেমো নোট তৈরি করা যায়নি");
    }
  }, []);

  const handleShare = useCallback(
    async (note: Note, format: "md" | "json" | "txt" | "pdf") => {
      if (note.isLocked) {
        toast.error("লক করা নোট এক্সপোর্ট করা যাবে না।");
        return;
      }
      try {
        await shareNote(note, format);
        toast.success(`নোটটি ${format.toUpperCase()} হিসেবে এক্সপোর্ট হয়েছে।`);
      } catch (e) {
        toast.error("নোট এক্সপোর্ট করা যায়নি।");
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
          toast.success(`${imported.length}টি নোট সফলভাবে ইম্পোর্ট হয়েছে।`);
        } catch (error) {
          toast.error("নোট ইম্পোর্ট করা যায়নি।");
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
      const note = notes.find((n) => n.id === noteId);
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
    [notes, passcode],
  );

  const handlePasscodeConfirm = useCallback(
    (enteredPasscode: string) => {
      if (passcodeAction?.action === "lock") {
        setSetting("passcode", enteredPasscode);
        toast.success("পাসকোড সেট হয়েছে।");
        passcodeAction.callback();
      } else if (passcodeAction?.action === "unlock") {
        if (enteredPasscode === passcode) {
          passcodeAction.callback();
          setIsPasscodeDialogOpen(false);
          setPasscodeAction(null);
          return;
        } else {
          toast.error("ভুল পাসকোড।");
        }
      }

      setIsPasscodeDialogOpen(false);
      setPasscodeAction(null);
    },
    [passcode, passcodeAction, setSetting],
  );

  const handleTogglePrivacy = useCallback(async (note: Note) => {
    try {
      const { updateNote } = useNotesStore.getState();
      await updateNote(note.id, { isAnonymous: !note.isAnonymous });
      toast.success(
        note.isAnonymous ? "নোট প্রকাশ করা হয়েছে" : "নোট গোপনীয় করা হয়েছে",
      );
    } catch (error) {
      toast.error("গোপনীয়তা পরিবর্তন করা যায়নি");
    }
  }, []);

  const handleCreateIncognitoNote = useCallback(
    async (settings: any) => {
      try {
        const { createNote } = useNotesStore.getState();
        const newNoteId = await createNote();
        if (newNoteId) {
          // Update the note with incognito settings
          const { updateNote } = useNotesStore.getState();
          await updateNote(newNoteId, {
            isAnonymous: true,
            // Add other privacy settings based on the settings parameter
          });
          router.push(`/editor?noteId=${newNoteId}`);
          toast.success("গোপনীয় নোট তৈরি করা হয়েছে");
        }
      } catch (error) {
        toast.error("গোপনীয় নোট তৈরি করা যায়নি");
      }
    },
    [router],
  );

  const filteredAndSortedNotes = useMemo(() => {
    const activeNotes = notes.filter(
      (note) => !note.isArchived && !note.isTrashed,
    );
    const lowercasedQuery = debouncedSearchQuery.toLowerCase();

    const filtered = debouncedSearchQuery
      ? activeNotes.filter((note) => {
          const titleMatch = note.title
            .toLowerCase()
            .includes(lowercasedQuery);
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
  }, [notes, debouncedSearchQuery, sortOption]);

  const handleOnboardingComplete = () => {
    setHasSeenOnboarding(true);
    const welcomeNoteExists = notes.some((note) => note.id === "note_welcome");
    if (!welcomeNoteExists) {
      addNote(welcomeNote);
    }
  };

  const noteListActionProps = {
    onUnlock: handleUnlockRequest,
    onShare: handleShare,
    onOpenTags: (note: Note) => openDialog("tags", note),
    onOpenIconPicker: (note: Note) => openDialog("icon", note),
    onOpenHistory: (note: Note) => openDialog("history", note),
    onOpenAttachments: (note: Note) => openDialog("attachments", note),
    onOpenTasks: (note: Note) => openDialog("tasks", note),
    onTogglePrivacy: handleTogglePrivacy,
  };

  const renderContent = () => {
    if (isLoading && !hasFetched) {
      return (
        <div className="flex h-full w-full items-center justify-center">
          <LoadingSpinner />
        </div>
      );
    }

    if (useNotesStore.getState().notes.length === 0 && !debouncedSearchQuery) {
      return (
        <EmptyState
          onNewNote={handleNewNote}
          onImportClick={handleImportClick}
          onCreateDemoNotes={handleCreateDemoNotes}
        />
      );
    }

    if (filteredAndSortedNotes.length === 0 && debouncedSearchQuery) {
      return <EmptyState isSearching onNewNote={() => {}} />;
    }

    return viewMode === "grid" ? (
      <EnhancedNotesGrid
        notes={filteredAndSortedNotes}
        {...noteListActionProps}
      />
    ) : (
      <NotesList notes={filteredAndSortedNotes} {...noteListActionProps} />
    );
  };
  renderContent.displayName = "renderContent";

  return (
    <PageTransition
      className={cn(
        "flex flex-col min-h-screen bg-gradient-to-br from-background to-muted/20",
        font,
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
            onCreateIncognitoNote={() => openDialog("incognito")}
          />
        </div>
      </div>

      <div className="flex-1 container mx-auto max-w-7xl px-4 py-4 md:px-6 lg:px-8">
        {renderContent()}
      </div>

      <input
        type="file"
        ref={importInputRef}
        onChange={handleFileImport}
        className="hidden"
        accept=".json,.md"
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

      {selectedNote && dialogs.attachments && (
        <FileAttachmentsDialog
          note={selectedNote}
          isOpen={dialogs.attachments}
          onOpenChange={() => closeDialog("attachments")}
        />
      )}

      {selectedNote && dialogs.tasks && (
        <TasksDialog
          note={selectedNote}
          isOpen={dialogs.tasks}
          onOpenChange={() => closeDialog("tasks")}
        />
      )}

      {dialogs.incognito && (
        <IncognitoModeDialog
          isOpen={dialogs.incognito}
          onClose={() => closeDialog("incognito")}
          onCreateNote={handleCreateIncognitoNote}
        />
      )}

      <OnboardingDialog
        isOpen={!hasSeenOnboarding && hasFetched && notes.length <= 1}
        onOpenChange={setHasSeenOnboarding}
        onComplete={handleOnboardingComplete}
      />
    </PageTransition>
  );
}

