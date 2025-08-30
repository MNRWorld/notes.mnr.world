"use client";

import React, { memo } from "react";
import { motion } from "framer-motion";
import { Card } from "./ui/card";

export const NoteSkeleton = memo(function NoteSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-[200px] p-4 border border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="animate-pulse space-y-3">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-4 bg-muted rounded w-8" />
          </div>
          
          {/* Title skeleton */}
          <div className="h-6 bg-muted rounded w-3/4" />
          
          {/* Content skeleton */}
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-5/6" />
            <div className="h-4 bg-muted rounded w-4/6" />
          </div>
          
          {/* Footer skeleton */}
          <div className="flex items-center justify-between pt-2">
            <div className="h-3 bg-muted rounded w-1/4" />
            <div className="flex gap-2">
              <div className="h-6 bg-muted rounded w-12" />
              <div className="h-6 bg-muted rounded w-12" />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
});

export const NotesGridSkeleton = memo(function NotesGridSkeleton({ 
  count = 6 
}: { 
  count?: number 
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }, (_, i) => (
        <NoteSkeleton key={i} />
      ))}
    </div>
  );
});

export const LoadingSpinner = memo(function LoadingSpinner({ 
  size = "md" 
}: { 
  size?: "sm" | "md" | "lg" 
}) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={`inline-block rounded-full border-2 border-primary border-t-transparent ${sizeClasses[size]}`}
    />
  );
});

export const AutoSaveIndicator = memo(function AutoSaveIndicator({ 
  isSaving, 
  lastSaved 
}: { 
  isSaving: boolean; 
  lastSaved?: Date;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 text-xs text-muted-foreground"
    >
      {isSaving ? (
        <>
          <LoadingSpinner size="sm" />
          <span>সেভ হচ্ছে...</span>
        </>
      ) : (
        <>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="h-2 w-2 rounded-full bg-green-500"
          />
          <span>
            {lastSaved 
              ? `সেভ হয়েছে ${lastSaved.toLocaleTimeString('bn-BD', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}`
              : "সেভ হয়েছে"
            }
          </span>
        </>
      )}
    </motion.div>
  );
});
