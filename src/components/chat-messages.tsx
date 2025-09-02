"use client";

import { motion } from "framer-motion";
import { Icons } from "@/components/ui/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type {
  UserChatMessage,
  BotChatMessage,
  ErrorChatMessage,
} from "@/components/types";
import { useSettingsStore } from "@/stores/use-settings";

export const UserMessage = ({ message }: { message: UserChatMessage }) => {
  const { name } = useSettingsStore();
  return (
    <div className="flex items-start justify-end gap-3 sm:gap-4 group">
      <div className="flex max-w-lg flex-col items-end space-y-2 text-right">
        <motion.div
          initial={{ opacity: 0, y: 5, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="inline-block rounded-2xl bg-gradient-to-br from-primary to-primary/90 px-4 py-3 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02] backdrop-blur-sm border border-primary/20"
        >
          <span className="text-sm font-medium sm:text-base whitespace-pre-wrap leading-relaxed">
            {message.query}
          </span>
        </motion.div>
      </div>
      <Avatar className="h-9 w-9 flex-shrink-0 ring-2 ring-primary/20 ring-offset-2 ring-offset-background shadow-lg">
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
  <div className="flex items-start gap-3 sm:gap-4 group">
    <Avatar className="h-9 w-9 flex-shrink-0 bg-gradient-to-br from-primary to-accent text-primary-foreground ring-2 ring-primary/30 ring-offset-2 ring-offset-background shadow-lg">
      <AvatarImage src="/favicon.png" alt="mnrAI" />
      <AvatarFallback>
        <Icons.Sparkles className="h-5 w-5" />
      </AvatarFallback>
    </Avatar>
    <div className="min-w-0 flex-1 space-y-4 py-1">
      {message.type === "bot" && (
        <motion.div
          className="space-y-4 rounded-2xl bg-gradient-to-br from-muted/40 to-muted/60 backdrop-blur-sm p-5 prose prose-sm sm:prose-base max-w-none dark:prose-invert shadow-md hover:shadow-lg transition-all duration-300 group-hover:bg-muted/50 border border-muted/50"
          initial={{ opacity: 0, y: 5, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
        >
          {message.content}
        </motion.div>
      )}
      {message.type === "error" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Card className="border-destructive/50 bg-destructive/10 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                <Icons.AlertTriangle className="h-5 w-5 text-destructive" />
              </motion.div>
              <CardTitle className="text-destructive text-base font-semibold">
                An Error Occurred
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive/90 text-sm leading-relaxed">
                {message.errorText}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  </div>
);
BotMessage.displayName = "BotMessage";

export const LoadingMessage = () => (
  <div className="flex items-start gap-3 sm:gap-4 group">
    <Avatar className="h-9 w-9 flex-shrink-0 bg-gradient-to-br from-primary to-accent text-primary-foreground ring-2 ring-primary/30 ring-offset-2 ring-offset-background shadow-lg">
      <AvatarImage src="/favicon.png" alt="mnrAI" />
      <AvatarFallback>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Icons.Sparkles className="h-5 w-5" />
        </motion.div>
      </AvatarFallback>
    </Avatar>
    <motion.div
      className="flex items-center gap-3 py-3 px-5 rounded-2xl bg-gradient-to-r from-muted/40 to-muted/60 backdrop-blur-sm shadow-md border border-muted/50"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Icons.Loader className="h-5 w-5 text-primary" />
      </motion.div>
      <motion.span
        className="text-sm font-medium text-muted-foreground sm:text-base"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        Gemini চিন্তা করছে...
      </motion.span>
    </motion.div>
  </div>
);
LoadingMessage.displayName = "LoadingMessage";
