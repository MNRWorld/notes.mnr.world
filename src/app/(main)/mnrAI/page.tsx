"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/use-settings";
import { useApiKeyStore } from "@/stores/use-api-key-store";
import { useChatStore } from "@/stores/use-chat-store";
import React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { runGemini } from "@/lib/gemini";
import type { ChatMessage } from "@/components/types";
import {
  UserMessage,
  BotMessage,
  LoadingMessage,
} from "@/components/chat-messages";
import { ChatInput } from "@/components/chat-input";
import EmptyState from "@/components/empty-state";
import PageTransition from "@/components/page-transition";
import ApiKeyDialog from "@/components/api-key-dialog";
import { ChatHistorySidebar } from "@/components/chat-history-sidebar";
import { useKeyboard } from "@/hooks/use-keyboard";

const WelcomeScreen = ({
  onPromptClick,
  hasApiKey,
  onSetupApiKey,
}: {
  onPromptClick: (prompt: string) => void;
  hasApiKey: boolean;
  onSetupApiKey?: () => void;
}) => {
  if (!hasApiKey) {
    return (
      <EmptyState
        onNewNote={onSetupApiKey || (() => {})}
        onImportClick={() => {}}
        icon={Icons.Key}
        title="API কী প্রয়োজন"
        description="AI ফিচার ব্যবহার করতে একটি Gemini API কী সেটআপ করা প্রয়োজন। এখনই সেটআপ করতে নিচের বোতামে ক্লিক করুন।"
        primaryActionText="API কী সেটআপ করুন"
        hideSecondaryAction
      />
    );
  }

  return (
    <EmptyState
      onNewNote={() => onPromptClick("বাংলাদেশের রাজধানী কী?")}
      onImportClick={() => {}}
      icon={Icons.Bot}
      title="mnrAI তে স্বাগতম"
      description="Gemini এর সাহায্যে জ্ঞানের জগত অন্বেষণ করুন।"
      primaryActionText="একটি প্রম্পট চেষ্টা করুন"
      hideSecondaryAction
    />
  );
};

