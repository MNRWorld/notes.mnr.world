"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "./button";

interface PasscodeDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: (passcode: string) => void;
  isSettingNew: boolean;
}

export default function PasscodeDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  isSettingNew,
}: PasscodeDialogProps) {
  const [passcode, setPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = useCallback(() => {
    if (isSettingNew) {
      if (passcode.length !== 4) {
        setError("পাসকোড ৪ সংখ্যার হতে হবে।");
        return;
      }
      if (passcode !== confirmPasscode) {
        setError("পাসকোড দুটি মেলেনি।");
        return;
      }
    }
    setError("");
    onConfirm(passcode);
    setPasscode("");
    setConfirmPasscode("");
  }, [isSettingNew, passcode, confirmPasscode, onConfirm]);

  const handleClose = useCallback(() => {
    setPasscode("");
    setConfirmPasscode("");
    setError("");
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isSettingNew ? "নতুন পাসকোড সেট" : "পাসকোড দিন"}
          </DialogTitle>
          <DialogDescription>
            {isSettingNew
              ? "নোট লক করতে ৪-সংখ্যার পাসকোড তৈরি করুন।"
              : "নোটটি দেখতে ৪-সংখ্যার পাসকোড দিন।"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            type="password"
            maxLength={4}
            value={passcode}
            onChange={(e) => setPasscode(e.target.value.replace(/\\D/g, ""))}
            placeholder="৪-সংখ্যার পাসকোড"
            inputMode="numeric"
            pattern="[0-9]*"
          />
          {isSettingNew && (
            <Input
              type="password"
              maxLength={4}
              value={confirmPasscode}
              onChange={(e) =>
                setConfirmPasscode(e.target.value.replace(/\\D/g, ""))
              }
              placeholder="পাসকোড নিশ্চিত করুন"
              inputMode="numeric"
              pattern="[0-9]*"
            />
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            বাতিল
          </Button>
          <Button onClick={handleConfirm}>নিশ্চিত</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
PasscodeDialog.displayName = "PasscodeDialog";
