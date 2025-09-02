/**
 * Enhanced Notes Store Methods
 * Additional methods to support new features
 */

import { Note, FileAttachment, Task } from '@/lib/types';
import { PrivacyManager, PrivacySettings } from '@/lib/privacy-manager';
import { TaskManager } from '@/lib/task-manager';
import { NoteVersionControl } from '@/lib/version-control';
import { MarkdownConverter } from '@/lib/markdown-converter';
import { FileAttachmentManager } from '@/lib/file-attachments';
import { getCurrentBengaliDate } from '@/lib/bengali-calendar';
import * as localDB from '@/lib/storage';
import { toast } from 'sonner';

export interface EnhancedNotesState {
  // File attachment methods
  addAttachmentToNote: (noteId: string, file: File) => Promise<void>;
  removeAttachmentFromNote: (noteId: string, attachmentId: string) => Promise<void>;
  downloadAttachment: (noteId: string, attachmentId: string) => void;
  
  // Task management methods
  extractTasksFromNote: (noteId: string) => Task[];
  updateTaskInNote: (noteId: string, taskId: string, updates: Partial<Task>) => Promise<void>;
  createTaskNote: (task: Task) => Promise<string | undefined>;
  
  // Version control methods
  createNoteVersion: (noteId: string, message?: string) => Promise<void>;
  restoreNoteVersion: (noteId: string, versionIndex: number) => Promise<void>;
  compareNoteVersions: (noteId: string, oldIndex: number, newIndex: number) => any[];
  createNoteBranch: (noteId: string, branchName: string) => Promise<string | undefined>;
  
  // Privacy and anonymous notes
  createAnonymousNote: (title: string, content: any, settings?: Partial<PrivacySettings>) => Promise<string | undefined>;
  makeNoteAnonymous: (noteId: string) => Promise<void>;
  removeNoteAnonymity: (noteId: string) => Promise<void>;
  cleanupExpiredNotes: () => Promise<void>;
  
  // Markdown import/export
  exportNoteAsMarkdown: (noteId: string) => void;
  importMarkdownNote: (file: File) => Promise<string | undefined>;
  
  // Bengali calendar integration
  updateNoteBengaliDate: (noteId: string) => Promise<void>;
}

