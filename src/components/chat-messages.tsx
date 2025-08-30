"use client";

import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type {
  UserChatMessage,
  BotChatMessage,
  ErrorChatMessage,
} from "@/components/types";
import { useSettingsStore } from "@/stores/use-settings";
import {
  WikiResultDisplay,
  ArticleResultDisplay,
} from "@/components/result-displays";

export const UserMessage = ({ message }: { message: UserChatMessage }) => {
  const { name } = useSettingsStore();
  return (
    <div className="flex items-start justify-end gap-3 sm:gap-4">
      <div className="flex max-w-lg flex-col items-end space-y-2 text-right">
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 500 }}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-3 py-2 text-primary-foreground shadow-lg sm:rounded-2xl sm:px-4 sm:py-3"
        >
          <span className="text-sm font-medium sm:text-base">
            {message.query}
          </span>
        </motion.div>
      </div>
      <Avatar className="h-8 w-8 flex-shrink-0 ring-2 ring-primary/20 ring-offset-2 ring-offset-background sm:h-9 sm:w-9">
        <AvatarFallback className="bg-gradient-to-br from-accent to-primary font-semibold text-primary-foreground">
          {name?.[0]?.toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
    </div>
  );
};
UserMessage.displayName = "UserMessage";

export const BotMessage = ({
  message,
}: {
  message: BotChatMessage | ErrorChatMessage;
}) => (
  <div className="flex items-start gap-3 sm:gap-4">
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3, type: "spring" }}
    >
      <Avatar className="h-8 w-8 flex-shrink-0 bg-gradient-to-br from-primary to-accent text-primary-foreground ring-2 ring-primary/30 ring-offset-2 ring-offset-background sm:h-9 sm:w-9">
        <AvatarImage src="/favicon.png" alt="mnrAI" />
        <AvatarFallback>
          <Sparkles className="h-5 w-5" />
        </AvatarFallback>
      </Avatar>
    </motion.div>
    <div className="min-w-0 flex-1 space-y-4 py-1">
      {message.type === "bot" && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {message.wikiResult && (
            <WikiResultDisplay result={message.wikiResult} />
          )}
          {message.articleResults && (
            <div className="w-full overflow-hidden">
              <ArticleResultDisplay results={message.articleResults} />
            </div>
          )}
        </motion.div>
      )}
      {message.type === "error" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-destructive/50 bg-destructive/10">
            <CardHeader>
              <CardTitle className="text-destructive">
                একটি সমস্যা হয়েছে
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive/90">{message.errorText}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  </div>
);
BotMessage.displayName = "BotMessage";

export const LoadingMessage = () => (
  <div className="flex items-start gap-3 sm:gap-4">
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3, type: "spring" }}
    >
      <Avatar className="h-8 w-8 flex-shrink-0 bg-gradient-to-br from-primary to-accent text-primary-foreground ring-2 ring-primary/30 ring-offset-2 ring-offset-background sm:h-9 sm:w-9">
        <AvatarImage src="/favicon.png" alt="mnrAI" />
        <AvatarFallback>
          <Sparkles className="h-5 w-5" />
        </AvatarFallback>
      </Avatar>
    </motion.div>
    <div className="flex items-center gap-3 py-2">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className="h-5 w-5 text-primary" />
      </motion.div>
      <motion.span
        className="text-sm font-medium text-muted-foreground sm:text-base"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        AI ভাবছে...
      </motion.span>

      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-2 w-2 rounded-full bg-primary/60"
            animate={{
              y: [-2, -8, -2],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  </div>
);
LoadingMessage.displayName = "LoadingMessage";
