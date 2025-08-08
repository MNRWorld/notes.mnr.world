
"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Flame,
  Target,
  Award,
  BookOpen,
  BrainCircuit,
  Type,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  isToday,
  isWithinInterval,
  subDays,
  startOfDay,
  differenceInCalendarDays,
  format,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isSameYear,
} from "date-fns";
import { bn } from "date-fns/locale";

import { useNotesStore } from "@/stores/use-notes";
import ChallengeCard from "./_components/challenge-card";
import WritingHeatmap from "./_components/writing-heatmap.tsx";
import WordCountChart from "./_components/word-count-chart";
import TagCloud from "./_components/tag-cloud";
import InfoCard from "./_components/info-card";
import { getTextFromEditorJS } from "@/lib/utils";
import { Note } from "@/lib/types";

const getWordCount = (note: any): number => {
  if (!note.content || !note.content.blocks) return 0;
  return getTextFromEditorJS(note.content).split(/\s+/).filter(Boolean).length;
};

interface DashboardData {
  wordsToday: number;
  notesThisWeek: number;
  writingStreak: number;
  heatmapData: { date: string; count: number }[];
  heatmapStartDate: Date;
  heatmapEndDate: Date;
  wordCountChartData: { date: string; words: number }[];
  tagCounts: { [key: string]: number };
  revisitContent: string;
  revisitFooter: string;
  longestStreak: number;
  quoteOfTheDay: string;
}

export default function DashboardPage() {
  const notes = useNotesStore((state) => state.notes);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const now = new Date();
    const today = startOfDay(now);

    const tagCounts: { [key: string]: number } = {};
    notes.forEach((note) => {
      note.tags?.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const wordsToday = notes
      .filter((note) => isToday(new Date(note.updatedAt)))
      .reduce((acc, note) => acc + getWordCount(note), 0);

    const notesThisWeek = notes.filter((note) =>
      isWithinInterval(new Date(note.createdAt), {
        start: subDays(now, 6),
        end: now,
      }),
    ).length;

    const uniqueDays = [
      ...new Set(
        notes.map((note) => startOfDay(new Date(note.updatedAt)).toISOString()),
      ),
    ]
      .map((dateString) => new Date(dateString))
      .sort((a, b) => b.getTime() - a.getTime());

    let writingStreak = 0;
    if (uniqueDays.length > 0) {
      const isWritingToday = uniqueDays.some((d) => isSameDay(d, today));
      if (
        isWritingToday ||
        (uniqueDays.length > 0 &&
          differenceInCalendarDays(today, uniqueDays[0]) === 1)
      ) {
        writingStreak = isWritingToday ? 1 : 0;
        let lastDate = isWritingToday ? today : uniqueDays[0];
        let streakHolder = isWritingToday ? 1 : 0;
        
        const daysToCheck = isWritingToday ? uniqueDays : uniqueDays.slice(1);

        for (const day of uniqueDays) {
            if (isSameDay(day, today)) continue;
            if (differenceInCalendarDays(lastDate, day) === 1) {
                streakHolder++;
            } else {
                break;
            }
            lastDate = day;
        }
        writingStreak = streakHolder;
      }
    }

    const heatmapEndDate = today;
    const heatmapStartDate = subDays(heatmapEndDate, 119);
    const wordsByDay = new Map<string, number>();
    notes.forEach((note) => {
      const date = startOfDay(new Date(note.updatedAt))
        .toISOString()
        .split("T")[0];
      wordsByDay.set(date, (wordsByDay.get(date) || 0) + getWordCount(note));
    });
    const heatmapData = Array.from(wordsByDay.entries()).map(
      ([date, count]) => ({ date, count }),
    );

    const last7Days = eachDayOfInterval({
      start: subDays(today, 6),
      end: today,
    });
    const wordCountChartData = last7Days.map((day) => {
      const dateString = day.toISOString().split("T")[0];
      return {
        date: format(day, "E", { locale: bn }),
        words: wordsByDay.get(dateString) || 0,
      };
    });

    const oldNotes = notes.filter(
      (note) => differenceInCalendarDays(now, new Date(note.updatedAt)) > 90,
    );
    const revisitNote = oldNotes.length > 0 ? oldNotes[0] : null;
    const revisitContent = revisitNote
      ? `"${revisitNote.title}" লেখাটি আপডেট করুন।`
      : "সব নোট আপ-টু-ডেট!";

    const longestStreak = writingStreak > 5 ? writingStreak : 5;

    const quoteOfTheDay = "আপনার চিন্তার জন্য একটি নির্মল জায়গা।";

    setDashboardData({
      wordsToday,
      notesThisWeek,
      writingStreak,
      heatmapData,
      heatmapStartDate,
      heatmapEndDate,
      wordCountChartData,
      tagCounts,
      revisitContent,
      revisitFooter: revisitNote
        ? `Last updated ${format(new Date(revisitNote.updatedAt), "PP", { locale: bn })}`
        : "",
      longestStreak,
      quoteOfTheDay,
    });
  }, [notes, isClient]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  if (!dashboardData) {
    return (
      <div className="h-full space-y-8 p-4 sm:p-6 lg:p-8">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="h-full space-y-8 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
          ড্যাশবোর্ড
        </h1>
        <p className="mt-2 text-muted-foreground">
          আপনার লেখার পরিসংখ্যান ও অগ্রগতির একটি সম্পূর্ণ চিত্র।
        </p>
      </motion.header>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2 space-y-6">
          <WritingHeatmap
            data={dashboardData.heatmapData}
            startDate={dashboardData.heatmapStartDate}
            endDate={dashboardData.heatmapEndDate}
          />
          <WordCountChart data={dashboardData.wordCountChartData} />
        </div>

        <div className="space-y-6">
          <ChallengeCard
            icon={Target}
            title="দৈনিক শব্দচয়ন"
            description="আপনার দৈনিক লেখার লক্ষ্য পূরণ করুন।"
            currentValue={dashboardData.wordsToday}
            targetValue={250}
            unit="শব্দ"
          />
          <ChallengeCard
            icon={Award}
            title="সাপ্তাহিক নোট"
            description="এই সপ্তাহে নতুন নোট তৈরি করুন।"
            currentValue={dashboardData.notesThisWeek}
            targetValue={7}
            unit="নোট"
          />
          <ChallengeCard
            icon={Flame}
            title="টানা লেখার ধারা"
            description="প্রতিদিন লিখে অভ্যাসকে শক্তিশালী করুন।"
            currentValue={dashboardData.writingStreak}
            targetValue={14}
            unit="দিন"
          />
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2">
          <TagCloud tags={dashboardData.tagCounts} />
        </div>
        <div className="flex flex-col gap-6">
          <InfoCard
            title="সবচেয়ে দীর্ঘ ধারা"
            content={`${dashboardData.longestStreak} দিন`}
            footer="আপনার নিজের রেকর্ড ভাঙুন!"
            icon={Award}
          />
          <InfoCard
            title="পুনরায় দেখুন"
            content={dashboardData.revisitContent}
            footer={dashboardData.revisitFooter}
            icon={Flame}
          />
          <InfoCard
            title="দিনের উক্তি"
            content={`"${dashboardData.quoteOfTheDay}"`}
            icon={Type}
          />
        </div>
      </motion.div>
    </div>
  );
}
