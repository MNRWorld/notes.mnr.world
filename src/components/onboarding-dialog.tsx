"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/ui/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useSettingsStore } from "@/stores/use-settings";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface OnboardingDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onComplete: () => void;
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "50%" : "-50%",
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? "50%" : "-50%",
    opacity: 0,
  }),
};

const StepContent = ({ children }: { children: React.ReactNode }) => (
  <div className="flex w-full flex-col items-center text-center">
    {children}
  </div>
);

export default function OnboardingDialog({
  isOpen,
  onOpenChange,
  onComplete,
}: OnboardingDialogProps) {
  const { name, setSetting } = useSettingsStore();
  const [localName, setLocalName] = useState(name || "");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [[page, direction], setPage] = useState([0, 0]);

  const handleProfilePictureUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfilePicture(result);
        // Save to localStorage
        localStorage.setItem("profile-picture", result);
      };
      reader.readAsDataURL(file);
    }
  };

  const steps = [
    // Welcome Step - Enhanced Features Focus
    <StepContent key="welcome">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        className="relative mb-4 md:mb-8 flex h-24 w-24 md:h-32 md:w-32 items-center justify-center"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/20 to-primary/10 rounded-full blur-xl" />
        <div className="relative bg-gradient-to-br from-primary to-accent rounded-full p-6 md:p-8 shadow-2xl">
          <Icons.Sparkles className="h-12 w-12 md:h-16 md:w-16 text-white" />
        </div>
      </motion.div>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-center"
      >
        <h2 className="mb-4 text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          আমার নোট 3.0-এ স্বাগতম!
        </h2>
        <p className="mb-6 max-w-md text-base md:text-lg text-muted-foreground leading-relaxed">
          ৯টি বিপ্লবী নতুন ফিচার সহ স্মার্ট নোট-টেকিং এর নতুন যুগে প্রবেশ করুন।
        </p>
        <div className="flex gap-2 justify-center flex-wrap">
          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary border-primary/20"
          >
            <Icons.Pencil className="w-3 h-3 mr-1" />
            ড্রয়িং টুলস
          </Badge>
          {/* Math tool removed */}
          <Badge
            variant="secondary"
            className="bg-purple-500/10 text-purple-600 border-purple-500/20"
          >
            <Icons.ShieldCheck className="w-3 h-3 mr-1" />
            প্রাইভেসি মোড
          </Badge>
        </div>
      </motion.div>
    </StepContent>,

    // Enhanced Features Step - NEW
    <StepContent key="enhanced-features">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-6"
      >
        <div className="relative mb-4 flex h-24 w-24 md:h-28 md:w-28 items-center justify-center mx-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/30 via-teal-500/20 to-cyan-500/30 rounded-full blur-xl" />
          <div className="relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-full p-5 md:p-6 shadow-2xl">
            <Icons.Sparkles className="h-14 w-14 md:h-16 md:w-16 text-white" />
          </div>
        </div>
        <h2 className="mb-3 text-xl md:text-2xl font-bold">
          🚀 নতুন উন্নত ফিচারসমূহ
        </h2>
        <p className="mb-6 max-w-md text-sm md:text-base text-muted-foreground leading-relaxed">
          আমার নোট 3.0 এ যোগ হয়েছে ৯টি শক্তিশালী নতুন ফিচার যা আপনার নোট-টেকিং
          অভিজ্ঞতাকে সম্পূর্ণ বদলে দেবে।
        </p>
      </motion.div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-xl">
        {[
          {
            icon: Icons.Pencil,
            title: "ড্রয়িং টুলস",
            desc: "ক্যানভাস-ভিত্তিক অঙ্কন",
            color: "blue",
          },
          // Math feature removed
          {
            icon: Icons.FileText,
            title: "মার্কডাউন",
            desc: "এক্সপোর্ট/ইম্পোর্ট",
            color: "green",
          },
          {
            icon: Icons.History,
            title: "ভার্সন কন্ট্রোল",
            desc: "Git-এর মতো ভার্সনিং",
            color: "red",
          },
          {
            icon: Icons.ShieldCheck,
            title: "প্রাইভেসি মোড",
            desc: "গোপনীয় নোট তৈরি",
            color: "emerald",
          },
          {
            icon: Icons.CheckSquare,
            title: "টাস্ক ম্যানেজমেন্ত",
            desc: "স্বয়ংক্রিয় টাস্ক তৈরি",
            color: "pink",
          },
        ].map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 + index * 0.05, duration: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm border-border/50 hover:scale-105 transition-transform duration-200">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-3">
                  <feature.icon className="h-5 w-5 md:h-6 md:w-6 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground text-xs md:text-sm">
                      {feature.title}
                    </p>
                    <p className="text-[10px] md:text-xs text-muted-foreground">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </StepContent>,

    // Profile Setup Step
    <StepContent key="profile">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8 text-center"
      >
        <div
          className="relative mx-auto mb-6 cursor-pointer group"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="relative w-28 h-28 md:w-32 md:h-32">
            <Avatar className="w-28 h-28 md:w-32 md:h-32 border-4 border-primary/20 shadow-xl group-hover:border-primary/40 transition-all duration-300">
              <AvatarImage src={profilePicture || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-primary/10 to-accent/10 text-2xl font-bold text-primary">
                <Icons.User className="w-14 h-14 md:w-16 md:h-16" />
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <Icons.FilePlus className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-primary rounded-full p-2 shadow-lg group-hover:scale-110 transition-transform duration-200">
              <Icons.Plus className="w-4 h-4 text-white" />
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleProfilePictureUpload}
            className="hidden"
          />
        </div>
        <h2 className="mb-3 text-xl md:text-2xl font-bold">
          আপনার প্রোফাইল সেটআপ করুন
        </h2>
        <p className="mb-6 max-w-sm text-sm md:text-base text-muted-foreground">
          একটি প্রোফাইল ছবি যোগ করুন এবং আপনার নাম সেট করুন।
        </p>
      </motion.div>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="w-full max-w-xs"
      >
        <Input
          value={localName}
          onChange={(e) => setLocalName(e.target.value)}
          placeholder="আপনার নাম..."
          className="text-center text-lg bg-background/50 border-primary/20 focus:border-primary/40"
          aria-label="Your name"
        />
      </motion.div>
    </StepContent>,

    // AI Features Step
    <StepContent key="ai">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-6"
      >
        <div className="relative mb-4 flex h-24 w-24 md:h-28 md:w-28 items-center justify-center mx-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-pink-500/30 rounded-full blur-xl" />
          <div className="relative bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full p-6 shadow-2xl">
            <Icons.Brain className="h-12 w-12 md:h-16 md:w-16 text-white" />
          </div>
        </div>
        <h2 className="mb-3 text-xl md:text-2xl font-bold">
          mnrAI - আপনার স্মার্ট সহায়ক
        </h2>
        <p className="mb-6 max-w-md text-sm md:text-base text-muted-foreground leading-relaxed">
          Google Gemini AI এর শক্তি দিয়ে তাৎক্ষণিক উত্তর পান, আইডিয়া জেনারেট
          করুন এবং আপনার লেখার মান উন্নত করুন।
        </p>
      </motion.div>
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 w-full max-w-md">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800/30">
          <CardContent className="p-3 md:p-4 text-center">
            <Icons.Circle className="h-6 w-6 md:h-8 md:w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <p className="text-xs md:text-sm font-medium text-blue-900 dark:text-blue-100">
              প্রশ্ন ও উত্তর
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800/30">
          <CardContent className="p-3 md:p-4 text-center">
            <Icons.Lightbulb className="h-6 w-6 md:h-8 md:w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
            <p className="text-xs md:text-sm font-medium text-purple-900 dark:text-purple-100">
              আইডিয়া জেনারেশন
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800/30">
          <CardContent className="p-3 md:p-4 text-center">
            <Icons.FileText className="h-6 w-6 md:h-8 md:w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <p className="text-xs md:text-sm font-medium text-green-900 dark:text-green-100">
              টেক্সট সাহায্য
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/20 dark:to-pink-900/20 border-pink-200 dark:border-pink-800/30">
          <CardContent className="p-3 md:p-4 text-center">
            <Icons.Search className="h-6 w-6 md:h-8 md:w-8 text-pink-600 dark:text-pink-400 mx-auto mb-2" />
            <p className="text-xs md:text-sm font-medium text-pink-900 dark:text-pink-100">
              রিসার্চ সাহায্য
            </p>
          </CardContent>
        </Card>
      </div>
    </StepContent>,

    // Smart Templates Step
    <StepContent key="templates">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-6"
      >
        <div className="relative mb-4 flex h-24 w-24 md:h-28 md:w-28 items-center justify-center mx-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 via-red-500/20 to-pink-500/30 rounded-full blur-xl" />
          <div className="relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-full p-6 shadow-2xl">
            <Icons.Files className="h-12 w-12 md:h-16 md:w-16 text-white" />
          </div>
        </div>
        <h2 className="mb-3 text-xl md:text-2xl font-bold">
          স্মার্ট টেমপ্লেট কালেকশন
        </h2>
        <p className="mb-6 max-w-md text-sm md:text-base text-muted-foreground leading-relaxed">
          পূর্ব-প্রস্তুত টেমপ্লেট দিয়ে দ্রুত লেখা শুরু করুন। মিটিং নোট থেকে
          প্রজেক্ট পরিকল্পনা - সবকিছুর জন্য আছে টেমপ্লেট।
        </p>
      </motion.div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-lg">
        {[
          { icon: Icons.Briefcase, label: "মিটিং নোট" },
          { icon: Icons.Feather, label: "দৈনিক জার্নাল" },
          { icon: Icons.Rocket, label: "প্রজেক্ট প্ল্যান" },
          { icon: Icons.Book, label: "বই রিভিউ" },
          { icon: Icons.ListCheck, label: "করণীয় তালিকা" },
          { icon: Icons.Plus, label: "আরও..." },
        ].map((template, index) => (
          <motion.div
            key={template.label}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 + index * 0.1, duration: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm border-border/50 hover:scale-105 transition-transform duration-200">
              <CardContent className="p-3 text-center">
                <template.icon className="h-5 w-5 md:h-6 md:w-6 text-primary mx-auto mb-1" />
                <p className="text-[11px] md:text-xs font-medium text-foreground">
                  {template.label}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </StepContent>,

    // Security & Privacy Step
    <StepContent key="security">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-6"
      >
        <div className="relative mb-4 flex h-24 w-24 md:h-28 md:w-28 items-center justify-center mx-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/30 via-emerald-500/20 to-teal-500/30 rounded-full blur-xl" />
          <div className="relative bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-full p-6 shadow-2xl">
            <Icons.ShieldCheck className="h-12 w-12 md:h-16 md:w-16 text-white" />
          </div>
        </div>
        <h2 className="mb-3 text-xl md:text-2xl font-bold">
          নিরাপত্তা ও গোপনীয়তা
        </h2>
        <p className="mb-6 max-w-md text-sm md:text-base text-muted-foreground leading-relaxed">
          আপনার সমস্ত ডেটা স্থানীয়ভাবে সংরক্ষিত। অতিরিক্ত নিরাপত্তার জন্য
          পাসকোড সেট করুন।
        </p>
      </motion.div>
      <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800/30">
          <CardContent className="p-3 md:p-4 flex items-center gap-3">
            <Icons.Database className="h-6 w-6 md:h-8 md:w-8 text-green-600 dark:text-green-400 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm text-green-900 dark:text-green-100">
                স্থানীয় সংরক্ষণ
              </p>
              <p className="text-xs text-green-700 dark:text-green-300">
                ইন্টারনেট ছাড়াই কাজ করে
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-950/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800/30">
          <CardContent className="p-3 md:p-4 flex items-center gap-3">
            <Icons.Lock className="h-6 w-6 md:h-8 md:w-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm text-blue-900 dark:text-blue-100">
                পাসকোড সুরক্ষা
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                গুরুত্বপূর্ণ নোট লক করুন
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-800/30">
          <CardContent className="p-3 md:p-4 flex items-center gap-3">
            <Icons.Eye className="h-6 w-6 md:h-8 md:w-8 text-purple-600 dark:text-purple-400 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm text-purple-900 dark:text-purple-100">
                কোনো ট্র্যাকিং নেই
              </p>
              <p className="text-xs text-purple-700 dark:text-purple-300">
                সম্পূর্ণ প্রাইভেট অভিজ্ঞতা
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </StepContent>,

    // Ready to Start Step
    <StepContent key="start">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-8"
      >
        <div className="relative mb-6 flex h-28 w-28 md:h-32 md:w-32 items-center justify-center mx-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-accent/30 to-primary/20 rounded-full blur-2xl animate-pulse" />
          <div className="relative bg-gradient-to-br from-primary via-accent to-primary rounded-full p-8 shadow-2xl">
            <Icons.Rocket className="h-12 w-12 md:h-16 md:w-16 text-white" />
          </div>
        </div>
        <h2 className="mb-4 text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          🎉 সব প্রস্তুত!
        </h2>
        <p className="mb-6 max-w-md text-base md:text-lg text-muted-foreground leading-relaxed">
          {localName ? `${localName}, ` : ""}আপনি এখন আমার নোট 3.0 এর সব আধুনিক
          ফিচার ব্যবহার করতে পারবেন। ড্রয়িং, প্রাইভেসি মোড - সব কিছুই আপনার
          হাতের মুঠোয়!
        </p>
        <div className="flex gap-2 justify-center flex-wrap">
          <Badge variant="default" className="bg-primary text-white">
            <Icons.Check className="w-3 h-3 mr-1" />
            প্রোফাইল সেটআপ
          </Badge>
          <Badge variant="default" className="bg-accent text-white">
            <Icons.Check className="w-3 h-3 mr-1" />
            ৯টি নতুন ফিচার
          </Badge>
          <Badge variant="default" className="bg-primary text-white">
            <Icons.Check className="w-3 h-3 mr-1" />
            সব ফিচার আনলক
          </Badge>
        </div>
      </motion.div>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-center text-xs md:text-sm text-muted-foreground"
      >
        নতুন ফিচারগুলো দেখতে হোমপেজে "ডেমো নোট" বাটনে ক্লিক করুন। এই ফিচারগুলো
        প্রোফাইল সেটিংসে গিয়ে পরে কাস্টমাইজ করতে পারবেন।
      </motion.div>
    </StepContent>,
  ];

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  const setPageByIndex = (index: number) => {
    const newDirection = index > page ? 1 : -1;
    setPage([index, newDirection]);
  };

  const handleNext = () => {
    if (page === 1 && localName.trim()) {
      setSetting("name", localName.trim());
    }
    paginate(1);
  };

  const handleBack = () => {
    if (page > 0) {
      paginate(-1);
    }
  };

  const handleClose = () => {
    if (localName.trim()) {
      setSetting("name", localName.trim());
    }
    onOpenChange(false);
    onComplete();
    setTimeout(() => setPage([0, 0]), 300);
  };

  const isLastStep = page === steps.length - 1;
  const isFirstStep = page === 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-screen h-screen max-w-full p-0 flex flex-col rounded-none border-0 bg-background"
        onInteractOutside={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        {!isLastStep && (
          <div className="absolute top-4 right-4 z-20">
            <Button variant="ghost" onClick={handleClose}>
              এড়িয়ে যান
            </Button>
          </div>
        )}
        <DialogHeader className="sr-only">
          <DialogTitle>অ্যাপ পরিচিতি</DialogTitle>
          <DialogDescription>
            অ্যাপটির বিভিন্ন ফিচার সম্পর্কে জানুন।
          </DialogDescription>
        </DialogHeader>
        <div className="relative flex-grow flex items-center justify-center overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={page}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "ease", duration: 0.3 },
                opacity: { duration: 0.2 },
              }}
              className="absolute flex h-full w-full flex-col items-center justify-center p-4 sm:p-8"
            >
              {steps[page]}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex-shrink-0 flex items-center justify-between bg-muted/20 border-t border-border/50 p-4 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPageByIndex(i)}
                  className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
                  aria-label={`Go to step ${i + 1}`}
                >
                  <motion.div
                    className="h-2 rounded-full"
                    style={{
                      backgroundColor:
                        i === page
                          ? "hsl(var(--primary))"
                          : "hsl(var(--muted-foreground) / 0.5)",
                    }}
                    animate={{
                      width: i === page ? 24 : 8,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 20,
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <Button
                onClick={handleBack}
                variant="outline"
                className="bg-background/50"
              >
                আগের ধাপ
              </Button>
            )}
            {isLastStep ? (
              <Button
                onClick={handleClose}
                size="lg"
                className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg"
              >
                শুরু করুন
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={page === 2 && !localName.trim()}
                className="bg-gradient-to-r from-primary to-accent text-primary-foreground"
              >
                পরবর্তী
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
