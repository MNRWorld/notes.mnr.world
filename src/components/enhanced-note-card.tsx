/**
 * Enhanced Note Card Component
 * Showcases new features like Bengali calendar, privacy indicators, attachments
 */

"use client";

import React from 'react';
import Link from 'next/link';
import { Note } from '@/lib/types';
import { Icons } from '@/components/ui/icons';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { PrivacyIndicator } from '@/components/privacy-mode';
import { BengaliCalendarDisplay } from '@/components/bengali-calendar';
import { FileAttachmentManager } from '@/lib/file-attachments';
import { TaskManager } from '@/lib/task-manager';
import { getTextFromEditorJS, calculateReadingTime, cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface EnhancedNoteCardProps {
  note: Note;
  index?: number;
  className?: string;
  showPreview?: boolean;
  onActionClick?: (action: string, note: Note) => void;
}

export function EnhancedNoteCard({
  note,
  index = 0,
  className,
  showPreview = true,
  onActionClick
}: EnhancedNoteCardProps) {
  const content = getTextFromEditorJS(note.content);
  const readingTime = calculateReadingTime(note);
  const tasks = TaskManager.extractTasksFromNote(note);
  const taskStats = TaskManager.groupTasksByStatus(tasks);
  const hasAttachments = note.attachments && note.attachments.length > 0;

  const NoteIcon = () => {
    if (!note.icon) return null;
    const IconComponent = (Icons as any)[note.icon];
    return IconComponent ? <IconComponent className="h-4 w-4" /> : null;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          duration: 0.3,
          delay: index * 0.05,
          ease: [0.25, 1, 0.5, 1],
        },
      }}
      whileHover={{ y: -2, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <Card className="group relative flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg border-l-4 border-l-transparent hover:border-l-primary min-h-[220px]">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <NoteIcon />
              <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                {note.title || "শিরোনামহীন"}
              </h3>
              {note.isPinned && (
                <Icons.Pin className="h-4 w-4 text-yellow-500 flex-shrink-0" />
              )}
            </div>
            
            <PrivacyIndicator note={note} />
          </div>

          {/* Tags and metadata */}
          <div className="flex flex-wrap gap-1 mt-2">
            {note.tags?.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {note.tags && note.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{note.tags.length - 3}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3 flex-grow">
          {/* Content preview */}
          {showPreview && content && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {content.substring(0, 150)}
              {content.length > 150 && '...'}
            </p>
          )}

          {/* Tasks summary */}
          {tasks.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <Icons.CheckSquare className="h-3 w-3" />
              <span>
                {taskStats.completed.length}/{tasks.length} কাজ সম্পন্ন
              </span>
              <div className="flex-1 bg-muted rounded-full h-1.5">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all"
                  style={{
                    width: `${TaskManager.getCompletionPercentage(tasks)}%`
                  }}
                />
              </div>
            </div>
          )}

          {/* Attachments summary */}
          {hasAttachments && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Icons.File className="h-3 w-3" />
              <span>{note.attachments!.length} ফাইল সংযুক্ত</span>
              
              <div className="flex gap-1">
                {note.attachments!.slice(0, 3).map((attachment) => {
                  const iconName = FileAttachmentManager.getAttachmentIcon(attachment);
                  const IconComponent = (Icons as any)[iconName];
                  return IconComponent ? (
                    <IconComponent key={attachment.id} className="h-3 w-3" />
                  ) : null;
                })}
                {note.attachments!.length > 3 && (
                  <span className="text-xs">+{note.attachments!.length - 3}</span>
                )}
              </div>
            </div>
          )}
        </CardContent>
        
        <CardContent className="space-y-3 pt-0">
          {/* Footer with date and stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t mt-auto">
            <div className="flex items-center gap-4">
              {note.bengaliDate && (
                <BengaliCalendarDisplay 
                  bengaliDate={note.bengaliDate}
                  size="sm"
                  showSeason={false}
                />
              )}
              
              <div className="flex items-center gap-1">
                <Icons.Clock className="h-3 w-3" />
                <span>{readingTime} মিনিট</span>
              </div>

              {note.history && note.history.length > 0 && (
                <div className="flex items-center gap-1">
                  <Icons.History className="h-3 w-3" />
                  <span>v{note.version || note.history.length}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              <span>
                {new Date(note.updatedAt).toLocaleDateString('bn-BD')}
              </span>
            </div>
          </div>
        </CardContent>


        {/* Hover actions */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex gap-1">
            {onActionClick && (
              <>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onActionClick('share-md', note);
                  }}
                  className="p-1 rounded bg-background/80 backdrop-blur-sm border hover:bg-muted transition-colors"
                  title="মার্কডাউন এক্সপোর্ট"
                >
                  <Icons.Download className="h-3 w-3" />
                </button>
                
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onActionClick('history', note);
                  }}
                  className="p-1 rounded bg-background/80 backdrop-blur-sm border hover:bg-muted transition-colors"
                  title="ভার্সন কন্ট্রোল"
                >
                  <Icons.History className="h-3 w-3" />
                </button>
                
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onActionClick('privacy', note);
                  }}
                  className="p-1 rounded bg-background/80 backdrop-blur-sm border hover:bg-muted transition-colors"
                  title="গোপনীয়তা"
                >
                  <Icons.Eye className="h-3 w-3" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Link overlay */}
        <Link 
          href={`/editor?noteId=${note.id}`} 
          className="absolute inset-0 z-0"
          aria-label={`নোট খুলুন: ${note.title}`}
        />
      </Card>
    </motion.div>
  );
}

interface EnhancedNotesGridProps {
  notes: Note[];
  onActionClick?: (action: string, note: Note) => void;
  className?: string;
}

export function EnhancedNotesGrid({
  notes,
  onActionClick,
  className
}: EnhancedNotesGridProps) {
  return (
    <div className={cn(
      "grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      className
    )}>
      {notes.map((note, index) => (
        <EnhancedNoteCard
          key={note.id}
          note={note}
          index={index}
          onActionClick={onActionClick}
        />
      ))}
    </div>
  );
}
