
"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { Flame, Target, Award, BookOpen, Type } from "lucide-react";
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
} from "date-fns";
import { bn } from "date-fns/locale";

import { useNotesStore } from "@/stores/use-notes";
import { useSettingsStore } from "@/stores/use-settings";
import { getTextFromEditorJS } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Note } from "@/lib/types";

const ChallengeCard = dynamic(() => import("./_components/challenge-card"), {
  ssr: false,
});
const WritingHeatmap = dynamic(
  () => import("./_components/writing-heatmap.tsx"),
  { ssr: false },
);
const WordCountChart = dynamic(() => import("./_components/word-count-chart"), {
  ssr: false,
});
const InfoCard = dynamic(() => import("./_components/info-card"), {
  ssr: false,
});

const getWordCount = (note: Note): number => {
  if (!note.content || !note.content.blocks) return 0;
  return getTextFromEditorJS(note.content).split(/\s+/).filter(Boolean).length;
};

const getGreeting = (name: string) => {
  const hour = new Date().getHours();
  const displayName = name || "Ghosty";

  if (hour < 12) {
    return `সুপ্রভাত, ${displayName}`;
  }
  if (hour < 18) {
    return `শুভ অপরাহ্ন, ${displayName}`;
  }
  return `শুভ সন্ধ্যা, ${displayName}`;
};

function DashboardContent() {
  const notes = useNotesStore((state) => state.notes);
  const { name } = useSettingsStore();
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    setGreeting(getGreeting(name));
  }, [name]);

  const dashboardData = useMemo(() => {
    const now = new Date();
    const today = startOfDay(now);
    
    let wordsToday = 0;
    let totalWords = 0;
    let notesThisWeek = 0;
    const wordsByDay = new Map<string, number>();
    const uniqueDayStrings = new Set<string>();

    const weekInterval = { start: subDays(now, 6), end: now };

    notes.forEach((note) => {
      const wordCount = getWordCount(note);
      totalWords += wordCount;
      
      const updatedAt = new Date(note.updatedAt);
      const createdAt = new Date(note.createdAt);
      const dateKey = startOfDay(updatedAt).toISOString().split("T")[0];

      if (isToday(updatedAt)) {
        wordsToday += wordCount;
      }
      
      if (isWithinInterval(createdAt, weekInterval)) {
        notesThisWeek++;
      }

      uniqueDayStrings.add(dateKey);
      wordsByDay.set(dateKey, (wordsByDay.get(dateKey) || 0) + wordCount);
    });

    const uniqueDays = Array.from(uniqueDayStrings).map(d => new Date(d)).sort((a, b) => b.getTime() - a.getTime());

    let writingStreak = 0;
    if (uniqueDays.length > 0) {
      const isWritingToday = uniqueDays.some((d) => isSameDay(d, today));
      if (isWritingToday || (uniqueDays.length > 0 && differenceInCalendarDays(today, uniqueDays[0]) <= 1)) {
        let lastDate = today;
        writingStreak = isWritingToday ? 1 : 0;
        
        for (const day of uniqueDays) {
          if (isSameDay(day, today)) continue;
          if (differenceInCalendarDays(lastDate, day) === 1) {
            writingStreak++;
          } else {
            break; 
          }
          lastDate = day;
        }
        if (!isWritingToday && differenceInCalendarDays(today, uniqueDays[0]) > 1) {
            writingStreak = 0;
        }
      }
    }


    let longestStreak = 0;
    if (uniqueDays.length > 0) {
      let currentStreak = 1;
      for (let i = 1; i < uniqueDays.length; i++) {
        if (differenceInCalendarDays(uniqueDays[i-1], uniqueDays[i]) === 1) {
          currentStreak++;
        } else {
          longestStreak = Math.max(longestStreak, currentStreak);
          currentStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, currentStreak);
    }
    
    const heatmapEndDate = today;
    const heatmapStartDate = subDays(heatmapEndDate, 119);
    const heatmapData = Array.from(wordsByDay.entries()).map(([date, count]) => ({ date, count }));

    const last7Days = eachDayOfInterval({ start: subDays(today, 6), end: today });
    const wordCountChartData = last7Days.map((day) => {
      const dateString = day.toISOString().split("T")[0];
      return {
        date: format(day, "E", { locale: bn }),
        words: wordsByDay.get(dateString) || 0,
      };
    });

    return {
      wordsToday,
      notesThisWeek,
      writingStreak,
      heatmapData,
      heatmapStartDate,
      heatmapEndDate,
      wordCountChartData,
      longestStreak,
      totalNotes: notes.length,
      totalWords,
    };
  }, [notes]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {greeting}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          আপনার লেখার পরিসংখ্যান ও অগ্রগতির একটি সম্পূর্ণ চিত্র।
        </p>
      </motion.header>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
      >
        <div className="space-y-6 lg:col-span-2">
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
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
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

const DashboardPageSkeleton = () => (
  <div className="space-y-6 p-4 sm:p-6 lg:p-8">
    <div className="space-y-2">
      <Skeleton className="h-9 w-1/2" />
      <Skeleton className="h-6 w-3/4" />
    </div>
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  </div>
);

const DynamicDashboardContent = dynamic(
  () => Promise.resolve(DashboardContent),
  {
    ssr: false,
    loading: () => <DashboardPageSkeleton />,
  },
);

export default function DashboardPage() {
  return <DynamicDashboardContent />;
}
