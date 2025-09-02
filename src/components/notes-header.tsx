"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import React, { memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type SortOption =
  `${"updatedAt" | "createdAt" | "title" | "charCount"}-${"asc" | "desc"}`;
export type ViewMode = "grid" | "list";

interface NotesHeaderProps {
  sortOption: SortOption;
  setSortOption: (sort: SortOption) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onCreateIncognitoNote?: () => void;
}

export const NotesHeaderSkeleton = () => (
  <header className="flex flex-col gap-3">
    <Skeleton className="h-10 w-full" />
    <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
      <Skeleton className="h-10 w-full sm:w-[200px]" />
      <div className="flex items-center gap-1 sm:gap-2">
        <Skeleton className="h-9 flex-1 px-3 sm:w-[86px]" />
        <Skeleton className="h-9 flex-1 px-3 sm:w-[86px]" />
      </div>
    </div>
  </header>
);
NotesHeaderSkeleton.displayName = "NotesHeaderSkeleton";

function NotesHeaderComponent({
  sortOption,
  setSortOption,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  onCreateIncognitoNote,
}: NotesHeaderProps) {
  return (
    <motion.header
      className="z-10 flex flex-col gap-4 bg-transparent"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="relative w-full"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300" />
        <Icons.Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
        <Input
          placeholder="নোট বা ট্যাগ দিয়ে খুঁজুন..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-12 w-full pl-11 pr-4 text-base backdrop-blur-xl bg-white/5 border-emerald-500/20 hover:border-emerald-500/40 focus:border-emerald-500/60 rounded-xl shadow-lg relative z-10"
          aria-label="Search notes"
        />
      </motion.div>

      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
          className="relative"
        >
          <Select
            value={sortOption}
            onValueChange={(value) => setSortOption(value as SortOption)}
          >
            <SelectTrigger
              className="w-full text-sm sm:w-auto sm:min-w-[200px] h-11 backdrop-blur-xl bg-white/5 border-emerald-500/20 hover:border-emerald-500/40 rounded-xl relative z-10"
              aria-label="Sort notes by"
            >
              <SelectValue placeholder="সাজান" />
            </SelectTrigger>
            <SelectContent className="backdrop-blur-xl bg-white/10 border-emerald-500/20">
              <SelectItem value="updatedAt-desc">
                তারিখ (নতুন → পুরাতন)
              </SelectItem>
              <SelectItem value="updatedAt-asc">
                তারিখ (পুরাতন → নতুন)
              </SelectItem>
              <SelectItem value="createdAt-desc">
                তৈরি (নতুন → পুরাতন)
              </SelectItem>
              <SelectItem value="createdAt-asc">
                তৈরি (পুরাতন → নতুন)
              </SelectItem>
              <SelectItem value="title-asc">শিরোনাম (A-Z)</SelectItem>
              <SelectItem value="title-desc">শিরোনাম (Z-A)</SelectItem>
              <SelectItem value="charCount-desc">আকার (বড় → ছোট)</SelectItem>
              <SelectItem value="charCount-asc">আকার (ছোট → বড়)</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        <div className="flex items-center gap-2">
          {onCreateIncognitoNote && (
            <motion.div whileTap={{ scale: 0.98 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCreateIncognitoNote}
                className="h-9 w-auto px-3 backdrop-blur-xl bg-purple-500/10 border border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-500/20 rounded-xl transition-all duration-300"
                aria-label="গোপনীয় নোট তৈরি করুন"
              >
                <Icons.Eye className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">গোপনীয় নোট</span>
              </Button>
            </motion.div>
          )}
          
          <motion.div whileTap={{ scale: 0.98 }}>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className={cn(
                "h-9 w-auto px-3 shadow-lg backdrop-blur-xl transition-all duration-300 hover:scale-105",
                viewMode === "grid"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
                  : "backdrop-blur-xl bg-white/5 border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/10",
              )}
              aria-label="গ্রিড ভিউ"
            >
              <Icons.LayoutGrid className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">গ্রিড</span>
            </Button>
          </motion.div>

          <motion.div whileTap={{ scale: 0.98 }}>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={cn(
                "h-11 flex-1 px-4 text-sm sm:flex-none rounded-xl transition-all duration-200",
                viewMode === "list"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
                  : "backdrop-blur-xl bg-white/5 border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/10",
              )}
              aria-label="তালিকা ভিউ"
            >
              <Icons.List className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">তালিকা</span>
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}

NotesHeaderComponent.displayName = "NotesHeaderComponent";

const NotesHeader = memo(NotesHeaderComponent);
export default NotesHeader;
