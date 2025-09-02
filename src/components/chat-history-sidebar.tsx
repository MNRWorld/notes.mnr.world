"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/stores/use-chat-store";
import dayjs from "dayjs";
import "dayjs/locale/bn";
dayjs.locale("bn");
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ChatHistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatHistorySidebar({
  isOpen,
  onClose,
}: ChatHistorySidebarProps) {
  const {
    sessions,
    currentSession,
    loadSession,
    deleteSession,
    createNewSession,
    updateSessionTitle,
    exportChatHistory,
  } = useChatStore();

  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const handleEditTitle = (sessionId: string, currentTitle: string) => {
    setEditingSessionId(sessionId);
    setEditTitle(currentTitle);
  };

  const handleSaveTitle = () => {
    if (editingSessionId && editTitle.trim()) {
      updateSessionTitle(editingSessionId, editTitle.trim());
      setEditingSessionId(null);
      setEditTitle("");
      toast.success("চ্যাট শিরোনাম আপডেট হয়েছে");
    }
  };

  const handleCancelEdit = () => {
    setEditingSessionId(null);
    setEditTitle("");
  };

  const handleNewChat = () => {
    createNewSession();
    onClose();
  };

  const handleLoadSession = (sessionId: string) => {
    loadSession(sessionId);
    onClose();
  };

  const handleDeleteSession = (sessionId: string) => {
    deleteSession(sessionId);
    toast.success("চ্যাট ডিলিট হয়েছে");
  };

  const handleExport = () => {
    exportChatHistory();
    toast.success("চ্যাট হিস্টরি এক্সপোর্ট হয়েছে");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
              opacity: { duration: 0.2 },
            }}
            className={cn(
              "fixed left-0 top-0 h-full w-80 bg-gradient-to-b from-background to-muted/30 border-r border-border/50 z-50",
              "flex flex-col shadow-2xl lg:shadow-lg backdrop-blur-md supports-[backdrop-filter]:bg-background/95",
            )}
          >
            {/* Header */}
            <motion.div
              className="flex items-center justify-between p-4 border-b border-border/50 bg-background/80 backdrop-blur-sm"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
                  <Icons.History className="h-4 w-4 text-primary-foreground" />
                </div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  চ্যাট হিস্টরি
                </h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="lg:hidden h-8 w-8 rounded-lg hover:bg-muted/80 transition-all duration-200"
              >
                <Icons.X className="h-4 w-4" />
              </Button>
            </motion.div>

            {/* New Chat Button */}
            <motion.div
              className="p-4 border-b border-border/50"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <Button
                onClick={handleNewChat}
                className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-300 group"
                variant="default"
              >
                <Icons.Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                নতুন চ্যাট
              </Button>
            </motion.div>

            {/* Chat Sessions */}
            <ScrollArea
              className="flex-1"
              style={{
                background:
                  "linear-gradient(to bottom, transparent, rgba(0,0,0,0.02))",
              }}
            >
              <div className="p-2 space-y-2">
                {sessions.length === 0 ? (
                  <motion.div
                    className="text-center py-12 text-muted-foreground"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                  >
                    <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-muted/50 to-muted/80 flex items-center justify-center">
                      <Icons.Heart className="h-8 w-8 opacity-50" />
                    </div>
                    <p className="text-sm font-medium">কোন চ্যাট হিস্টরি নেই</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      একটি নতুন কথোপকথন শুরু করুন
                    </p>
                  </motion.div>
                ) : (
                  sessions.map((session, index) => (
                    <motion.div
                      key={session.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      className={cn(
                        "group relative p-4 rounded-xl border transition-all duration-300",
                        "hover:bg-gradient-to-r hover:from-muted/30 hover:to-muted/50 cursor-pointer hover:shadow-md",
                        currentSession?.id === session.id
                          ? "bg-gradient-to-r from-primary/5 to-primary/10 border-primary/30 shadow-md"
                          : "border-border/50 hover:border-border/80 bg-background/50 backdrop-blur-sm",
                      )}
                    >
                      {/* Session Content */}
                      <div
                        onClick={() => handleLoadSession(session.id)}
                        className="flex-1"
                      >
                        {editingSessionId === session.id ? (
                          <div
                            className="space-y-3"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveTitle();
                                if (e.key === "Escape") handleCancelEdit();
                              }}
                              className="text-sm border-primary/30 focus:border-primary bg-background/80"
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={handleSaveTitle}
                                className="h-7 px-3 text-xs bg-primary/90 hover:bg-primary"
                              >
                                <Icons.Check className="h-3 w-3 mr-1" />
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                                className="h-7 px-3 text-xs"
                              >
                                <Icons.X className="h-3 w-3 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="text-sm font-semibold line-clamp-2 pr-2 leading-relaxed">
                                {session.title}
                              </h3>
                              <Badge
                                variant="secondary"
                                className="text-xs shrink-0 bg-muted/80 hover:bg-muted font-medium shadow-sm"
                              >
                                {session.messages.length}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Icons.Clock className="h-3 w-3" />
                              <span className="font-medium">
                                {dayjs(session.updatedAt).format(
                                  "DD/MM/YYYY, h:mm A",
                                )}
                              </span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Action Buttons */}
                      {editingSessionId !== session.id && (
                        <motion.div
                          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200"
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                        >
                          <div className="flex gap-1 bg-background/90 backdrop-blur-sm rounded-lg p-1 shadow-lg border border-border/50">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditTitle(session.id, session.title);
                              }}
                              className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-200"
                            >
                              <Icons.Pencil className="h-3 w-3" />
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => e.stopPropagation()}
                                  className="h-7 w-7 p-0 text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                                >
                                  <Icons.Trash className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    চ্যাট ডিলিট করুন
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    আপনি কি নিশ্চিত যে এই চ্যাটটি ডিলিট করতে
                                    চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>বাতিল</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeleteSession(session.id)
                                    }
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    ডিলিট করুন
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            {sessions.length > 0 && (
              <motion.div
                className="p-4 border-t border-border/50 bg-background/80 backdrop-blur-sm"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="w-full border-primary/30 hover:bg-primary/5 hover:border-primary/50 transition-all duration-300 group"
                >
                  <Icons.Download className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                  এক্সপোর্ট করুন
                </Button>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
