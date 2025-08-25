
"use client";

import { useState } from "react";
import { useSettingsStore } from "@/stores/use-settings";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Edit, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfileCard() {
  const { name, setSetting } = useSettingsStore();
  const [isEditing, setIsEditing] = useState(false);
  const [currentName, setCurrentName] = useState(name);

  const handleSave = () => {
    if (currentName.trim() === "") {
      console.error("Name cannot be empty.");
      return;
    }
    setSetting("name", currentName);
    setIsEditing(false);
  };

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-6 p-6 text-center sm:flex-row sm:p-8 sm:text-left">
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
          className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-secondary"
        >
          <User className="h-10 w-10 text-muted-foreground" />
        </motion.div>
        <div className="w-full flex-grow">
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
                  className="text-center text-xl font-bold sm:text-left sm:text-2xl"
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
                className="flex items-center justify-center gap-2 sm:justify-start"
              >
                <h2 className="text-xl font-bold sm:text-2xl">
                  {name || "Ghosty"}
                </h2>
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
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            আপনার ব্যক্তিগত তথ্য এখানে পরিচালনা করুন।
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
