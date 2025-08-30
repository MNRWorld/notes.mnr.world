
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
  TrendingUp,
  Calendar,
  Star,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const StatCard = ({
  icon: Icon,
  label,
  value,
  color = "primary",
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color?: "primary" | "secondary";
}) => {
  const colorClasses = {
    primary: "text-primary bg-primary/10",
    secondary: "text-indigo-500 bg-indigo-500/10",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="w-full"
    >
      <Card
        className={`relative overflow-hidden border ${
          color === "primary" ? "border-primary/20" : "border-indigo-500/20"
        } hover-lift transition-all duration-300 h-full`}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center`}
            >
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {label}
              </p>
              <p className="text-2xl font-bold text-foreground">
                {value.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function ProfileOverview({
  stats,
}: {
  stats: { totalNotes: number; totalWords: number };
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

  return (
    <Card className="relative overflow-hidden glass-card border-border w-full">
      <CardContent className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col items-center gap-6 lg:gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4 flex-shrink-0">
              <motion.div
                className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white shadow-lg"
                whileHover={{ scale: 1.05 }}
              >
                <User className="w-16 h-16" />
              </motion.div>
            </div>
            <div className="w-full max-w-sm">
              <AnimatePresence mode="wait">
                {isEditingName ? (
                  <motion.div
                    key="editing"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2"
                  >
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="text-center"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleNameSave();
                        if (e.key === "Escape") setIsEditingName(false);
                      }}
                    />
                    <Button onClick={handleNameSave} size="icon">
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => setIsEditingName(false)}
                      variant="ghost"
                      size="icon"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="display"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <h3 className="text-2xl font-bold text-foreground">
                      {name || "ব্যবহারকারী"}
                    </h3>
                    <Button
                      onClick={() => setIsEditingName(true)}
                      variant="ghost"
                      size="icon"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 justify-center">
              <Badge variant="secondary">
                <Calendar className="w-3 h-3 mr-1" />
                সদস্য
              </Badge>
              <Badge variant="outline">
                <Star className="w-3 h-3 mr-1" />
                লেখক
              </Badge>
            </div>
          </div>

          <div className="grid w-full max-w-md grid-cols-2 gap-4">
            <StatCard
              icon={FileText}
              label="মোট নোট"
              value={stats.totalNotes}
              color="primary"
            />
            <StatCard
              icon={TrendingUp}
              label="মোট শব্দ"
              value={stats.totalWords}
              color="secondary"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
