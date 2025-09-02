/**
 * File Attachments Dialog
 * Manage file attachments for notes
 */

"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { Note, FileAttachment } from '@/lib/types';
import { FileAttachments } from '@/components/file-attachments';
import { useNotesStore } from '@/stores/use-notes';
import { toast } from 'sonner';

interface FileAttachmentsDialogProps {
  note: Note;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FileAttachmentsDialog({ note, isOpen, onOpenChange }: FileAttachmentsDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { updateNote } = useNotesStore();

  const handleAddAttachment = async (file: File): Promise<void> => {
    setIsLoading(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = async () => {
          try {
            const base64Data = reader.result as string;
            const newAttachment: FileAttachment = {
              id: `attachment_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
              name: file.name,
              size: file.size,
              type: file.type,
              data: base64Data,
              createdAt: Date.now()
            };

            const updatedAttachments = [...(note.attachments || []), newAttachment];
            await updateNote(note.id, { attachments: updatedAttachments });
            
            toast.success(`${file.name} ফাইল সংযুক্ত করা হয়েছে`);
            resolve();
          } catch (error) {
            reject(error);
          }
        };
        
        reader.onerror = () => reject(new Error('ফাইল পড়া যায়নি'));
        reader.readAsDataURL(file);
      });
    } catch (error) {
      toast.error('ফাইল সংযুক্ত করা যায়নি');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveAttachment = async (attachmentId: string): Promise<void> => {
    setIsLoading(true);
    try {
      const updatedAttachments = (note.attachments || []).filter(
        attachment => attachment.id !== attachmentId
      );
      
      await updateNote(note.id, { attachments: updatedAttachments });
      toast.success('ফাইল সরানো হয়েছে');
    } catch (error) {
      toast.error('ফাইল সরানো যায়নি');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icons.File className="h-5 w-5" />
            ফাইল সংযুক্তি - {note.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Stats */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{note.attachments?.length || 0}</div>
                <div className="text-sm text-muted-foreground">সংযুক্ত ফাইল</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {Math.round((note.attachments?.reduce((sum, att) => sum + att.size, 0) || 0) / 1024)} KB
                </div>
                <div className="text-sm text-muted-foreground">মোট আকার</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {new Set(note.attachments?.map(att => att.type.split('/')[0]) || []).size}
                </div>
                <div className="text-sm text-muted-foreground">ফাইলের ধরন</div>
              </div>
            </div>
          </div>

          {/* File Attachments Component */}
          <div className="max-h-96 overflow-y-auto">
            <FileAttachments
              attachments={note.attachments || []}
              onAddAttachment={handleAddAttachment}
              onRemoveAttachment={handleRemoveAttachment}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              সর্বোচ্চ ফাইল সাইজ: ৫ MB | সমর্থিত: ছবি, PDF, অডিও, ভিডিও
            </div>
            
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              বন্ধ করুন
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default FileAttachmentsDialog;
