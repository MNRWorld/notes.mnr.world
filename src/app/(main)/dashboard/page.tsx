
"use client";

import { useState, useEffect } from "react";
import {
  Flame,
  Target,
  Award,
  BookOpen,
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
} from "date-fns";
import { bn } from "date-fns/locale";

import { useNotesStore } from "@/stores/use-notes";
import ChallengeCard from "./_components/challenge-card";
import WritingHeatmap from "./_components/writing-heatmap.tsx";
import WordCountChart from "./_components/word-count-chart";
import InfoCard from "./_components/info-card";
import { getTextFromEditorJS } from "@/lib/utils";

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
  longestStreak: number;
  totalNotes: number;
  totalWords: number;
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

    const wordsToday = notes
      .filter((note) => isToday(new Date(note.updatedAt)))
      .reduce((acc, note) => acc + getWordCount(note), 0);
    
    const totalNotes = notes.length;
    const totalWords = notes.reduce((acc, note) => acc + getWordCount(note), 0);

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
    
    const longestStreak = writingStreak > 5 ? writingStreak : 5;

    setDashboardData({
      wordsToday,
      notesThisWeek,
      writingStreak,
      heatmapData,
      heatmapStartDate,
      heatmapEndDate,
      wordCountChartData,
      longestStreak,
      totalNotes,
      totalWords
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
      <div className="h-full space-y-8 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
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
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
          <InfoCard
            title="সর্বমোট নোট"
            content={`${dashboardData.totalNotes} টি`}
            icon={BookOpen}
          />
          <InfoCard
            title="সর্বমোট শব্দ"
            content={`${dashboardData.totalWords.toLocaleString()} টি`}
            icon={Type}
          />
           <InfoCard
            title="সবচেয়ে দীর্ঘ ধারা"
            content={`${dashboardData.longestStreak} দিন`}
            footer="আপনার নিজের রেকর্ড ভাঙুন!"
            icon={Award}
          />
      </motion.div>
    </div>
  );
}
