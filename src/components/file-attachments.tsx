/**
 * File Attachments Component
 * Display and manage file attachments in notes
 */

"use client";

import React, { useRef } from "react";
import { FileAttachment } from "@/lib/types";
import { FileAttachmentManager } from "@/lib/file-attachments";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FileAttachmentsProps {
  attachments: FileAttachment[];
  onAddAttachment?: (file: File) => Promise<void>;
  onRemoveAttachment?: (attachmentId: string) => Promise<void>;
  readonly?: boolean;
  className?: string;
}

export function FileAttachments({
  attachments = [],
  onAddAttachment,
  onRemoveAttachment,
  readonly = false,
  className,
}: FileAttachmentsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    for (const file of files) {
      try {
        if (onAddAttachment) {
          await onAddAttachment(file);
        }
      } catch (error) {
        console.error("Failed to add attachment:", error);
      }
    }

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownload = (attachment: FileAttachment) => {
    try {
      FileAttachmentManager.downloadAttachment(attachment);
    } catch (error) {
      toast.error("ফাইল ডাউনলোড করা যায়নি।");
    }
  };

  const handleRemove = async (attachmentId: string) => {
    if (onRemoveAttachment) {
      try {
        await onRemoveAttachment(attachmentId);
      } catch (error) {
        console.error("Failed to remove attachment:", error);
      }
    }
  };

  const getAttachmentIcon = (attachment: FileAttachment) => {
    const iconName = FileAttachmentManager.getAttachmentIcon(attachment);
    const IconComponent = (Icons as any)[iconName];
    return IconComponent ? (
      <IconComponent className="h-4 w-4" />
    ) : (
      <Icons.File className="h-4 w-4" />
    );
  };

  const getAttachmentPreview = (attachment: FileAttachment) => {
    if (FileAttachmentManager.isImage(attachment)) {
      const blobUrl = FileAttachmentManager.getBlobUrl(attachment);
      return (
        <img
          src={blobUrl}
          alt={attachment.name}
          className="h-16 w-16 rounded object-cover"
          onLoad={() => URL.revokeObjectURL(blobUrl)}
        />
      );
    }

    return (
      <div className="flex h-16 w-16 items-center justify-center rounded bg-muted">
        {getAttachmentIcon(attachment)}
      </div>
    );
  };

  return (
    <div className={cn("space-y-3", className)}>
      {!readonly && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="gap-2"
          >
            <Icons.File className="h-4 w-4" />
            ফাইল সংযুক্ত করুন
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,application/pdf,.txt,.doc,.docx,.mp3,.wav,.ogg"
          />
        </div>
      )}

      {attachments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            সংযুক্ত ফাইল ({attachments.length})
          </h4>

          <div className="grid gap-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                {getAttachmentPreview(attachment)}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">
                      {attachment.name}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {FileAttachmentManager.formatFileSize(attachment.size)}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {new Date(attachment.createdAt).toLocaleDateString(
                        "bn-BD",
                      )}
                    </span>

                    {FileAttachmentManager.isImage(attachment) && (
                      <Badge variant="outline" className="text-xs">
                        ছবি
                      </Badge>
                    )}

                    {FileAttachmentManager.isDocument(attachment) && (
                      <Badge variant="outline" className="text-xs">
                        ডকুমেন্ট
                      </Badge>
                    )}

                    {FileAttachmentManager.isAudio(attachment) && (
                      <Badge variant="outline" className="text-xs">
                        অডিও
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(attachment)}
                    className="h-8 w-8 p-0"
                    title="ডাউনলোড"
                  >
                    <Icons.Download className="h-4 w-4" />
                  </Button>

                  {!readonly && onRemoveAttachment && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(attachment.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      title="সরান"
                    >
                      <Icons.X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {attachments.length === 0 && !readonly && (
        <div className="text-center py-6 text-muted-foreground text-sm">
          <Icons.File className="h-8 w-8 mx-auto mb-2 opacity-50" />
          কোন ফাইল সংযুক্ত নেই
        </div>
      )}
    </div>
  );
}
