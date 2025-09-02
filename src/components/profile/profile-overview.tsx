"use client";

import { useState, useEffect, useRef } from "react";
import { useSettingsStore } from "@/stores/use-settings";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/ui/icons";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfileOverview({
  stats,
}: {
  stats: { totalNotes: number; totalWords: number };
}) {
  const { name, setSetting } = useSettingsStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(name);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setNewName(name);
    // Load profile picture from localStorage
    const savedPicture = localStorage.getItem("profile-picture");
    if (savedPicture) {
      setProfilePicture(savedPicture);
    }
  }, [name]);

  const handleNameSave = () => {
    if (newName.trim()) {
      setSetting("name", newName.trim());
      toast.success("নাম সফলভাবে পরিবর্তন করা হয়েছে।");
      setIsEditingName(false);
    } else {
      toast.error("নামের ঘরটি খালি রাখা যাবে না।");
    }
  };

  const handleProfilePictureUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("ছবির আকার ৫ MB এর কম হতে হবে।");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfilePicture(result);
        localStorage.setItem("profile-picture", result);
        toast.success("প্রোফাইল ছবি সফলভাবে আপডেট করা হয়েছে।");
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfilePicture = () => {
    setProfilePicture(null);
    localStorage.removeItem("profile-picture");
    toast.success("প্রোফাইল ছবি সরানো হয়েছে।");
  };

  return (
    <Card className="relative overflow-hidden bg-card/80 backdrop-blur-xl border-border w-full">
      <CardContent className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col items-center gap-6 lg:gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4 flex-shrink-0 group">
              <div
                className="relative cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Avatar className="w-28 h-28 border-4 border-primary/20 shadow-lg group-hover:border-primary/40 transition-all duration-300">
                  <AvatarImage src={profilePicture || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/10 to-accent/10 text-2xl font-bold text-primary">
                    <Icons.User className="w-14 h-14" />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Icons.FilePlus className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1.5 shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <Icons.Plus className="w-3 h-3 text-white" />
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                className="hidden"
              />
              {profilePicture && (
                <Button
                  onClick={removeProfilePicture}
                  variant="outline"
                  size="sm"
                  className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/80 backdrop-blur-sm"
                >
                  <Icons.X className="w-3 h-3 mr-1" />
                  সরান
                </Button>
              )}
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
                      <Icons.DeviceFloppy className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => setIsEditingName(false)}
                      variant="ghost"
                      size="icon"
                    >
                      <Icons.X className="w-4 h-4" />
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
                      <Icons.Pencil className="w-4 h-4" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 justify-center">
              <Badge variant="secondary">
                <Icons.Calendar className="w-3 h-3 mr-1" />
                সদস্য
              </Badge>
              <Badge variant="outline">
                <Icons.Star className="w-3 h-3 mr-1" />
                লেখক
              </Badge>
              {profilePicture && (
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/30"
                >
                  <Icons.Check className="w-3 h-3 mr-1" />
                  প্রোফাইল সেটআপ
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
