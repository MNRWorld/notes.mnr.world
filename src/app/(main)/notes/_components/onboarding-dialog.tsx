
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

export default function OnboardingDialog({ isOpen, onOpenChange }: OnboardingDialogProps) {
  const [[page, direction], setPage] = useState([0, 0]);
  const currentFeature = features[page];
  const IconComponent = currentFeature.icon;

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => setPage([0, 0]), 300);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <DialogHeader>
           <VisuallyHidden>
             <DialogTitle>Application Onboarding</DialogTitle>
           </VisuallyHidden>
        </DialogHeader>
        <div className="h-[24rem] relative flex items-center justify-center">
          <AnimatePresence initial={false} custom={direction}>
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
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
                <IconComponent className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold mb-2">{currentFeature.title}</h2>
              <p className="text-muted-foreground mb-2">{currentFeature.description}</p>
              {currentFeature.tagline && (
                <p className="text-sm font-medium text-primary mt-2">{currentFeature.tagline}</p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between p-6 bg-secondary/50">
          <Button
            variant="ghost"
            onClick={() => paginate(-1)}
            className={page === 0 ? "invisible" : "visible"}
          >
            পূর্ববর্তী
          </Button>
          <div className="flex gap-2">
            {features.map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full transition-all ${
                  i === page ? "w-4 bg-primary" : "bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>
          {page === features.length - 1 ? (
            <Button onClick={handleClose}>লেখা শুরু করুন</Button>
          ) : (
            <Button onClick={() => paginate(1)}>পরবর্তী</Button>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4"
          onClick={handleClose}
        >
          এড়িয়ে যান
        </Button>
      </DialogContent>
    </Dialog>
  );
}
