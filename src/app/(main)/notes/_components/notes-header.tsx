"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/stores/use-settings";
import { cn } from "@/lib/utils";
import { Search, LayoutGrid, List } from "lucide-react";

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

export default function NotesHeader({
  sortOption,
  setSortOption,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
}: NotesHeaderProps) {
  const font = useSettingsStore((state) => state.font);
  const [fontClass] = font.split(" ");

  return (
    <header className="flex flex-col gap-4">
      <div className="flex w-full justify-center lg:hidden">
        <Image
          src="https://mnr.world/wp-content/uploads/2025/03/MNR-Animated-Logo.gif"
          alt="আমার নোট"
          width={115}
          height={60}
          unoptimized
        />
      </div>
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="নোট খুঁজুন (ট্যাগ দিয়েও)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9"
          aria-label="Search notes"
        />
      </div>
      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Select
          value={sortOption}
          onValueChange={(value) => setSortOption(value as SortOption)}
        >
          <SelectTrigger className="w-full sm:w-auto sm:flex-1 md:w-[180px] md:flex-none">
            <SelectValue placeholder="সাজান..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updatedAt-desc">সম্প্রতি আপডেট হয়েছে</SelectItem>
            <SelectItem value="createdAt-desc">নতুন প্রথমে</SelectItem>
            <SelectItem value="createdAt-asc">পুরানো প্রথমে</SelectItem>
            <SelectItem value="title-asc">শিরোনাম (A-Z)</SelectItem>
            <SelectItem value="title-desc">শিরোনাম (Z-A)</SelectItem>
            <SelectItem value="charCount-desc">দৈর্ঘ্য (দীর্ঘতম)</SelectItem>
            <SelectItem value="charCount-asc">দৈর্ঘ্য (সংক্ষিপ্ততম)</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1 self-end rounded-md border bg-background p-1">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
            className="h-8 w-8"
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
            className="h-8 w-8"
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
