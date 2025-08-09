
"use client";

import { memo, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AnimatePresence } from "framer-motion";
import { Note } from "@/lib/types";
import { NoteCard } from "./note-card";
import { useNotesStore } from "@/stores/use-notes";

interface SortableNoteItemProps {
  note: Note;
  onUnlock: (noteId: string, callback: () => void) => void;
}

function SortableNoteItem({ note, onUnlock }: SortableNoteItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: note.id, disabled: !note.isPinned });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style}>
      <NoteCard
        note={note}
        onUnlock={onUnlock}
        dragHandleProps={{ attributes, listeners }}
      />
    </div>
  );
}

interface NotesGridProps {
  notes: Note[];
  onUnlock: (noteId: string, callback: () => void) => void;
}

function NotesGridComponent({ notes, onUnlock }: NotesGridProps) {
  const { setNotes } = useNotesStore();
  const sensors = useSensors(useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }));

  const pinnedNotes = useMemo(() => notes.filter((n) => n.isPinned), [notes]);
  const unpinnedNotes = useMemo(
    () => notes.filter((n) => !n.isPinned),
    [notes],
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = pinnedNotes.findIndex((n) => n.id === active.id);
      const newIndex = pinnedNotes.findIndex((n) => n.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newPinnedOrder = arrayMove(pinnedNotes, oldIndex, newIndex);
        setNotes([...newPinnedOrder, ...unpinnedNotes]);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={pinnedNotes.map((n) => n.id)}
          strategy={rectSortingStrategy}
        >
          <AnimatePresence>
            {pinnedNotes.map((note) => (
              <SortableNoteItem
                key={note.id}
                note={note}
                onUnlock={onUnlock}
              />
            ))}
          </AnimatePresence>
        </SortableContext>
      </DndContext>
      <AnimatePresence>
        {unpinnedNotes.map((note) => (
          <NoteCard key={note.id} note={note} onUnlock={onUnlock} />
        ))}
      </AnimatePresence>
    </div>
  );
}

export const NotesGrid = memo(NotesGridComponent);
