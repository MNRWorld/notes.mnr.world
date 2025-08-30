
"use client";

import React, { useRef, useEffect, KeyboardEvent, ElementType } from "react";
import {
  Sparkles,
  Wand2,
  ChevronDown,
  BookOpen,
  Search,
  Code,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ModelType } from "@/components/types";

interface ChatInputProps {
  inputValue: string;
  onInputValueChange: (value: string) => void;
  selectedModel: ModelType | null;
  onSelectedModelChange: (model: ModelType) => void;
  onFormSubmit: () => void;
}

export const ChatInput = ({
  inputValue,
  onInputValueChange,
  selectedModel,
  onSelectedModelChange,
  onFormSubmit,
}: ChatInputProps) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onFormSubmit();
    }
  };

  const getPlaceholderText = () => {
    if (!selectedModel) {
      return "কাজ শুরু করার জন্য একটি প্লাগইন সিলেক্ট করুন...";
    }
    switch (selectedModel) {
      case "mnrWiKi":
        return "উইকিপিডিয়াতে কী খুঁজতে চান?";
      case "mnrArticles":
        return "ট্যাগ দিয়ে আর্টিকেল খুঁজুন (যেমন: javascript, ai)";
      default:
        return "কিছু একটা লিখুন...";
    }
  };

  const models: {
    id: ModelType;
    name: string;
    icon: ElementType;
    disabled?: boolean;
  }[] = [
    { id: "mnrWiKi", name: "mnrWiKi", icon: BookOpen },
    { id: "mnrArticles", name: "mnrArticles", icon: Code },
    { id: "mnrSearch", name: "mnrSearch", icon: Search, disabled: true },
  ];

  return (
    <footer className="shrink-0">
      <div className="mx-auto w-full max-w-4xl p-2 sm:p-4">
        <div className="rounded-xl border border-border bg-background p-2 sm:p-3 shadow-2xl">
          <div className="flex items-start gap-2 sm:gap-3">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => onInputValueChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={getPlaceholderText()}
              className="min-h-[40px] max-h-48 flex-grow resize-none border-0 bg-transparent p-2 text-sm placeholder:text-muted-foreground/60 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 sm:text-base sm:p-3"
              rows={1}
              disabled={!selectedModel}
            />
            <Button
              size="icon"
              className="h-10 w-10 shrink-0 rounded-lg sm:rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
              onClick={onFormSubmit}
              disabled={!inputValue.trim() || !selectedModel}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-2 sm:mt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8 rounded-lg sm:h-9 sm:rounded-xl border border-primary/30 bg-primary/10 backdrop-blur-sm hover:bg-primary/20 transition-all duration-300"
                  >
                    {selectedModel ? (
                      <>
                        {React.createElement(
                          models.find((m) => m.id === selectedModel)?.icon ||
                            Sparkles,
                          { className: "mr-2 h-4 w-4" },
                        )}
                      </>
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    <span className="truncate">
                      {selectedModel
                        ? models.find((m) => m.id === selectedModel)?.name
                        : "প্লাগইন"}
                    </span>
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="rounded-xl border-border bg-background/80 backdrop-blur-xl">
                  {models.map((model) => (
                    <DropdownMenuItem
                      key={model.id}
                      onClick={() => onSelectedModelChange(model.id)}
                      disabled={model.disabled}
                      className="rounded-lg transition-all duration-200 hover:bg-primary/10"
                    >
                      <model.icon className="mr-2 h-4 w-4" />
                      {model.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-lg sm:h-9 sm:rounded-xl hover:bg-accent/10 transition-all duration-300"
              disabled
            >
              <Wand2 className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">উন্নত করুন</span>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};

ChatInput.displayName = "ChatInput";
