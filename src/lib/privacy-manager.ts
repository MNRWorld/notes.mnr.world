/**
 * Privacy Mode and Anonymous Note Creation
 * Handles incognito note creation and privacy features
 */

import { Note, EditorOutputData } from "./types";

export interface PrivacySettings {
  anonymousMode: boolean;
  hideFromHistory: boolean;
  autoDeleteAfter?: number; // milliseconds
  encryptContent: boolean;
}

export class PrivacyManager {
  private static readonly ANONYMOUS_PREFIX = "anon_";
  private static readonly ENCRYPTION_KEY_STORAGE = "privacy_encryption_key";

  /**
   * Create an anonymous note
   */
  static createAnonymousNote(
    title: string,
    content: EditorOutputData,
    settings: Partial<PrivacySettings> = {},
  ): Note {
    const privacySettings: PrivacySettings = {
      anonymousMode: true,
      hideFromHistory: true,
      encryptContent: false,
      ...settings,
    };

    const noteId = this.generateAnonymousId();
    const now = Date.now();

    const note: Note = {
      id: noteId,
      title: title || "গোপন নোট",
      content: privacySettings.encryptContent
        ? this.encryptContent(content)
        : content,
      createdAt: now,
      updatedAt: now,
      isPinned: false,
      isLocked: false,
      isArchived: false,
      isTrashed: false,
      isAnonymous: true,
      tags: ["গোপনীয়", "anonymous"],
    };

    // Set auto-delete if specified
    if (privacySettings.autoDeleteAfter) {
      // Store deletion time in a special property
      (note as any).autoDeleteAt = now + privacySettings.autoDeleteAfter;
    }

    return note;
  }

