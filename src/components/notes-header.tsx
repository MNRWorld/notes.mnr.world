"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "./button";
import { Search, Grid, List } from "lucide-react";
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
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
        <Input
          placeholder="নোট খুঁজুন (ট্যাগ দিয়েও)..."
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
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300" />
          <Select
            value={sortOption}
            onValueChange={(value) => setSortOption(value as SortOption)}
          >
            <SelectTrigger className="w-full text-sm sm:w-auto sm:min-w-[200px] h-11 backdrop-blur-xl bg-white/5 border-emerald-500/20 hover:border-emerald-500/40 rounded-xl relative z-10">
              <SelectValue placeholder="সাজান" />
            </SelectTrigger>
            <SelectContent className="backdrop-blur-xl bg-white/10 border-emerald-500/20">
              <SelectItem value="updatedAt-desc">
                শেষ সম্পাদনা (নতুন → পুরাতন)
              </SelectItem>
              <SelectItem value="updatedAt-asc">
                শেষ সম্পাদনা (পুরাতন → নতুন)
              </SelectItem>
              <SelectItem value="createdAt-desc">
                তৈরির তারিখ (নতুন → পুরাতন)
              </SelectItem>
              <SelectItem value="createdAt-asc">
                তৈরির তারিখ (পুরাতন → নতুন)
              </SelectItem>
              <SelectItem value="title-asc">শিরোনাম (A → Z)</SelectItem>
              <SelectItem value="title-desc">শিরোনাম (Z → A)</SelectItem>
              <SelectItem value="charCount-desc">আকার (বড় → ছোট)</SelectItem>
              <SelectItem value="charCount-asc">আকার (ছোট → বড়)</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        <div className="flex items-center gap-2">
          <motion.div whileTap={{ scale: 0.98 }}>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className={cn(
                "h-11 flex-1 px-4 text-sm sm:flex-none rounded-xl transition-all duration-200",
                viewMode === "grid"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
                  : "backdrop-blur-xl bg-white/5 border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/10",
              )}
              aria-label="Grid view"
            >
              <Grid className="h-4 w-4" />
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
              aria-label="List view"
            >
              <List className="h-4 w-4" />
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
