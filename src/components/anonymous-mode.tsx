/**
 * Anonymous Mode Indicator Component
 * Shows privacy status and controls for notes
 */

"use client";

import React from "react";
import { Note } from "@/lib/types";
import { PrivacyManager } from "@/lib/privacy-manager";
import { Icons } from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PrivacyIndicatorProps {
  note: Note;
  showDetails?: boolean;
  className?: string;
}

export function PrivacyIndicator({
  note,
  showDetails = false,
  className,
}: PrivacyIndicatorProps) {
  const privacySummary = PrivacyManager.getPrivacySummary(note);

  if (
    !privacySummary.isAnonymous &&
    !privacySummary.willAutoDelete
  ) {
    return null;
  }

  const getTimeRemaining = () => {
    if (!privacySummary.autoDeleteAt) return null;

    const now = Date.now();
    const remaining = privacySummary.autoDeleteAt - now;

    if (remaining <= 0) return "মেয়াদ শেষ";

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours} ঘন্টা ${minutes} মিনিট`;
    }

    return `${minutes} মিনিট`;
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {privacySummary.isAnonymous && (
        <Badge variant="secondary" className="gap-1 text-xs">
          <Icons.Eye className="h-3 w-3" />
          Anonymous
        </Badge>
      )}

      {privacySummary.willAutoDelete && (
        <Badge variant="destructive" className="gap-1 text-xs">
          <Icons.Clock className="h-3 w-3" />
          {getTimeRemaining()}
        </Badge>
      )}

      {showDetails && (
        <div className="text-xs text-muted-foreground">
          {privacySummary.isAnonymous &&
            "This note was created in anonymous mode"}
          {privacySummary.willAutoDelete && " • স্বয়ংক্রিয় মুছে যাবে"}
        </div>
      )}
    </div>
  );
}

interface PrivacyControlsProps {
  note: Note;
  onMakeAnonymous?: () => void;
  onRemoveAnonymity?: () => void;
  className?: string;
}

export function PrivacyControls({
  note,
  onMakeAnonymous,
  onRemoveAnonymity,
  className,
}: PrivacyControlsProps) {
  const privacySummary = PrivacyManager.getPrivacySummary(note);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">Privacy Settings</h4>
          <p className="text-sm text-muted-foreground">
            Control the privacy of this note
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-2">
            <Icons.Eye className="h-4 w-4" />
            <div>
              <div className="font-medium text-sm">Anonymous Mode</div>
              <div className="text-xs text-muted-foreground">
                Mark the note as anonymous
              </div>
            </div>
          </div>

          {privacySummary.isAnonymous ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onRemoveAnonymity}
              className="gap-2"
            >
              <Icons.EyeOff className="h-4 w-4" />
              Remove Anonymity
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={onMakeAnonymous}
              className="gap-2"
            >
              <Icons.Eye className="h-4 w-4" />
              Make Anonymous
            </Button>
          )}
        </div>

        {privacySummary.willAutoDelete && (
          <div className="p-3 border rounded-lg bg-destructive/10">
            <div className="flex items-center gap-2 mb-2">
              <Icons.Clock className="h-4 w-4 text-destructive" />
              <div className="font-medium text-sm">স্বয়ংক্রিয় মুছে যাবে</div>
            </div>
            <div className="text-xs text-muted-foreground">
              This note will be automatically deleted at{" "}
              {new Date(privacySummary.autoDeleteAt!).toLocaleString("en-US")}{" "}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
        <div className="text-xs text-muted-foreground">
          <strong>Important:</strong> Anonymous notes remain on your device and
          are not synced anywhere.
        </div>
      </div>
    </div>
  );
}

interface AnonymousModeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateNote: (settings: any) => void;
}

export function AnonymousModeDialog({
  isOpen,
  onClose,
  onCreateNote,
}: AnonymousModeDialogProps) {
  const [duration, setDuration] = React.useState<
    "session" | "1hour" | "1day" | "1week"
  >("session");

  const handleCreate = () => {
    const settings = {
      anonymousMode: true,
      hideFromHistory: true,
      autoDeleteAfter:
        duration === "session"
          ? undefined
          : duration === "1hour"
            ? 60 * 60 * 1000
            : duration === "1day"
              ? 24 * 60 * 60 * 1000
              : 7 * 24 * 60 * 60 * 1000,
    };

    onCreateNote(settings);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Icons.Eye className="h-5 w-5" />
            Create Anonymous Note
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <Icons.X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Expiration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value as any)}
              className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="session">Until session ends</option>
              <option value="1hour">1 hour</option>
              <option value="1day">1 day</option>
              <option value="1week">1 week</option>
            </select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleCreate} className="flex-1">
              Create Note
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