  /**
   * Generate anonymous note ID
   */
  private static generateAnonymousId(): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `${this.ANONYMOUS_PREFIX}${timestamp}_${randomStr}`;
  }

  /**
   * Check if a note is anonymous
   */
  static isAnonymousNote(note: Note): boolean {
    return (
      note.isAnonymous === true || note.id.startsWith(this.ANONYMOUS_PREFIX)
    );
  }

  /**
   * Convert regular note to anonymous
   */
  static makeNoteAnonymous(note: Note): Note {
    return {
      ...note,
      id: this.generateAnonymousId(),
      title: note.title || "গোপন নোট",
      isAnonymous: true,
      tags: [...(note.tags || []), "গোপনীয়", "anonymous"].filter(
        (tag, index, arr) => arr.indexOf(tag) === index,
      ),
      updatedAt: Date.now(),
    };
  }

  /**
   * Remove anonymity from note
   */
  static removeAnonymity(note: Note): Note {
    const regularId = `note_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    return {
      ...note,
      id: regularId,
      isAnonymous: false,
      tags: (note.tags || []).filter(
        (tag) => tag !== "গোপনীয়" && tag !== "anonymous",
      ),
      updatedAt: Date.now(),
    };
  }

  /**
   * Simple content encryption (for demonstration - use proper encryption in production)
   */
  private static encryptContent(content: EditorOutputData): EditorOutputData {
    try {
      const jsonString = JSON.stringify(content);
      const encoded = btoa(unescape(encodeURIComponent(jsonString)));

      return {
        version: content.version,
        time: content.time,
        blocks: [
          {
            type: "paragraph",
            data: {
              text: `[ENCRYPTED:${encoded}]`,
            },
          },
        ],
      };
    } catch (error) {
      console.error("Encryption failed:", error);
      return content;
    }
  }

  /**
   * Decrypt content
   */
  static decryptContent(content: EditorOutputData): EditorOutputData {
    try {
      if (
        content.blocks?.length === 1 &&
        content.blocks[0].type === "paragraph"
      ) {
        const text = content.blocks[0].data?.text || "";
        const encryptedMatch = text.match(/^\[ENCRYPTED:(.+)\]$/);

        if (encryptedMatch) {
          const encoded = encryptedMatch[1];
          const jsonString = decodeURIComponent(escape(atob(encoded)));
          return JSON.parse(jsonString);
        }
      }

      return content;
    } catch (error) {
      console.error("Decryption failed:", error);
      return content;
    }
  }

  /**
   * Check if content is encrypted
   */
  static isContentEncrypted(content: EditorOutputData): boolean {
    if (
      content.blocks?.length === 1 &&
      content.blocks[0].type === "paragraph"
    ) {
      const text = content.blocks[0].data?.text || "";
      return text.startsWith("[ENCRYPTED:") && text.endsWith("]");
    }
    return false;
  }

  /**
   * Clean up expired anonymous notes
   */
  static cleanupExpiredNotes(notes: Note[]): Note[] {
    const now = Date.now();

    return notes.filter((note) => {
      if (!this.isAnonymousNote(note)) return true;

      const autoDeleteAt = (note as any).autoDeleteAt;
      if (autoDeleteAt && autoDeleteAt < now) {
        console.log(`Cleaning up expired anonymous note: ${note.id}`);
        return false;
      }

      return true;
    });
  }

  /**
   * Get privacy summary for a note
   */
  static getPrivacySummary(note: Note): {
    isAnonymous: boolean;
    isEncrypted: boolean;
    willAutoDelete: boolean;
    autoDeleteAt?: number;
  } {
    return {
      isAnonymous: this.isAnonymousNote(note),
      isEncrypted: this.isContentEncrypted(note.content),
      willAutoDelete: !!(note as any).autoDeleteAt,
      autoDeleteAt: (note as any).autoDeleteAt,
    };
  }

  /**
   * Create incognito mode settings
   */
  static createIncognitoSettings(
    duration?: "session" | "1hour" | "1day" | "1week",
  ): PrivacySettings {
    let autoDeleteAfter: number | undefined;

    switch (duration) {
      case "1hour":
        autoDeleteAfter = 60 * 60 * 1000;
        break;
      case "1day":
        autoDeleteAfter = 24 * 60 * 60 * 1000;
        break;
      case "1week":
        autoDeleteAfter = 7 * 24 * 60 * 60 * 1000;
        break;
      case "session":
      default:
        // Session-based deletion would need additional implementation
        autoDeleteAfter = undefined;
        break;
    }

    return {
      anonymousMode: true,
      hideFromHistory: true,
      autoDeleteAfter,
      encryptContent: true,
    };
  }

  /**
   * Sanitize note for privacy (remove identifying information)
   */
  static sanitizeNoteForPrivacy(note: Note): Note {
    return {
      ...note,
      // Remove or modify identifying information
      createdAt:
        Math.floor(note.createdAt / (1000 * 60 * 60)) * (1000 * 60 * 60), // Round to hour
      updatedAt:
        Math.floor(note.updatedAt / (1000 * 60 * 60)) * (1000 * 60 * 60), // Round to hour
      history: undefined, // Remove version history
      // Keep content and essential properties
    };
  }

  /**
   * Get anonymous note statistics (for privacy dashboard)
   */
  static getAnonymousNoteStats(notes: Note[]): {
    totalAnonymous: number;
    totalEncrypted: number;
    expiringSoon: number;
    totalRegular: number;
  } {
    const anonymousNotes = notes.filter((note) => this.isAnonymousNote(note));
    const encryptedNotes = notes.filter((note) =>
      this.isContentEncrypted(note.content),
    );

    const now = Date.now();
    const nextHour = now + 60 * 60 * 1000;
    const expiringSoon = anonymousNotes.filter((note) => {
      const autoDeleteAt = (note as any).autoDeleteAt;
      return autoDeleteAt && autoDeleteAt <= nextHour;
    }).length;

    return {
      totalAnonymous: anonymousNotes.length,
      totalEncrypted: encryptedNotes.length,
      expiringSoon,
      totalRegular: notes.length - anonymousNotes.length,
    };
  }
}
