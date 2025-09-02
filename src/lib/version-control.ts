/**
 * Version Control System for Notes
 * Git-like versioning for important notes
 */

import { Note, NoteHistory, EditorOutputData } from './types';

export interface VersionDiff {
  type: 'added' | 'removed' | 'modified';
  blockIndex: number;
  oldContent?: string;
  newContent?: string;
}

export class NoteVersionControl {
  /**
   * Create a new version snapshot
   */
  static createVersion(note: Note, message?: string): NoteHistory {
    const version = this.generateVersionId(note.history?.length || 0);
    
    return {
      content: JSON.parse(JSON.stringify(note.content)), // Deep clone
      updatedAt: Date.now(),
      version,
      message: message || 'স্বয়ংক্রিয় সংরক্ষণ'
    };
  }

  /**
   * Generate version ID (v1, v2, etc.)
   */
  private static generateVersionId(currentVersionCount: number): string {
    return `v${currentVersionCount + 1}`;
  }

  /**
   * Add version to note history
   */
  static addVersion(note: Note, message?: string): Note {
    const newVersion = this.createVersion(note, message);
    
    const updatedNote = {
      ...note,
      history: [...(note.history || []), newVersion],
      version: newVersion.version,
      updatedAt: Date.now()
    };

    // Keep only last 10 versions to save space
    if (updatedNote.history.length > 10) {
      updatedNote.history = updatedNote.history.slice(-10);
    }

    return updatedNote;
  }

  /**
   * Compare two versions and get differences
   */
  static compareVersions(oldContent: EditorOutputData, newContent: EditorOutputData): VersionDiff[] {
    const diffs: VersionDiff[] = [];
    const oldBlocks = oldContent.blocks || [];
    const newBlocks = newContent.blocks || [];

    const maxLength = Math.max(oldBlocks.length, newBlocks.length);

    for (let i = 0; i < maxLength; i++) {
      const oldBlock = oldBlocks[i];
      const newBlock = newBlocks[i];

      if (!oldBlock && newBlock) {
        // New block added
        diffs.push({
          type: 'added',
          blockIndex: i,
          newContent: this.getBlockText(newBlock)
        });
      } else if (oldBlock && !newBlock) {
        // Block removed
        diffs.push({
          type: 'removed',
          blockIndex: i,
          oldContent: this.getBlockText(oldBlock)
        });
      } else if (oldBlock && newBlock) {
        const oldText = this.getBlockText(oldBlock);
        const newText = this.getBlockText(newBlock);

        if (oldText !== newText) {
          // Block modified
          diffs.push({
            type: 'modified',
            blockIndex: i,
            oldContent: oldText,
            newContent: newText
          });
        }
      }
    }

    return diffs;
  }

  /**
   * Extract text content from a block
   */
  private static getBlockText(block: any): string {
    switch (block.type) {
      case 'paragraph':
      case 'header':
        return block.data.text || '';
      case 'list':
        return (block.data.items || []).join(', ');
      case 'checklist':
        return (block.data.items || []).map((item: any) => item.text).join(', ');
      case 'quote':
        return block.data.text || '';
      case 'code':
        return block.data.code || '';
      case 'table':
        return (block.data.content || []).flat().join(' ');
      default:
        return JSON.stringify(block.data);
    }
  }

  /**
   * Restore note to a specific version
   */
  static restoreToVersion(note: Note, versionIndex: number): Note {
    if (!note.history || versionIndex < 0 || versionIndex >= note.history.length) {
      throw new Error('অবৈধ ভার্সন নম্বর।');
    }

    const targetVersion = note.history[versionIndex];
    
    // Create a new version before restoring
    const currentVersion = this.createVersion(note, `ভার্সন ${targetVersion.version} এ ফিরে যাওয়া`);

    return {
      ...note,
      content: JSON.parse(JSON.stringify(targetVersion.content)),
      history: [...note.history, currentVersion],
      updatedAt: Date.now(),
      version: this.generateVersionId(note.history.length)
    };
  }

  /**
   * Get version summary
   */
  static getVersionSummary(history: NoteHistory[], index: number): string {
    if (!history || index < 0 || index >= history.length) {
      return '';
    }

    const version = history[index];
    const date = new Date(version.updatedAt);
    const timeAgo = this.getTimeAgo(version.updatedAt);

    return `${version.version} • ${timeAgo} • ${version.message}`;
  }

  /**
   * Get human-readable time difference
   */
  private static getTimeAgo(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'এখনই';
    if (minutes < 60) return `${minutes} মিনিট আগে`;
    if (hours < 24) return `${hours} ঘন্টা আগে`;
    if (days < 30) return `${days} দিন আগে`;

    const date = new Date(timestamp);
    return date.toLocaleDateString('bn-BD');
  }

  /**
   * Check if note should auto-version
   */
  static shouldAutoVersion(note: Note, newContent: EditorOutputData): boolean {
    if (!note.history || note.history.length === 0) {
      return true; // First version
    }

    const lastVersion = note.history[note.history.length - 1];
    const timeSinceLastVersion = Date.now() - lastVersion.updatedAt;

    // Auto-version if:
    // 1. More than 30 minutes since last version
    // 2. Significant changes (more than 3 diffs)
    const thirtyMinutes = 30 * 60 * 1000;
    const hasSignificantChanges = this.compareVersions(lastVersion.content, newContent).length > 3;

    return timeSinceLastVersion > thirtyMinutes || hasSignificantChanges;
  }

  /**
   * Create branch from current note
   */
  static createBranch(note: Note, branchName: string): Note {
    const branchId = `${note.id}_branch_${Date.now()}`;
    
    return {
      ...note,
      id: branchId,
      title: `${note.title} (${branchName})`,
      parentVersion: note.version,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      history: note.history ? [...note.history] : []
    };
  }

  /**
   * Export version history as JSON
   */
  static exportVersionHistory(note: Note): string {
    const exportData = {
      noteId: note.id,
      title: note.title,
      currentVersion: note.version,
      history: note.history,
      exportedAt: Date.now()
    };

    return JSON.stringify(exportData, null, 2);
  }
}
