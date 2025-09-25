"use client";

import { motion } from "framer-motion";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { memo } from "react";
import { StaggerContainer, StaggerItem } from "./page-transition";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  onNewNote: () => void;
  onImportClick?: () => void;
  isSearching?: boolean;
  icon?: React.ElementType;
  title?: string;
  description?: string;
  primaryActionText?: string;
  secondaryActionText?: string;
  hideSecondaryAction?: boolean;
}

function EmptyStateComponent({
  onNewNote,
  onImportClick,
  isSearching = false,
  icon,
  title,
  description,
  primaryActionText,
  secondaryActionText,
  hideSecondaryAction = false,
}: EmptyStateProps) {
  const defaultIcon = isSearching ? Icons.Search : Icons.Notebook;
  const defaultTitle = isSearching
    ? "কোনো ফলাফল নেই"
    : "আপনার প্রথম নোট তৈরি করুন";
  const defaultDescription = isSearching
    ? "আপনার অনুসন্ধানের সাথে মেলে এমন কোনো নোট নেই। অন্য কিছু চেষ্টা করুন।"
    : "আপনার প্রথম নোট তৈরি করে লেখা শুরু করুন অথবা পুরানো নোট ইম্পোর্ট করুন।";

  const IconComponent = icon || defaultIcon;

  return (
    <StaggerContainer className="flex flex-col items-center justify-center rounded-3xl p-8 text-center bg-gradient-to-br from-background via-muted/20 to-background relative overflow-hidden h-full">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-50" />
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-accent/10 rounded-full blur-2xl animate-pulse delay-1000" />

      <StaggerItem>
        <motion.div
          className="relative mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 via-accent/5 to-primary/15 backdrop-blur-sm border border-primary/20 shadow-2xl"
          whileHover={{ scale: 1.05, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-xl opacity-60" />
          <motion.div
            key={isSearching ? "search" : "file"}
            initial={{ scale: 0, opacity: 0, rotate: -180 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0, rotate: 180 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
            className="relative z-10"
          >
            <IconComponent
              className="h-16 w-16 text-primary drop-shadow-lg"
              strokeWidth={1.5}
            />
          </motion.div>

          {/* Floating particles around icon */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary/40 rounded-full"
              animate={{
                y: [0, -20, 0],
                x: [0, Math.sin(i) * 15, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut",
              }}
              style={{
                top: `${20 + i * 10}%`,
                left: `${20 + i * 10}%`,
              }}
            />
          ))}
        </motion.div>
      </StaggerItem>

      <StaggerItem>
        <motion.h2
          className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {title || defaultTitle}
        </motion.h2>
      </StaggerItem>

      <StaggerItem>
        <motion.p
          className="mt-6 max-w-lg text-lg text-muted-foreground leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {description || defaultDescription}
        </motion.p>
      </StaggerItem>

      {!isSearching && (
        <StaggerItem>
          <motion.div
            className={cn(
              "mt-10 flex flex-col gap-4 sm:flex-row",
              hideSecondaryAction && "justify-center",
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <Button
                onClick={onNewNote}
                size="lg"
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-8 py-4 text-lg h-14"
              >
                <Icons.Plus className="mr-3 h-6 w-6" />
                {primaryActionText || "নতুন নোট"}
              </Button>
            </motion.div>
            {!hideSecondaryAction && onImportClick && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <Button
                  onClick={onImportClick}
                  size="lg"
                  variant="outline"
                  className="border-primary/30 hover:bg-primary/5 hover:border-primary/50 rounded-xl px-8 py-4 text-lg h-14 backdrop-blur-sm"
                >
                  <Icons.Upload className="mr-3 h-6 w-6" />
                  {secondaryActionText || "ইম্পোর্ট"}
                </Button>
              </motion.div>
            )}
          </motion.div>
        </StaggerItem>
      )}
    </StaggerContainer>
  );
}
EmptyStateComponent.displayName = "EmptyStateComponent";

const EmptyState = memo(EmptyStateComponent);
export default EmptyState;
