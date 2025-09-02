
"use client";

import { useState } from "react";
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

interface OnboardingDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onComplete: () => void;
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "50%" : "-50%",
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? "50%" : "-50%",
    opacity: 0,
    scale: 0.95,
  }),
};

const StepContent = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`flex w-full flex-col items-center text-center ${className}`}>
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
  const [[page, direction], setPage] = useState([0, 0]);

  const steps = [
    <StepContent key="welcome">
      <motion.div
        initial={{ scale: 0.8, opacity: 0, rotate: -15 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.5, delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
        className="relative mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 via-primary/5 to-primary/15 border-2 border-primary/20 shadow-2xl"
      >
        <Icons.Sparkles className="h-20 w-20 text-primary drop-shadow-lg" />
      </motion.div>
      <h2 className="mb-2 text-3xl font-bold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">আমার নোট-এ স্বাগতম!</h2>
      <p className="mb-6 max-w-sm text-muted-foreground text-lg">
        আপনার চিন্তার জন্য একটি নির্মল ও ব্যক্তিগত জায়গা।
      </p>
    </StepContent>,

    <StepContent key="name">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
        className="mb-8 flex h-32 w-32 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary border-2 border-primary/20 shadow-lg"
      >
        <Icons.User className="h-16 w-16" />
      </motion.div>
      <h2 className="mb-2 text-3xl font-bold">আপনাকে কী নামে ডাকব?</h2>
      <p className="mb-6 max-w-sm text-muted-foreground text-lg">
        এই নামটি অ্যাপে আপনাকে অভিবাদন জানাতে ব্যবহৃত হবে।
      </p>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="w-full max-w-sm"
      >
        <Input
          value={localName}
          onChange={(e) => setLocalName(e.target.value)}
          placeholder="আপনার নাম..."
          className="h-12 text-center text-xl"
          aria-label="Your name"
        />
      </motion.div>
    </StepContent>,

    <StepContent key="offline">
       <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1, ease: "backOut" }}
        className="relative mb-8 flex h-32 w-32 items-center justify-center"
      >
        <Icons.ShieldCheck className="h-24 w-24 text-primary drop-shadow-lg" />
      </motion.div>
      <h2 className="mb-2 text-3xl font-bold">সম্পূর্ণ অফলাইন ও ব্যক্তিগত</h2>
      <p className="mb-6 max-w-md text-muted-foreground text-lg">
        আপনার সমস্ত নোট আপনার ডিভাইসেই সংরক্ষিত থাকে, যা ইন্টারনেট সংযোগ ছাড়াই ব্যবহারযোগ্য।
      </p>
    </StepContent>,

    <StepContent key="passcode">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
        className="relative mb-8 flex h-32 w-32 items-center justify-center"
      >
        <Icons.Lock className="h-20 w-20 text-primary drop-shadow-lg" />
      </motion.div>
      <h2 className="mb-2 text-3xl font-bold">নোট সুরক্ষিত রাখুন</h2>
      <p className="mb-6 max-w-sm text-muted-foreground text-lg">
        সংবেদনশীল নোটগুলো একটি ৪-সংখ্যার পাসকোড দিয়ে লক করুন।
      </p>
    </StepContent>,
    
    <StepContent key="customize">
       <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        className="relative mb-8 flex h-32 w-32 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-500/10 to-indigo-500/10 border-2 border-primary/20 shadow-lg"
      >
        <Icons.Palette className="h-16 w-16 text-primary" />
      </motion.div>
      <h2 className="mb-2 text-3xl font-bold">আপনার মতো করে সাজান</h2>
      <p className="mb-6 max-w-sm text-muted-foreground text-lg">
        বিভিন্ন থিম এবং ফন্ট ব্যবহার করে লেখার একটি মনোরম পরিবেশ তৈরি করুন।
      </p>
    </StepContent>,

    <StepContent key="history">
       <motion.div
        initial={{ rotate: -15, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1, type: 'spring' }}
        className="relative mb-8 flex h-32 w-32 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary border-2 border-primary/20 shadow-lg"
      >
        <Icons.History className="h-16 w-16" />
      </motion.div>
      <h2 className="mb-2 text-3xl font-bold">ভুল হলেও ভয় নেই</h2>
      <p className="mb-6 max-w-sm text-muted-foreground text-lg">
        ভার্সন হিস্টোরি ফিচারের মাধ্যমে আপনি যেকোনো নোটের পুরনো সংস্করণে ফিরে যেতে পারবেন।
      </p>
    </StepContent>,

    <StepContent key="start">
       <motion.div
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: 0.1, ease: "easeInOut" }}
        className="relative mb-8 flex h-32 w-32 items-center justify-center"
      >
        <Icons.Pencil className="h-24 w-24 text-primary" />
      </motion.div>
      <h2 className="mb-2 text-3xl font-bold">আপনি এখন প্রস্তুত!</h2>
      <p className="mb-6 max-w-sm text-muted-foreground text-lg">
        আপনার প্রথম নোট তৈরি করে লেখা শুরু করুন।
      </p>
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

  const handleClose = () => {
    onOpenChange(false);
    onComplete();
    setTimeout(() => setPage([0, 0]), 300);
  };

  const isLastStep = page === steps.length - 1;

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
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="absolute flex h-full w-full flex-col items-center justify-center p-8"
            >
              {steps[page]}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between bg-secondary/30 backdrop-blur-sm p-4 sm:p-6 border-t">
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
            {isLastStep ? (
              <Button onClick={handleClose} size="lg" className="rounded-xl">
                শুরু করুন
                <Icons.Rocket className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={page === 1 && !localName.trim()}
                className="rounded-xl"
              >
                পরবর্তী
                <Icons.ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
