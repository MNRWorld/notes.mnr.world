"use client";

import { useState, useEffect } from "react";
import { useSettingsStore } from "@/stores/use-settings";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Edit,
  Save,
  X,
  FileText,
  Archive,
  Lock,
  Trash2,
  TrendingUp,
  Star,
  Calendar,
  BarChart3,
  Activity,
  Award,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const StatCard = ({
  icon: Icon,
  label,
  value,
  trend,
  color = "primary",
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  trend?: string;
  color?: "primary" | "secondary" | "accent" | "destructive";
  delay?: number;
}) => {
  const colorClasses = {
    primary: "from-primary/20 to-primary/5 border-primary/20 text-primary",
    secondary:
      "from-secondary/20 to-secondary/5 border-secondary/20 text-secondary-foreground",
    accent:
      "from-accent/20 to-accent/5 border-accent/20 text-accent-foreground",
    destructive:
      "from-destructive/20 to-destructive/5 border-destructive/20 text-destructive",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group"
    >
      <Card
        className={`relative overflow-hidden border bg-gradient-to-br ${colorClasses[color]} hover-lift transition-all duration-300`}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-lg`}
              >
                <Icon className="w-6 h-6" />
              </motion.div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {label}
                </p>
                <motion.p
                  className="text-3xl font-bold text-foreground"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: delay + 0.2,
                    type: "spring",
                    stiffness: 200,
                  }}
                >
                  {value.toLocaleString()}
                </motion.p>
                {trend && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: delay + 0.3 }}
                    className="flex items-center mt-1"
                  >
                    <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-600 font-medium">
                      {trend}
                    </span>
                  </motion.div>
                )}
              </div>
            </div>
            <motion.div
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              whileHover={{ scale: 1.1 }}
            >
              <BarChart3 className="w-5 h-5 text-muted-foreground" />
            </motion.div>
          </div>

          {/* Animated background pattern */}
          <motion.div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, currentColor 1px, transparent 1px)`,
              backgroundSize: "20px 20px",
            }}
            animate={{
              backgroundPosition: ["0px 0px", "20px 20px", "0px 0px"],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
};

const AchievementBadge = ({
  icon: Icon,
  title,
  description,
  delay = 0,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.4 }}
    whileHover={{ scale: 1.05 }}
    className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg glass-card border-border hover:border-primary/40 transition-all duration-300 w-full"
  >
    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-medium text-xs sm:text-sm text-foreground truncate">
        {title}
      </p>
      <p className="text-xs text-muted-foreground truncate">{description}</p>
    </div>
  </motion.div>
);

export default function ProfileOverview({
  stats,
}: {
  stats: {
    totalNotes: number;
    totalWords: number;
    activeNotes: number;
    archivedNotes: number;
    lockedNotes: number;
    trashedNotes: number;
  };
}) {
  const { name, setSetting } = useSettingsStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(name);

  useEffect(() => {
    setNewName(name);
  }, [name]);

  const handleNameSave = () => {
    if (newName.trim()) {
      setSetting("name", newName.trim());
      toast.success("নাম পরিবর্তন করা হয়েছে।");
      setIsEditingName(false);
    } else {
      toast.error("নাম খালি হতে পারে না।");
    }
  };

  // Calculate achievements
  const achievements = [
    {
      icon: Star,
      title: "প্রোডাক্টিভ রাইটার",
      description: `${stats.totalWords} শব্দ লিখেছেন`,
    },
    {
      icon: Award,
      title: "অর্গানাইজড",
      description: `${stats.archivedNotes} নোট আর্কাইভ করেছেন`,
    },
    {
      icon: Activity,
      title: "নিয়মিত ব্যবহারকারী",
      description: "প্রতিদিন নোট লিখছেন",
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 md:space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4"
      >
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.2 }}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center flex-shrink-0"
        >
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        </motion.div>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl sm:text-2xl font-bold gradient-text-primary">
            প্রোফাইল ওভারভিউ
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            আপনার লেখার যাত্রার পরিসংখ্যান
          </p>
        </div>
      </motion.div>

      {/* Main Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="w-full"
      >
        <Card className="relative overflow-hidden glass-card border-border w-full">
          {/* Animated background */}
          <div className="absolute inset-0 dot-pattern-primary opacity-10" />
          <motion.div
            className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
          />

          <CardContent className="relative z-10 p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
              {/* Profile Section */}
              <motion.div
                className="xl:col-span-4 flex flex-col items-center text-center space-y-4 sm:space-y-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                {/* Avatar with animated rings */}
                <div className="relative flex-shrink-0">
                  <motion.div
                    className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white shadow-2xl"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <User className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16" />
                  </motion.div>

                  {/* Animated rings */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-primary/30"
                    animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full border border-primary/20"
                    animate={{ rotate: -360, scale: [1.1, 1, 1.1] }}
                    transition={{
                      duration: 12,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />

                  {/* Status indicator */}
                  <motion.div
                    className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-4 h-4 sm:w-6 sm:h-6 bg-green-500 rounded-full border-2 sm:border-4 border-background"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>

                {/* Name editing */}
                <div className="w-full max-w-sm">
                  <AnimatePresence mode="wait">
                    {isEditingName ? (
                      <motion.div
                        key="editing"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 w-full"
                      >
                        <Input
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="text-center glass-card border-primary/30 focus:border-primary flex-1"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleNameSave();
                            if (e.key === "Escape") setIsEditingName(false);
                          }}
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={handleNameSave}
                            size="icon"
                            className="shrink-0 hover-lift h-9 w-9 sm:h-10 sm:w-10"
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => setIsEditingName(false)}
                            variant="ghost"
                            size="icon"
                            className="shrink-0 h-9 w-9 sm:h-10 sm:w-10"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="display"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3"
                      >
                        <h3 className="text-xl sm:text-2xl font-bold gradient-text-primary text-center sm:text-left truncate">
                          {name || "ব্যবহারকারী"}
                        </h3>
                        <Button
                          onClick={() => {
                            setNewName(name);
                            setIsEditingName(true);
                          }}
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 sm:h-8 sm:w-8 hover-lift flex-shrink-0"
                        >
                          <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* User badges */}
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="secondary" className="glass-card text-xs">
                    <Calendar className="w-3 h-3 mr-1" />
                    সদস্য
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-primary/30 text-primary text-xs"
                  >
                    <Star className="w-3 h-3 mr-1" />
                    লেখক
                  </Badge>
                </div>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Achievements Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="w-full space-y-3 sm:space-y-4"
      >
        <h3 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
          <Award className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
          অর্জনসমূহ
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {achievements.map((achievement, index) => (
            <AchievementBadge
              key={achievement.title}
              icon={achievement.icon}
              title={achievement.title}
              description={achievement.description}
              delay={0.8 + index * 0.1}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
