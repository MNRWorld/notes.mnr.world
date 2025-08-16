
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Palette,
  Sparkles,
  PenSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface OnboardingDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const features = [
  {
    icon: Sparkles,
    title: "স্বাগতম!",
    description: "আমার নোট-এ আপনাকে স্বাগতম! এটি আপনার চিন্তাগুলো গুছিয়ে রাখার একটি নির্মল ও ব্যক্তিগত জায়গা।",
    tagline: "সম্পূর্ণ অফলাইন, নিরাপদ, এবং আপনার জন্য।",
  },
  {
    icon: ShieldCheck,
    title: "গোপনীয়তা প্রথম",
    description: "আপনার সমস্ত নোট শুধুমাত্র আপনার ডিভাইসেই সংরক্ষিত থাকে। কোনো ইন্টারনেট সংযোগের প্রয়োজন নেই। চাইলে পাসকোড দিয়ে নোট লক করুন – আপনার ডেটা আপনার নিয়ন্ত্রণে।",
  },
  {
    icon: Palette,
    title: "আপনার মত করে সাজান",
    description: "আপনার পছন্দের থিম ও ফন্ট বেছে নিয়ে অ্যাপটিকে নিজের মতো করে সাজিয়ে নিন।",
  },
  {
    icon: PenSquare,
    title: "চলুন শুরু করি",
    description: "আমরা আপনার জন্য একটি 'Welcome' নোট তৈরি করেছি যা আপনাকে এডিটরের ব্যবহার শেখাবে।",
  },
];

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
  }),
};

const contentVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      type: "spring",
      stiffness: 260,
      damping: 20,
    },
  }),
};

export default function OnboardingDialog({ isOpen, onOpenChange }: OnboardingDialogProps) {
  const [[page, direction], setPage] = useState([0, 0]);
  const currentFeature = features[page];
  const IconComponent = currentFeature.icon;

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };
  
  const setPageByIndex = (index: number) => {
    const newDirection = index > page ? 1 : -1;
    setPage([index, newDirection]);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => setPage([0, 0]), 300);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <VisuallyHidden>
            <DialogTitle>Application Onboarding</DialogTitle>
        </VisuallyHidden>
        <div className="h-[24rem] relative flex items-center justify-center overflow-hidden bg-background">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={page}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="absolute w-full h-full flex flex-col justify-center items-center text-center p-8"
            >
              <motion.div 
                variants={contentVariants}
                custom={0}
                initial="hidden"
                animate="visible"
                className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
                <IconComponent className="h-8 w-8" />
              </motion.div>
              <motion.h2 
                variants={contentVariants}
                custom={1}
                initial="hidden"
                animate="visible"
                className="text-2xl font-bold mb-2">{currentFeature.title}</motion.h2>
              <motion.p 
                variants={contentVariants}
                custom={2}
                initial="hidden"
                animate="visible"
                className="text-muted-foreground mb-2">{currentFeature.description}</motion.p>
              {currentFeature.tagline && (
                <motion.p 
                  variants={contentVariants}
                  custom={3}
                  initial="hidden"
                  animate="visible"
                  className="text-sm font-medium text-primary mt-2">{currentFeature.tagline}</motion.p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between p-6 bg-secondary/50">
           <div className="flex gap-2">
            {features.map((_, i) => (
              <button key={i} onClick={() => setPageByIndex(i)} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full">
                <motion.div
                  className="h-2 rounded-full"
                  style={{
                    backgroundColor: i === page ? 'hsl(var(--primary-hsl))' : 'hsl(var(--muted-foreground-hsl) / 0.5)'
                  }}
                  animate={{ 
                    width: i === page ? 16 : 8,
                  }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                />
              </button>
            ))}
          </div>
          {page === features.length - 1 ? (
            <Button onClick={handleClose}>লেখা শুরু করুন</Button>
          ) : (
            <Button onClick={() => paginate(1)}>পরবর্তী</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
