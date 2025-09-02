"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { toast } from "sonner";

interface ApiKeyDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onApiKeySubmit: (apiKey: string) => void;
  onSkip?: () => void;
}

export default function ApiKeyDialog({
  isOpen,
  onOpenChange,
  onApiKeySubmit,
  onSkip,
}: ApiKeyDialogProps) {
  const [key, setKey] = useState("");

  const handleSubmit = () => {
    if (key.trim()) {
      onApiKeySubmit(key.trim());
      onOpenChange(false);
      toast.success("API কী সফলভাবে সংরক্ষিত হয়েছে।");
      setKey("");
    } else {
      toast.error("API কী খালি রাখা যাবে না।");
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
      onOpenChange(false);
      toast.info("আপনি পরে প্রোফাইল সেটিংস থেকে API কী সেট করতে পারবেন।");
      setKey("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => onSkip ? undefined : e.preventDefault()}
        showCloseButton={!!onSkip}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icons.Key className="h-5 w-5" />
            Gemini API কী দিন
          </DialogTitle>
          <DialogDescription>
            AI ফিচার ব্যবহার করতে আপনার নিজস্ব Gemini API কী প্রয়োজন।
            আপনার কী স্থানীয়ভাবে সংরক্ষিত থাকে এবং কখনও শেয়ার করা হয় না। আপনি{" "}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Google AI Studio
            </a>
            {" "}থেকে একটি কী পেতে পারেন।
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="এখানে আপনার API কী দিন"
            type="password"
          />
        </div>
        <DialogFooter className="flex gap-2 sm:gap-2">
          {onSkip && (
            <Button 
              variant="outline" 
              onClick={handleSkip} 
              className="flex-1"
            >
              এখনের জন্য এড়িয়ে যান
            </Button>
          )}
          <Button onClick={handleSubmit} className="flex-1">
            সংরক্ষণ করুন এবং চালিয়ে যান
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
