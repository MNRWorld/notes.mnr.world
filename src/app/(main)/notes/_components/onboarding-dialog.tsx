
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HardDriveDownload, Palette, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface OnboardingDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const features = [
  {
    icon: Sparkles,
    title: "স্বাগতম!",
    description: "আমার নোট-এ আপনাকে স্বাগতম! এটি আপনার চিন্তাগুলো গুছিয়ে রাখার একটি নির্মল ও ব্যক্তিগত জায়গা।",
  },
  {
    icon: HardDriveDownload,
    title: "সম্পূর্ণ অফলাইন",
    description: "আপনার সমস্ত নোট আপনার ডিভাইসেই নিরাপদে সংরক্ষিত থাকে। কোনো ইন্টারনেট সংযোগের প্রয়োজন নেই।",
  },
  {
    icon: ShieldCheck,
    title: "গোপনীয়তা প্রথম",
    description: "আপনার নোট লক করতে একটি পাসকোড সেট করুন। আপনার ডেটা সম্পূর্ণ আপনার নিয়ন্ত্রণে।",
  },
  {
    icon: Palette,
    title: "আপনার মত করে সাজান",
    description: "আপনার পছন্দের থিম এবং ফন্ট বেছে নিয়ে অ্যাপটিকে নিজের মতো করে সাজিয়ে নিন।",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
};


export default function OnboardingDialog({ isOpen, onOpenChange }: OnboardingDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">আমার নোট-এ স্বাগতম!</DialogTitle>
          <DialogDescription className="text-center">
            আপনার লেখালেখির যাত্রাকে আরও সুন্দর করতে কিছু প্রধান বৈশিষ্ট্য।
          </DialogDescription>
        </DialogHeader>

        <motion.div 
          className="grid gap-4 py-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} className="flex items-start gap-4" variants={item}>
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <feature.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="w-full">
            শুরু করুন
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