export const enhancedNotesMethods = {
  // File attachment methods
  addAttachmentToNote: async (noteId: string, file: File) => {
    try {
      const attachment = await FileAttachmentManager.createAttachment(file);
      
      // Get current note
      const notes = await localDB.getNotes();
      const note = notes.find(n => n.id === noteId);
      
      if (!note) {
        throw new Error('নোট পাওয়া যায়নি।');
      }

      // Add attachment to note
      const updatedNote = {
        ...note,
        attachments: [...(note.attachments || []), attachment],
        updatedAt: Date.now()
      };

      await localDB.setNote(noteId, updatedNote);
      toast.success('ফাইল সংযুক্ত হয়েছে।');
      
      return attachment.id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'ফাইল সংযুক্ত করা যায়নি।';
      toast.error(errorMessage);
      throw error;
    }
  },

  removeAttachmentFromNote: async (noteId: string, attachmentId: string) => {
    try {
      const notes = await localDB.getNotes();
      const note = notes.find(n => n.id === noteId);
      
      if (!note) {
        throw new Error('নোট পাওয়া যায়নি।');
      }

      const updatedNote = {
        ...note,
        attachments: (note.attachments || []).filter(att => att.id !== attachmentId),
        updatedAt: Date.now()
      };

      await localDB.setNote(noteId, updatedNote);
      toast.success('ফাইল সরানো হয়েছে।');
    } catch (error) {
      toast.error('ফাইল সরানো যায়নি।');
      throw error;
    }
  },

  downloadAttachment: (noteId: string, attachmentId: string) => {
    localDB.getNotes().then(notes => {
      const note = notes.find(n => n.id === noteId);
      const attachment = note?.attachments?.find(att => att.id === attachmentId);
      
      if (attachment) {
        FileAttachmentManager.downloadAttachment(attachment);
      } else {
        toast.error('ফাইল পাওয়া যায়নি।');
      }
    });
  },

  // Task management methods
  extractTasksFromNote: async (noteId: string): Promise<Task[]> => {
    const notes = await localDB.getNotes();
    const note = notes.find(n => n.id === noteId);
    return note ? TaskManager.extractTasksFromNote(note) : [];
  },

  updateTaskInNote: async (noteId: string, taskId: string, updates: Partial<Task>) => {
    try {
      const notes = await localDB.getNotes();
      const note = notes.find(n => n.id === noteId);
      
      if (!note) {
        throw new Error('নোট পাওয়া যায়নি।');
      }

      const updatedTasks = (note.tasks || []).map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      );

      const updatedNote = {
        ...note,
        tasks: updatedTasks,
        updatedAt: Date.now()
      };

      await localDB.setNote(noteId, updatedNote);
      toast.success('কাজ আপডেট হয়েছে।');
    } catch (error) {
      toast.error('কাজ আপডেট করা যায়নি।');
      throw error;
    }
  },

  createTaskNote: async (task: Task): Promise<string | undefined> => {
    try {
      const noteData = TaskManager.createTaskNote(task);
      const newNote = await localDB.createNote();
      
      // Update the note with task data
      await localDB.updateNote(newNote.id, {
        title: noteData.title || 'কাজের নোট',
        content: noteData.content || newNote.content,
        tags: noteData.tags
      });
      
      toast.success('কাজের নোট তৈরি হয়েছে।');
      return newNote.id;
    } catch (error) {
      toast.error('কাজের নোট তৈরি করা যায়নি।');
      return undefined;
    }
  },

  // Version control methods
  createNoteVersion: async (noteId: string, message?: string) => {
    try {
      const notes = await localDB.getNotes();
      const note = notes.find(n => n.id === noteId);
      
      if (!note) {
        throw new Error('নোট পাওয়া যায়নি।');
      }

      const updatedNote = NoteVersionControl.addVersion(note, message);
      await localDB.setNote(noteId, updatedNote);
      toast.success('নোটের ভার্সন সংরক্ষিত হয়েছে।');
    } catch (error) {
      toast.error('ভার্সন সংরক্ষণ করা যায়নি।');
      throw error;
    }
  },

  restoreNoteVersion: async (noteId: string, versionIndex: number) => {
    try {
      const notes = await localDB.getNotes();
      const note = notes.find(n => n.id === noteId);
      
      if (!note) {
        throw new Error('নোট পাওয়া যায়নি।');
      }

      const restoredNote = NoteVersionControl.restoreToVersion(note, versionIndex);
      await localDB.setNote(noteId, restoredNote);
      toast.success('নোট পুরানো ভার্সনে ফিরে গেছে।');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'ভার্সন পুনরুদ্ধার করা যায়নি।';
      toast.error(errorMessage);
      throw error;
    }
  },

  compareNoteVersions: (noteId: string, oldIndex: number, newIndex: number) => {
    return localDB.getNotes().then(notes => {
      const note = notes.find(n => n.id === noteId);
      
      if (!note?.history || oldIndex < 0 || newIndex < 0 || 
          oldIndex >= note.history.length || newIndex >= note.history.length) {
        return [];
      }

      const oldVersion = note.history[oldIndex];
      const newVersion = note.history[newIndex];
      
      return NoteVersionControl.compareVersions(oldVersion.content, newVersion.content);
    });
  },

  createNoteBranch: async (noteId: string, branchName: string): Promise<string | undefined> => {
    try {
      const notes = await localDB.getNotes();
      const note = notes.find(n => n.id === noteId);
      
      if (!note) {
        throw new Error('নোট পাওয়া যায়নি।');
      }

      const branchNote = NoteVersionControl.createBranch(note, branchName);
      await localDB.setNote(branchNote.id, branchNote);
      toast.success(`নোটের শাখা "${branchName}" তৈরি হয়েছে।`);
      return branchNote.id;
    } catch (error) {
      toast.error('নোটের শাখা তৈরি করা যায়নি।');
      return undefined;
    }
  },

  // Privacy and anonymous notes
  createAnonymousNote: async (title: string, content: any, settings?: Partial<PrivacySettings>): Promise<string | undefined> => {
    try {
      const anonymousNote = PrivacyManager.createAnonymousNote(title, content, settings);
      await localDB.setNote(anonymousNote.id, anonymousNote);
      toast.success('গোপনীয় নোট তৈরি হয়েছে।');
      return anonymousNote.id;
    } catch (error) {
      toast.error('গোপনীয় নোট তৈরি করা যায়নি।');
      return undefined;
    }
  },

  makeNoteAnonymous: async (noteId: string) => {
    try {
      const notes = await localDB.getNotes();
      const note = notes.find(n => n.id === noteId);
      
      if (!note) {
        throw new Error('নোট পাওয়া যায়নি।');
      }

      const anonymousNote = PrivacyManager.makeNoteAnonymous(note);
      
      // Delete old note and create new anonymous note
      await localDB.deleteNotePermanently(noteId);
      await localDB.setNote(anonymousNote.id, anonymousNote);
      
      toast.success('নোট গোপনীয় করা হয়েছে।');
      return anonymousNote.id;
    } catch (error) {
      toast.error('নোট গোপনীয় করা যায়নি।');
      throw error;
    }
  },

  removeNoteAnonymity: async (noteId: string) => {
    try {
      const notes = await localDB.getNotes();
      const note = notes.find(n => n.id === noteId);
      
      if (!note) {
        throw new Error('নোট পাওয়া যায়নি।');
      }

      const regularNote = PrivacyManager.removeAnonymity(note);
      
      // Delete old anonymous note and create new regular note
      await localDB.deleteNotePermanently(noteId);
      await localDB.setNote(regularNote.id, regularNote);
      
      toast.success('নোটের গোপনীয়তা সরানো হয়েছে।');
      return regularNote.id;
    } catch (error) {
      toast.error('নোটের গোপনীয়তা সরানো যায়নি।');
      throw error;
    }
  },

  cleanupExpiredNotes: async () => {
    try {
      const notes = await localDB.getNotes();
      const cleanedNotes = PrivacyManager.cleanupExpiredNotes(notes);
      
      // Remove expired notes
      const expiredCount = notes.length - cleanedNotes.length;
      if (expiredCount > 0) {
        // Update storage with cleaned notes
        for (const note of notes) {
          if (!cleanedNotes.find(cn => cn.id === note.id)) {
            await localDB.deleteNotePermanently(note.id);
          }
        }
        
        toast.success(`${expiredCount}টি মেয়াদোত্তীর্ণ নোট পরিষ্কার করা হয়েছে।`);
      }
    } catch (error) {
      console.error('Failed to cleanup expired notes:', error);
    }
  },

  // Markdown import/export
  exportNoteAsMarkdown: async (noteId: string) => {
    try {
      const notes = await localDB.getNotes();
      const note = notes.find(n => n.id === noteId);
      
      if (!note) {
        throw new Error('নোট পাওয়া যায়নি।');
      }

      MarkdownConverter.exportAsFile(note.title, note.content);
      toast.success('মার্কডাউন ফাইল ডাউনলোড শুরু হয়েছে।');
    } catch (error) {
      toast.error('মার্কডাউন এক্সপোর্ট করা যায়নি।');
      throw error;
    }
  },

  importMarkdownNote: async (file: File): Promise<string | undefined> => {
    try {
      const { title, content } = await MarkdownConverter.importFromFile(file);
      const newNote = await localDB.createNote();
      
      // Update the note with imported data
      await localDB.updateNote(newNote.id, {
        title,
        content,
        tags: ['মার্কডাউন', 'imported'],
        bengaliDate: getCurrentBengaliDate()
      });
      
      toast.success('মার্কডাউন ফাইল ইম্পোর্ট হয়েছে।');
      return newNote.id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'মার্কডাউন ইম্পোর্ট করা যায়নি।';
      toast.error(errorMessage);
      return undefined;
    }
  },

  // Bengali calendar integration
  updateNoteBengaliDate: async (noteId: string) => {
    try {
      const notes = await localDB.getNotes();
      const note = notes.find(n => n.id === noteId);
      
      if (!note) {
        throw new Error('নোট পাওয়া যায়নি।');
      }

      const updatedNote = {
        ...note,
        bengaliDate: getCurrentBengaliDate(),
        updatedAt: Date.now()
      };

      await localDB.setNote(noteId, updatedNote);
    } catch (error) {
      console.error('Failed to update Bengali date:', error);
    }
  }
};
