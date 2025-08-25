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
import NotesHeader, { SortOption, ViewMode } from "./_components/notes-header";
import { useRouter } from "next/navigation";
import { welcomeNote } from "@/lib/welcome-note";
import EmptyState from "./_components/empty-state";
import { Note } from "@/lib/types";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useDebounce } from "@/hooks/use-debounce";

const PasscodeDialog = dynamic(() => import("./_components/passcode-dialog"), {
  ssr: false,
});
const OnboardingDialog = dynamic(
  () => import("./_components/onboarding-dialog"),
  { ssr: false },
);
const NotesGrid = dynamic(
  () => import("./_components/notes-grid").then((m) => m.NotesGrid),
  { ssr: false, loading: () => <LoadingSpinner /> },
);
const NotesList = dynamic(
  () => import("./_components/notes-list").then((m) => m.NotesList),
  { ssr: false, loading: () => <LoadingSpinner /> },
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
  const { passcode, setSetting, hasSeenOnboarding, setHasSeenOnboarding } =
    useSettingsStore();
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
    (note: Note, format: "md" | "json" | "txt" | "pdf") => {
      if (note.isLocked) {
        console.error("Cannot share a locked note.");
        return;
      }
      shareNote(note, format);
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
        } catch (error) {
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
        passcodeAction.callback();
      } else if (passcodeAction?.action === "unlock") {
        if (enteredPasscode === passcode) {
          passcodeAction.callback();
          setIsPasscodeDialogOpen(false);
          setPasscodeAction(null);
          return;
        } else {
          console.error("Incorrect passcode!");
        }
      }

      setIsPasscodeDialogOpen(false);
      setPasscodeAction(null);
    },
    [passcode, passcodeAction, setSetting],
  );

  const filteredAndSortedNotes = useMemo(() => {
    const activeNotes = initialNotes.filter((note) => !note.isArchived);
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
    if (isLoading) {
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

    if (filteredAndSortedNotes.length > 0) {
      return viewMode === "grid" ? (
        <NotesGrid
          notes={filteredAndSortedNotes}
          onUnlock={handleUnlockRequest}
          onShare={handleShare}
        />
      ) : (
        <NotesList
          notes={filteredAndSortedNotes}
          onUnlock={handleUnlockRequest}
          onShare={handleShare}
        />
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
    <div className="relative h-full space-y-6 px-4 pt-8 lg:px-8 lg:py-8">
      <NotesHeader
        sortOption={sortOption}
        setSortOption={setSortOption}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {renderContent()}

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
      <OnboardingDialog
        isOpen={!hasSeenOnboarding && hasFetched && initialNotes.length <= 1}
        onOpenChange={setHasSeenOnboarding}
        onComplete={handleOnboardingComplete}
      />
      <div className="h-16" />
    </div>
  );
}
