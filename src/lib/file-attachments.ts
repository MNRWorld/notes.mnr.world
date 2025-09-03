/**
 * File Attachment Management
 * Handles file uploads, storage, and retrieval for notes
 */

import { FileAttachment } from "./types";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];
const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ALLOWED_AUDIO_TYPES = [
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "audio/mp4",
];

export class FileAttachmentManager {
  /**
   * Convert file to base64 string
   */
  static async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Create attachment from file
   */
  static async createAttachment(file: File): Promise<FileAttachment> {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("ফাইলের আকার অনেক বড়। সর্বোচ্চ ১০ এমবি সমর্থিত।");
    }

    // Validate file type
    const allowedTypes = [
      ...ALLOWED_IMAGE_TYPES,
      ...ALLOWED_DOCUMENT_TYPES,
      ...ALLOWED_AUDIO_TYPES,
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error("এই ধরনের ফাইল সমর্থিত নয়।");
    }

    const base64Data = await this.fileToBase64(file);

    return {
      id: `attachment_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      data: base64Data,
      createdAt: Date.now(),
    };
  }

  /**
   * Get attachment as blob URL for display
   */
  static getBlobUrl(attachment: FileAttachment): string {
    const byteCharacters = atob(attachment.data);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: attachment.type });

    return URL.createObjectURL(blob);
  }

  /**
   * Download attachment
   */
  static downloadAttachment(attachment: FileAttachment): void {
    const blobUrl = this.getBlobUrl(attachment);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return "০ বাইট";

    const k = 1024;
    const sizes = ["বাইট", "কেবি", "এমবি", "জিবি"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }

  /**
   * Check if attachment is an image
   */
  static isImage(attachment: FileAttachment): boolean {
    return ALLOWED_IMAGE_TYPES.includes(attachment.type);
  }

  /**
   * Check if attachment is a document
   */
  static isDocument(attachment: FileAttachment): boolean {
    return ALLOWED_DOCUMENT_TYPES.includes(attachment.type);
  }

  /**
   * Check if attachment is audio
   */
  static isAudio(attachment: FileAttachment): boolean {
    return ALLOWED_AUDIO_TYPES.includes(attachment.type);
  }

  /**
   * Get attachment icon based on type
   */
  static getAttachmentIcon(attachment: FileAttachment): string {
    if (this.isImage(attachment)) return "File";
    if (this.isDocument(attachment)) return "FileText";
    if (this.isAudio(attachment)) return "Music";
    return "File";
  }
}
