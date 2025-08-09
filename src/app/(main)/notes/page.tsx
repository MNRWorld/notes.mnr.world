
"use client";

import React, {
  useState,
  useMemo,
  useRef,
  useCallback,
  useEffect,
} from "react";
import dynamic from "next/dynamic";
import { useDebounce } from "@/hooks/use-debounce";
import { useSettingsStore } from "@/stores/use-settings";
import { useNotesStore } from "@/stores/use-notes";
import { cn, getTextFromEditorJS } from "@/lib/utils";
import { importNotes } from "@/lib/storage";
import { toast } from "sonner";
import NotesHeader, { SortOption, ViewMode } from "./_components/notes-header";
import { Note } from "@/lib/types";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { welcomeNote } from "@/lib/welcome-note";

const NotesGrid = dynamic(() =>
  import("./_components/notes-grid").then((mod) => mod.NotesGrid),
);
const NotesList = dynamic(() =>
  import("./_components/notes-list").then((mod) => mod.NotesList),
);
const EmptyState = dynamic(() => import("./_components/empty-state"));
const PasscodeDialog = dynamic(() => import("./_components/passcode-dialog"));
const OnboardingDialog = dynamic(() => import("./_components/onboarding-dialog"));


export default function NotesPage() {
  const {
    notes: initialNotes,
    isLoading,
    hasFetched,
    fetchNotes,
    createNote,
    addImportedNotes,
    updateNote,
    addNote
  } = useNotesStore();
  const router = useRouter();
  const { font, passcode, setSetting, isFirstVisit, setFirstVisit } = useSettingsStore();
  const [sortOption, setSortOption] = useState<SortOption>("updatedAt-desc");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isPasscodeDialogOpen, setIsPasscodeDialogOpen] = useState(false);
  const [passcodeCallback, setPasscodeCallback] = useState<(() => void) | null>(
    null,
  );
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!hasFetched) {
      fetchNotes().then(notes => {
        if (isFirstVisit && notes.length === 0) {
          addNote(welcomeNote);
        }
      });
    }
  }, [fetchNotes, hasFetched, isFirstVisit, addNote]);


  const handleNewNote = useCallback(async () => {
    try {
      router.push(`/editor`);
    } catch (error) {
      toast.error("নোট তৈরি করতে ব্যর্থ হয়েছে।");
    }
  }, [router]);

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
          toast.success(
            `${imported.length} টি নোট সফলভাবে ইমপোর্ট করা হয়েছে!`,
          );
        } catch (error) {
          toast.error(
            "নোট ইম্পোর্ট করতে ব্যর্থ হয়েছে। ফাইল ফরম্যাট সঠিক কিনা তা পরীক্ষা করুন।",
          );
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
        callback();
        return;
      }

      if (!passcode) {
        toast.error("প্রথমে একটি পাসকোড সেট করুন।");
        return;
      }
      setCurrentNoteId(noteId);
      setPasscodeCallback(() => () => {
        if (note.isLocked) {
          updateNote(noteId, { isLocked: false });
          toast.success("নোটটি আনলক করা হয়েছে।");
        }
        callback();
      });
      setIsPasscodeDialogOpen(true);
    },
    [initialNotes, passcode, updateNote],
  );

  const handleLockRequest = useCallback(
    (noteId: string, callback: () => void) => {
      setCurrentNoteId(noteId);
      if (passcode) {
        callback();
      } else {
        setPasscodeCallback(() => () => {
          callback();
        });
        setIsPasscodeDialogOpen(true);
      }
    },
    [passcode],
  );

  const handlePasscodeConfirm = useCallback(
    (enteredPasscode: string) => {
      if (passcode) {
        if (enteredPasscode === passcode) {
          passcodeCallback?.();
          toast.success("সঠিক পাসকোড!");
        } else {
          toast.error("ভুল পাসকোড!");
        }
      } else {
        setSetting("passcode", enteredPasscode);
        passcodeCallback?.();
        toast.success("পাসকোড সফলভাবে সেট করা হয়েছে!");
      }
      setIsPasscodeDialogOpen(false);
      setPasscodeCallback(null);
      setCurrentNoteId(null);
    },
    [passcode, passcodeCallback, setSetting],
  );

  const filteredNotes = useMemo(() => {
    if (!debouncedSearchQuery) {
      return initialNotes;
    }
    const lowercasedQuery = debouncedSearchQuery.toLowerCase();
    return initialNotes.filter((note) => {
      const titleMatch = note.title.toLowerCase().includes(lowercasedQuery);
      const contentMatch =
        !note.isLocked &&
        getTextFromEditorJS(note.content)
          .toLowerCase()
          .includes(lowercasedQuery);
      const tagMatch = note.tags?.some((tag) =>
        tag.toLowerCase().includes(lowercasedQuery),
      );
      return titleMatch || contentMatch || tagMatch;
    });
  }, [initialNotes, debouncedSearchQuery]);

  const sortedNotes = useMemo(() => {
    const sorted = [...filteredNotes].sort((a, b) => {
      const [key, order] = sortOption.split("-") as [
        keyof Note,
        "asc" | "desc",
      ];
      let valA = a[key] as any;
      let valB = b[key] as any;

      if (key === "charCount" && valA === undefined) valA = 0;
      if (key === "charCount" && valB === undefined) valB = 0;

      if (key === "title") {
        return (
          String(valA).localeCompare(String(valB)) * (order === "asc" ? 1 : -1)
        );
      }

      if (
        (key === "createdAt" || key === "updatedAt") &&
        (typeof valA === "number" || typeof valA === "string") &&
        (typeof valB === "number" || typeof valB === "string")
      ) {
        const dateA = new Date(valA).getTime();
        const dateB = new Date(valB).getTime();
        return order === "asc" ? dateA - dateB : dateB - dateA;
      }

      const numA = typeof valA === "number" ? valA : 0;
      const numB = typeof valB === "number" ? valB : 0;
      return order === "asc" ? numA - numB : numB - numA;
    });

    return sorted.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });
  }, [filteredNotes, sortOption]);

  const onUnlockHandler = useCallback(
    (noteId: string, cb: () => void) => {
      const note = initialNotes.find((n) => n.id === noteId);
      if (!note) return;

      if (note.isLocked) {
        handleUnlockRequest(noteId, cb);
      } else {
        handleLockRequest(noteId, cb);
      }
    },
    [initialNotes, handleUnlockRequest, handleLockRequest],
  );

  const handleOnboardingComplete = () => {
    setFirstVisit(false);
  }

  const renderContent = () => {
    if (isLoading || !hasFetched) {
      if (viewMode === "grid") {
        return (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-60 w-full" />
            ))}
          </div>
        );
      }
      return (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      );
    }

    if (sortedNotes.length > 0) {
      return viewMode === "grid" ? (
        <NotesGrid notes={sortedNotes} onUnlock={onUnlockHandler} />
      ) : (
        <NotesList notes={sortedNotes} onUnlock={onUnlockHandler} />
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

  return (
    <div
      className={cn(
        "relative h-full space-y-8 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8",
        font.split(" ")[0],
      )}
    >
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
          isSettingNew={!passcode}
        />
      )}
      <OnboardingDialog 
        isOpen={isFirstVisit && hasFetched}
        onOpenChange={(isOpen) => {
          if (!isOpen) handleOnboardingComplete();
        }}
      />
    </div>
  );
}
