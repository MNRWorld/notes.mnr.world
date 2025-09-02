"use client";

import { useNotesStore } from "@/stores/use-notes";
import NoteManagementPage from "@/components/note-management-page";
import { useLoadingState } from "@/hooks/use-loading-state";
import { toast } from "sonner";

export default function TrashPage() {
  const {
    trashedNotes,
    restoreNote,
    deleteNotePermanently,
    clearTrash,
    restoreAllFromTrash,
  } = useNotesStore();
  const [isLoading, handleAction] = useLoadingState();

  const handleRestore = async (id: string) => {
    await handleAction(async () => {
      await restoreNote(id);
      toast.success("The note has been restored from trash.");
    });
  };

  const handleDelete = async (id: string) => {
    await handleAction(async () => {
      await deleteNotePermanently(id);
      toast.success("The note has been permanently deleted.");
    });
  };

  const handleRestoreAll = async () => {
    await handleAction(async () => {
      await restoreAllFromTrash();
      toast.success("All notes have been restored from trash.");
    });
  };

  const handleClearAllTrash = async () => {
    await handleAction(async () => {
      await clearTrash();
      toast.success("Trash has been cleared.");
    });
  };

  return (
    <NoteManagementPage
      pageType="trash"
      notes={trashedNotes}
      onRestore={handleRestore}
      onDelete={handleDelete}
      onRestoreAll={handleRestoreAll}
      onDeleteAll={handleClearAllTrash}
      isLoading={isLoading}
    />
  );
}
