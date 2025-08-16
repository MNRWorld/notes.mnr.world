
"use client";

import { useState } from "react";
import { useSettingsStore } from "@/stores/use-settings";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Edit, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function ProfileCard() {
  const { name, setSetting } = useSettingsStore();
  const [isEditing, setIsEditing] = useState(false);
  const [currentName, setCurrentName] = useState(name);

  const handleSave = () => {
    if (currentName.trim() === "") {
      toast.error("নাম খালি রাখা যাবে না।");
      return;
    }
    setSetting("name", currentName);
    setIsEditing(false);
    toast.success("নাম সফলভাবে পরিবর্তন করা হয়েছে!");
  };

  const cardVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.25, ease: "easeOut" },
    },
  };

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-4 text-center sm:flex-row sm:p-6 sm:text-left sm:gap-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary flex-shrink-0"
          >
            <User className="h-8 w-8 text-muted-foreground" />
          </motion.div>
          <div className="flex-grow w-full">
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div
                  key="edit"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2"
                >
                  <Input
                    value={currentName}
                    onChange={(e) => setCurrentName(e.target.value)}
                    className="text-xl sm:text-2xl font-bold text-center sm:text-left"
                    onKeyDown={(e) => e.key === "Enter" && handleSave()}
                  />
                  <Button size="icon" onClick={handleSave}>
                    <Save className="h-5 w-5" />
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="view"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center sm:justify-start gap-2"
                >
                  <h2 className="text-xl sm:text-2xl font-bold">{name || "Ghosty"}</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              আপনার ব্যক্তিগত তথ্য এখানে পরিচালনা করুন।
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
