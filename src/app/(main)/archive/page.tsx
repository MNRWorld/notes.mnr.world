"use client";

import { useNotesStore } from "@/stores/use-notes";
import NoteManagementPage from "@/components/note-management-page";
import { useLoadingState } from "@/hooks/use-loading-state";
import { toast } from "sonner";

export default function ArchivePage() {
  const { archivedNotes, unarchiveNote, deleteNotePermanently } =
    useNotesStore();
  const [isLoading, handleAction] = useLoadingState();

  const handleRestore = async (id: string) => {
    await handleAction(async () => {
      await unarchiveNote(id);
      toast.success("The note has been restored from the archive.");
    });
  };

  const handleDelete = async (id: string) => {
    await handleAction(async () => {
      await deleteNotePermanently(id);
      toast.success("The note has been permanently deleted.");
    });
  };

  return (
    <NoteManagementPage
      pageType="archive"
      notes={archivedNotes}
      onRestore={handleRestore}
      onDelete={handleDelete}
      isLoading={isLoading}
    />
  );
}
