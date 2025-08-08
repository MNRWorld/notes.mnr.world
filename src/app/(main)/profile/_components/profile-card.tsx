
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
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible">
      <Card>
        <CardContent className="flex items-center gap-6 p-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary"
          >
            <User className="h-10 w-10 text-muted-foreground" />
          </motion.div>
          <div className="flex-grow">
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
                    className="text-2xl font-bold"
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
                  className="flex items-center gap-4"
                >
                  <h2 className="text-2xl font-bold">{name || "Ghosty"}</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-5 w-5" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
            <p className="text-muted-foreground">
              আপনার ব্যক্তিগত তথ্য এখানে পরিচালনা করুন।
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
