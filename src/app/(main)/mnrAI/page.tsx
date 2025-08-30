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
import WelcomeScreen from "@/components/welcome-screen";
import {
  UserMessage,
  BotMessage,
  LoadingMessage,
} from "@/components/chat-messages";
import { ChatInput } from "@/components/chat-input";
import { Badge } from "@/components/ui/badge";

// Simple floating particles
const FloatingParticles = () => {
  const particles = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 15 + 10,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-primary/50"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
          animate={{
            y: [-10, -60],
            opacity: [0, 0.8, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

// Neural network pattern component
const NeuralNetwork = () => {
  const nodes = Array.from({ length: 9 }, (_, i) => ({
    id: i,
    x: (i % 3) * 30 + 20,
    y: Math.floor(i / 3) * 30 + 20,
  }));

  const connections = [
    [0, 1],
    [1, 2],
    [0, 3],
    [1, 4],
    [2, 5],
    [3, 4],
    [4, 5],
    [3, 6],
    [4, 7],
    [5, 8],
    [6, 7],
    [7, 8],
    [0, 4],
    [2, 4],
    [4, 6],
    [4, 8],
  ];

  return (
    <div className="absolute inset-0 opacity-15 overflow-hidden pointer-events-none">
      <svg className="w-full h-full">
        <defs>
          <linearGradient
            id="connectionGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--accent))" />
          </linearGradient>
        </defs>
        {connections.map(([start, end], i) => (
          <motion.line
            key={i}
            x1={`${nodes[start].x}%`}
            y1={`${nodes[start].y}%`}
            x2={`${nodes[end].x}%`}
            y2={`${nodes[end].y}%`}
            stroke="url(#connectionGradient)"
            strokeWidth="1.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.6 }}
            transition={{
              duration: 2,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
        {nodes.map((node) => (
          <motion.circle
            key={node.id}
            cx={`${node.x}%`}
            cy={`${node.y}%`}
            r="3"
            fill="hsl(var(--primary))"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              duration: 0.5,
              delay: node.id * 0.1,
            }}
          />
        ))}
      </svg>
    </div>
  );
};

// Glowing orb component
const GlowingOrb = ({
  className,
  delay = 0,
}: {
  className?: string;
  delay?: number;
}) => (
  <motion.div
    className={cn(
      "absolute w-24 h-24 rounded-full opacity-20 blur-xl",
      className,
    )}
    animate={{
      scale: [1, 1.3, 1],
      opacity: [0.15, 0.35, 0.15],
    }}
    transition={{
      duration: 4,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

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
        console.error("API search failed:", error);
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
        "flex h-full flex-col overflow-hidden relative",
        font.split(" ")[0],
      )}
    >
      {/* Enhanced gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,hsl(var(--primary))_0%,transparent_50%)] opacity-15" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--accent))_0%,transparent_50%)] opacity-15" />
      </div>

      {/* Enhanced floating particles */}
      <FloatingParticles />

      {/* Neural network pattern */}
      <NeuralNetwork />

      {/* Glowing orbs */}
      <GlowingOrb className="bg-primary/40 top-16 left-12" delay={0} />
      <GlowingOrb className="bg-accent/40 top-32 right-16" delay={1.5} />
      <GlowingOrb className="bg-primary/30 bottom-24 left-1/4" delay={3} />

      {/* Enhanced header with glass morphism */}
      <motion.header
        className="relative z-10 flex h-20 shrink-0 items-center justify-between border-b border-white/20 glass-morph px-4 sm:px-6 scan-effect"
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
            <Avatar className="h-10 w-10 ring-2 ring-primary/40 ring-offset-2 ring-offset-background neural-pulse">
              <AvatarImage src="/favicon.png" alt="mnrAI" />
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                <Bot className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/30"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>

          <div className="flex items-center gap-3">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h1 className="text-xl font-bold holo-text">mnrAI Chat</h1>
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
                Beta
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
            className="border-primary/30 glass-morph hover:bg-primary/10 transition-all duration-300 group hover-pulse"
          >
            <FilePlus2 className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-300" />
            নতুন চ্যাট
          </Button>
        </motion.div>
      </motion.header>

      {/* Main content area */}
      <div className="flex-1 overflow-y-auto relative z-10" ref={viewportRef}>
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:px-8 lg:px-10">
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
              className="space-y-8"
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

      {/* Enhanced chat input with glass morphism */}
      <motion.div
        className="relative z-10 border-t border-white/20 glass-morph"
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

// Clean, modern welcome screen
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
      {/* Enhanced AI Icon with orbital rings */}
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

          {/* Orbital rings */}
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

          {/* Floating particles around icon */}
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

      {/* Enhanced title with holographic effect */}
      <motion.h1
        className="text-4xl font-bold tracking-tight holo-text mb-4 sm:text-5xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        স্বাগতম mnrAI-তে
      </motion.h1>

      <motion.p
        className="max-w-2xl text-lg text-muted-foreground mb-12 leading-relaxed"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        আমাদের শক্তিশালী AI এজেন্ট দিয়ে জ্ঞানের জগত অন্বেষণ করুন। উইকিপিডিয়া
        থেকে তথ্য খুঁজুন বা সর্বশেষ প্রোগ্রামিং আর্টিকেল আবিষ্কার করুন।
      </motion.p>

      {/* Clean suggestion cards */}
      <div className="grid w-full max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
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
            className="group"
          >
            <div
              className="relative overflow-hidden rounded-2xl border border-white/20 glass-morph p-6 cursor-pointer transition-all duration-300 hover:bg-white/10 hover:border-primary/40 hover:shadow-2xl group hover-pulse"
              onClick={() => onPromptClick(suggestion.prompt, suggestion.model)}
            >
              {/* Background gradient on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${suggestion.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
              />

              {/* Subtle scanning effect */}
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

              {/* Content */}
              <div className="relative z-10 flex items-start gap-4">
                <motion.div
                  className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${suggestion.color} text-white shadow-lg`}
                  whileHover={{ rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <suggestion.icon className="h-6 w-6" />
                </motion.div>

                <div className="flex-1 text-left">
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
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

              {/* Bottom accent line */}
              <motion.div
                className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${suggestion.color} w-0 group-hover:w-full transition-all duration-500`}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Floating tech icons */}
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
