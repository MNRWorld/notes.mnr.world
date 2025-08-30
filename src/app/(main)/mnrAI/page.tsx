"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  FilePlus2,
  Bot,
  Brain,
  Code,
  Zap,
  Network,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/use-settings";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import type { ChatMessage, ModelType, WikiPage } from "@/components/types";
import {
  UserMessage,
  BotMessage,
  LoadingMessage,
} from "@/components/chat-messages";
import { ChatInput } from "@/components/chat-input";
import { Badge } from "@/components/ui/badge";

export default function MnrAIPage() {
  const font = useSettingsStore((state) => state.font);
  const [selectedModel, setSelectedModel] = useState<ModelType | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({
        top: viewportRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSearch = useCallback(
    async (query: string, model: ModelType | null) => {
      if (!query.trim() || !model) return;

      const newUserMessage: ChatMessage = { type: "user", model, query };
      setMessages((prev) => [...prev, newUserMessage, { type: "loading" }]);
      setInputValue("");

      try {
        if (model === "mnrWiKi") {
          const searchUrl = `https://bn.wikipedia.org/w/api.php?action=query&origin=*&prop=extracts&explaintext=true&redirects=1&titles=${encodeURIComponent(
            query,
          )}&format=json`;
          const response = await fetch(searchUrl);
          const data = await response.json();
          const pages = data.query.pages;
          const page = Object.values(pages)[0] as WikiPage;
          let resultPage: WikiPage;

          if (page && page.pageid && page.extract) {
            resultPage = page;
          } else {
            resultPage = {
              pageid: 0,
              title: "ফলাফল পাওয়া যায়নি",
              extract: `"${query}" এর জন্য কোনো উইকিপিডিয়া পেজ খুঁজে পাওয়া যায়নি।`,
            };
          }
          setMessages((prev) => {
            const newMessages = prev.filter((m) => m.type !== "loading");
            newMessages.push({
              type: "bot",
              model: model,
              wikiResult: resultPage,
            });
            return newMessages;
          });
        } else if (model === "mnrArticles") {
          const tags = query.split(" ").join(",");
          const searchUrl = `https://dev.to/api/articles?per_page=5&tags=${encodeURIComponent(
            tags,
          )}`;
          const response = await fetch(searchUrl);
          const data = await response.json();

          if (data && data.length > 0) {
            setMessages((prev) => {
              const newMessages = prev.filter((m) => m.type !== "loading");
              newMessages.push({
                type: "bot",
                model: model,
                articleResults: data,
              });
              return newMessages;
            });
          } else {
            setMessages((prev) => {
              const newMessages = prev.filter((m) => m.type !== "loading");
              newMessages.push({
                type: "error",
                errorText: `"${query}" ট্যাগ দিয়ে কোনো আর্টিকেল খুঁজে পাওয়া যায়নি।`,
              });
              return newMessages;
            });
          }
        }
      } catch (error) {
        setMessages((prev) => {
          const newMessages = prev.filter((m) => m.type !== "loading");
          newMessages.push({
            type: "error",
            errorText:
              "অনুসন্ধান করার সময় একটি সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
          });
          return newMessages;
        });
      }
    },
    [],
  );

  const handleFormSubmit = () => {
    handleSearch(inputValue, selectedModel);
  };

  const handlePromptClick = (prompt: string, model: ModelType) => {
    setSelectedModel(model);
    handleSearch(prompt, model);
  };

  const handleNewChat = () => {
    setMessages([]);
    setSelectedModel(null);
    setInputValue("");
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
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden relative bg-background",
        font.split(" ")[0],
      )}
    >
      <motion.header
        className="relative z-10 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm px-4 sm:px-6"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="relative"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Avatar className="h-9 w-9 ring-2 ring-primary/40 ring-offset-2 ring-offset-background">
              <AvatarImage src="/favicon.png" alt="mnrAI" />
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                <Bot className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
          </motion.div>

          <div className="flex items-center gap-2">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h1 className="text-lg font-bold sm:text-xl">mnrAI চ্যাট</h1>
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Badge
                variant="outline"
                className="border-primary/30 bg-primary/10 text-primary font-medium"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                বেটা
              </Badge>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={handleNewChat}
            className="border-primary/30 bg-background/50 hover:bg-primary/10 transition-all duration-300 group"
          >
            <FilePlus2 className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-300" />
            <span className="hidden sm:inline">নতুন চ্যাট</span>
            <span className="sm:hidden">নতুন</span>
          </Button>
        </motion.div>
      </motion.header>

      <div className="flex-1 overflow-y-auto relative z-10" ref={viewportRef}>
        <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <CleanWelcomeScreen onPromptClick={handlePromptClick} />
            </motion.div>
          ) : (
            <motion.div
              className="space-y-6 sm:space-y-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <AnimatePresence mode="popLayout">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{
                      duration: 0.4,
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                  >
                    {renderMessage(msg, i)}
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      <motion.div
        className="relative z-10 border-t border-border bg-background/80 backdrop-blur-sm"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <ChatInput
          inputValue={inputValue}
          onInputValueChange={setInputValue}
          selectedModel={selectedModel}
          onSelectedModelChange={setSelectedModel}
          onFormSubmit={handleFormSubmit}
        />
      </motion.div>
    </div>
  );
}

