"use client";

import { memo, useMemo, useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Note } from "@/lib/types";
import NoteCard from "@/components/note-card-item";
import { StaggerContainer, StaggerItem } from "@/components/page-transition";

interface NotesGridProps {
  notes: Note[];
  onUnlock: (noteId: string, callback: () => void) => void;
  onShare: (note: Note, format: "md" | "json" | "txt" | "pdf") => void;
  onOpenTags: (note: Note) => void;
  onOpenIconPicker: (note: Note) => void;
  onOpenHistory: (note: Note) => void;
  enableVirtualScrolling?: boolean;
  itemHeight?: number;
}

const ITEM_HEIGHT = 280; // Approximate height of each note card
const OVERSCAN = 5; // Number of items to render outside of visible area

function VirtualizedGrid({ 
  notes, 
  containerHeight, 
  itemHeight = ITEM_HEIGHT,
  renderItem 
}: {
  notes: Note[];
  containerHeight: number;
  itemHeight: number;
  renderItem: (note: Note, index: number) => React.ReactNode;
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { startIndex, endIndex, totalHeight } = useMemo(() => {
    const itemsPerRow = Math.floor((containerRef.current?.clientWidth || 1200) / 320); // 320px per card including gap
    const rowCount = Math.ceil(notes.length / itemsPerRow);
    const rowHeight = itemHeight + 16; // including gap
    
    const startRow = Math.floor(scrollTop / rowHeight);
    const endRow = Math.min(
      rowCount - 1,
      Math.ceil((scrollTop + containerHeight) / rowHeight)
    );

    return {
      startIndex: Math.max(0, (startRow - OVERSCAN) * itemsPerRow),
      endIndex: Math.min(notes.length - 1, (endRow + OVERSCAN) * itemsPerRow),
      totalHeight: rowCount * rowHeight
    };
  }, [scrollTop, containerHeight, notes.length, itemHeight]);

  const visibleNotes = notes.slice(startIndex, endIndex + 1);
  const offsetY = Math.floor(startIndex / Math.floor((containerRef.current?.clientWidth || 1200) / 320)) * (itemHeight + 16);

  return (
    <div
      ref={containerRef}
      className="h-full overflow-auto"
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div 
          style={{ 
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
          className="notes-grid"
        >
          {visibleNotes.map((note, index) => renderItem(note, startIndex + index))}
        </div>
      </div>
    </div>
  );
}

function NotesGridComponent({ 
  notes, 
  enableVirtualScrolling = false,
  itemHeight = ITEM_HEIGHT,
  ...noteActionProps 
}: NotesGridProps) {
  const [containerHeight, setContainerHeight] = useState(600);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.clientHeight);
    }
  }, []);

  const renderNoteCard = (note: Note, index: number) => (
    <StaggerItem key={note.id}>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ 
          opacity: 0, 
          y: -20, 
          scale: 0.95,
          transition: { duration: 0.2 }
        }}
        transition={{
          duration: 0.4,
          delay: enableVirtualScrolling ? 0 : index * 0.05,
          type: "spring",
          stiffness: 300,
          damping: 24
        }}
        whileHover={{ 
          y: -8, 
          scale: 1.01,
          transition: { duration: 0.2 }
        }}
        className="h-full"
      >
        <NoteCard note={note} {...noteActionProps} />
      </motion.div>
    </StaggerItem>
  );

  // Use virtual scrolling for large datasets
  if (enableVirtualScrolling && notes.length > 50) {
    return (
      <div ref={containerRef} className="h-full">
        <VirtualizedGrid
          notes={notes}
          containerHeight={containerHeight}
          itemHeight={itemHeight}
          renderItem={renderNoteCard}
        />
      </div>
    );
  }

  // Regular grid for smaller datasets with enhanced animations
  return (
    <StaggerContainer className="notes-grid" delay={0.05}>
      <AnimatePresence mode="popLayout">
        {notes.map((note, index) => renderNoteCard(note, index))}
      </AnimatePresence>
    </StaggerContainer>
  );
}

NotesGridComponent.displayName = "NotesGridComponent";

const NotesGrid = memo(NotesGridComponent);
export default NotesGrid;