export default function MnrAIPage() {
  const font = useSettingsStore((state) => state.font);
  const { apiKey, isSkipped, setApiKey, setSkipped } = useApiKeyStore();
  const keyboard = useKeyboard();

  const {
    messages,
    addMessage,
    updateLastMessage,
    clearCurrentChat,
    currentSession,
    sessions,
  } = useChatStore();

  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  const [sessionCount, setSessionCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);

  useEffect(() => {
    setSessionCount(sessions.length);
  }, [sessions]);

  useEffect(() => {
    setMessageCount(messages.length);
  }, [messages]);

  useEffect(() => {
    if (!apiKey && !isSkipped) {
      setIsApiKeyDialogOpen(true);
    }
  }, [apiKey, isSkipped]);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({
        top: viewportRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        return;
      }

      if (!apiKey) {
        setIsApiKeyDialogOpen(true);
        return;
      }

      const newUserMessage: ChatMessage = { type: "user", query };
      addMessage(newUserMessage);
      setIsLoading(true);
      setInputValue("");

      const botMessage: ChatMessage = { type: "bot", content: "" };
      addMessage(botMessage);

      try {
        const stream = await runGemini(query, apiKey);
        let fullResponse = "";

        for await (const chunk of stream) {
          fullResponse += chunk;
          updateLastMessage(fullResponse);
        }
      } catch (error: any) {
        const errorMessage =
          error.message || "একটি ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।";
        const errorMsg: ChatMessage = {
          type: "error",
          errorText: errorMessage,
        };
        addMessage(errorMsg);

        if (errorMessage.includes("অবৈধ API কী")) {
          setIsApiKeyDialogOpen(true);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [apiKey, addMessage, updateLastMessage],
  );

  const handleFormSubmit = () => {
    handleSearch(inputValue);
  };

  const handlePromptClick = (prompt: string) => {
    setInputValue(prompt);
    handleSearch(prompt);
  };

  const handleNewChat = () => {
    clearCurrentChat();
    setInputValue("");
    setIsLoading(false);
  };

  const renderMessage = (message: ChatMessage, index: number) => {
    switch (message.type) {
      case "user":
        return <UserMessage key={index} message={message} />;
      case "bot":
      case "error":
        return <BotMessage key={index} message={message} />;
      case "loading":
        return <LoadingMessage key={index} />;
      default:
        return null;
    }
  };

  return (
    <PageTransition
      className={cn(
        "flex flex-col overflow-hidden relative bg-gradient-to-br from-background via-background to-muted/30",
        "chat-viewport mobile-chat-container",
        font,
      )}
    >
      <ApiKeyDialog
        isOpen={isApiKeyDialogOpen}
        onOpenChange={setIsApiKeyDialogOpen}
        onApiKeySubmit={setApiKey}
        onSkip={() => setSkipped(true)}
      />

      <ChatHistorySidebar
        isOpen={isHistorySidebarOpen}
        onClose={() => setIsHistorySidebarOpen(false)}
      />
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 flex h-16 shrink-0 items-center justify-between border-b border-border/50 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm px-4 sm:px-6"
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsHistorySidebarOpen(true)}
            className="lg:hidden h-9 w-9 rounded-xl hover:bg-muted/80 transition-all duration-200 hover:scale-105"
          >
            <Icons.LayoutGrid className="h-4 w-4" />
          </Button>

          <div className="relative">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Avatar className="h-10 w-10 ring-2 ring-primary/20 ring-offset-2 ring-offset-background shadow-lg bg-gradient-to-br from-primary via-primary to-accent text-primary-foreground">
                <AvatarImage src="/favicon.png" alt="mnrAI" />
                <AvatarFallback>
                  <Icons.Bot className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-background shadow-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                mnrAI
              </h1>
              <p className="text-xs text-muted-foreground font-medium -mt-1">
                Gemini AI দ্বারা চালিত
              </p>
            </div>
            {currentSession && (
              <Badge
                variant="secondary"
                className="hidden sm:inline-flex font-medium shadow-sm"
              >
                <Icons.Circle className="w-3 h-3 mr-1" />
                {messageCount} বার্তা
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsHistorySidebarOpen(true)}
            className="hidden lg:flex hover:bg-muted/80 transition-all duration-200 hover:scale-105 rounded-xl"
          >
            <Icons.History className="mr-2 h-4 w-4" />
            ইতিহাস ({sessionCount})
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNewChat}
            className="border-primary/30 bg-background/50 hover:bg-primary/10 transition-all duration-300 group rounded-xl shadow-sm hover:shadow-md hover:scale-105"
            aria-label="নতুন চ্যাট শুরু করুন"
          >
            <Icons.FilePlus className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
            <span className="hidden sm:inline font-medium">নতুন চ্যাট</span>
            <span className="sm:hidden font-medium">নতুন</span>
          </Button>
        </div>
      </motion.header>

      <motion.div
        className="flex-1 overflow-y-auto relative z-0 scrollbar-hide flex flex-col justify-center mobile-chat-content"
        ref={viewportRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{
          paddingBottom: keyboard.isVisible ? `${keyboard.height + 20}px` : undefined,
        }}
      >
        <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:py-8 flex flex-col">
          {messageCount === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex-grow flex flex-col justify-center"
            >
              <WelcomeScreen
                onPromptClick={handlePromptClick}
                hasApiKey={!!apiKey}
                onSetupApiKey={() => setIsApiKeyDialogOpen(true)}
              />
            </motion.div>
          ) : (
            <div className="space-y-6 sm:space-y-8">
              <AnimatePresence mode="popLayout">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    {renderMessage(msg, i)}
                  </motion.div>
                ))}
                {isLoading &&
                  messages[messages.length - 1]?.type !== "loading" && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <LoadingMessage />
                    </motion.div>
                  )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>

      <div 
        className={cn(
          "relative z-10 chat-input-sticky mobile-chat-input border-t border-border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80",
          keyboard.isVisible && "keyboard-visible"
        )}
        style={{
          transform: keyboard.isVisible ? `translateY(-${Math.min(keyboard.height, 100)}px)` : undefined,
        }}
      >
        <ChatInput
          inputValue={inputValue}
          onInputValueChange={setInputValue}
          onFormSubmit={handleFormSubmit}
          isLoading={isLoading}
        />
      </div>
      
      <div className="pb-16 lg:pb-8"></div>
    </PageTransition>
  );
}