const CleanWelcomeScreen = ({
  onPromptClick,
}: {
  onPromptClick: (prompt: string, model: ModelType) => void;
}) => {
  const suggestions = [
    {
      prompt: "বঙ্গবন্ধু শেখ মুজিবুর রহমান",
      model: "mnrWiKi" as ModelType,
      icon: Brain,
      description: "উইকিপিডিয়া থেকে তথ্য খুঁজুন",
      color: "from-blue-500 to-cyan-500",
    },
    {
      prompt: "react hooks",
      model: "mnrArticles" as ModelType,
      icon: Code,
      description: "প্রোগ্রামিং আর্টিকেল খুঁজুন",
      color: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center relative">
      <motion.div
        className="relative mb-8"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          duration: 1,
          type: "spring",
          stiffness: 200,
          damping: 15,
        }}
      >
        <div className="relative">
          <motion.div
            className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent p-4 shadow-2xl"
            animate={{
              boxShadow: [
                "0 0 20px rgba(var(--primary), 0.3)",
                "0 0 40px rgba(var(--primary), 0.6)",
                "0 0 20px rgba(var(--primary), 0.3)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Bot className="w-full h-full text-primary-foreground" />
          </motion.div>

          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border border-primary/30"
              style={{
                width: `${120 + i * 20}px`,
                height: `${120 + i * 20}px`,
                left: `${-10 - i * 10}px`,
                top: `${-10 - i * 10}px`,
              }}
              animate={{ rotate: 360 }}
              transition={{
                duration: 15 + i * 5,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}

          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-primary/60"
              style={{
                left: `${50 + Math.cos((i * 60 * Math.PI) / 180) * 80}px`,
                top: `${50 + Math.sin((i * 60 * Math.PI) / 180) * 80}px`,
              }}
              animate={{
                scale: [0.5, 1.5, 0.5],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 2 + i * 0.3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </motion.div>

      <motion.h1
        className="text-4xl font-bold tracking-tight mb-4 sm:text-5xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        mnrAI-তে স্বাগতম
      </motion.h1>

      <motion.p
        className="max-w-2xl text-base text-muted-foreground mb-12 leading-relaxed sm:text-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        AI এজেন্ট দিয়ে জ্ঞান জগৎ অন্বেষণ করুন। উইকিপিডিয়া থেকে তথ্য খুঁজুন বা
        সর্বশেষ প্রোগ্রামিং আর্টিকেল আবিষ্কার করুন।
      </motion.p>

      <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
        {suggestions.map((suggestion, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.6,
              delay: 0.7 + i * 0.1,
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            whileHover={{
              y: -4,
              scale: 1.02,
              transition: { duration: 0.2 },
            }}
            whileTap={{ scale: 0.98 }}
            className="group h-full"
          >
            <div
              className="relative h-full flex flex-col overflow-hidden rounded-2xl border border-border bg-card/50 p-5 sm:p-6 cursor-pointer transition-all duration-300 hover:bg-card hover:border-primary/40 hover:shadow-2xl group"
              onClick={() => onPromptClick(suggestion.prompt, suggestion.model)}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${suggestion.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
              />

              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent opacity-0 group-hover:opacity-100"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
              />

              <div className="relative z-10 flex flex-grow items-start gap-4">
                <motion.div
                  className={`flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${suggestion.color} text-white shadow-lg`}
                  whileHover={{ rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <suggestion.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </motion.div>

                <div className="flex-1 text-left">
                  <h3 className="text-md sm:text-lg font-semibold text-foreground mb-1 sm:mb-2 group-hover:text-primary transition-colors duration-300">
                    {suggestion.prompt}
                  </h3>
                  <p className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                    {suggestion.description}
                  </p>
                </div>

                <motion.div
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  whileHover={{ x: 5, rotate: 15 }}
                >
                  <Zap className="h-5 w-5 text-primary" />
                </motion.div>
              </div>

              <motion.div
                className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${suggestion.color} w-0 group-hover:w-full transition-all duration-500`}
              />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[Network, Brain, Cpu, Zap].map((Icon, i) => (
          <motion.div
            key={i}
            className="absolute text-primary/20"
            style={{
              left: `${15 + i * 20}%`,
              top: `${25 + i * 15}%`,
            }}
            animate={{
              y: [-8, 8, -8],
              rotate: [-3, 3, -3],
              opacity: [0.1, 0.4, 0.1],
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Icon className="w-6 h-6" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};
