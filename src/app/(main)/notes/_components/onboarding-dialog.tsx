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
import {
  Sparkles,
  User,
  ShieldCheck,
  Lock,
  Palette,
  LayoutDashboard,
  History,
  PenSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSettingsStore } from "@/stores/use-settings";

interface OnboardingDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onComplete: () => void;
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 0.8,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 0.8,
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
  const [[page, direction], setPage] = useState([0, 0]);

  const steps = [
    // Step 1: Welcome
    <StepContent key="welcome">
      <motion.div
        className="relative mb-6 flex h-24 w-24 items-center justify-center"
        animate={{
          y: [0, -8, 0],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Sparkles className="h-20 w-20 text-primary" />
      </motion.div>
      <h2 className="mb-2 text-2xl font-bold">আমার নোট-এ স্বাগতম!</h2>
      <p className="mb-6 max-w-sm text-muted-foreground">
        আপনার চিন্তাগুলো গুছিয়ে রাখার একটি নির্মল ও ব্যক্তিগত জায়গা।
      </p>
    </StepContent>,

    // Step 2: Name
    <StepContent key="name">
      <motion.div
        className="mb-6 flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
        animate={{
          y: [0, -5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <User className="h-12 w-12" />
      </motion.div>
      <h2 className="mb-2 text-2xl font-bold">আপনাকে কী নামে ডাকব?</h2>
      <p className="mb-6 max-w-sm text-muted-foreground">
        এই নামটি ড্যাশবোর্ডে আপনাকে অভিবাদন জানাতে ব্যবহৃত হবে।
      </p>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <Input
          value={localName}
          onChange={(e) => setLocalName(e.target.value)}
          placeholder="আপনার নাম লিখুন..."
          className="max-w-xs text-center text-lg"
        />
      </motion.div>
    </StepContent>,

    // Step 3: Offline
    <StepContent key="offline">
      <motion.div className="relative mb-6 flex h-24 w-24 items-center justify-center">
        <motion.div
          animate={{
            rotate: [0, 10, -10, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <ShieldCheck className="h-16 w-16 text-primary" />
        </motion.div>
      </motion.div>
      <h2 className="mb-2 text-2xl font-bold">সম্পূর্ণ অফলাইন এবং ব্যক্তিগত</h2>
      <p className="mb-6 max-w-sm text-muted-foreground">
        আপনার সমস্ত নোট আপনার ডিভাইসেই সংরক্ষিত থাকে, যা সম্পূর্ণ ব্যক্তিগত এবং
        ইন্টারনেট সংযোগ ছাড়াই ব্যবহারযোগ্য।
      </p>
    </StepContent>,

    // Step 4: Passcode
    <StepContent key="passcode">
      <div className="relative mb-6 flex h-24 w-24 items-center justify-center">
        <motion.div
          className="text-primary"
          animate={{
            rotate: [0, 15, -10, 0, 0, 0],
            scale: [1, 1.1, 1.1, 1, 1, 1],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Lock className="h-14 w-14" />
        </motion.div>
      </div>
      <h2 className="mb-2 text-2xl font-bold">
        পাসকোড দিয়ে নোট সুরক্ষিত রাখুন
      </h2>
      <p className="mb-6 max-w-sm text-muted-foreground">
        সংবেদনশীল নোটগুলোকে একটি ৪-সংখ্যার পাসকোড দিয়ে লক করার সুবিধাটি ব্যবহার
        করুন। এই ফিচারটি সেটিংস থেকে চালু করা যাবে।
      </p>
    </StepContent>,

    // Step 5: Customize
    <StepContent key="customize">
      <div className="relative mb-6 flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <Palette className="h-12 w-12" />
        </motion.div>
      </div>
      <h2 className="mb-2 text-2xl font-bold">আপনার জায়গাটি সাজিয়ে নিন</h2>
      <p className="mb-6 max-w-sm text-muted-foreground">
        বিভিন্ন থিম এবং ফন্ট ব্যবহার করে আপনার অ্যাপটিকে নিজের মতো করে সাজিয়ে
        নিন এবং লেখার একটি মনোরম পরিবেশ তৈরি করুন।
      </p>
    </StepContent>,

    // Step 6: Dashboard
    <StepContent key="dashboard">
      <div className="relative mb-6 flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <LayoutDashboard className="h-12 w-12" />
      </div>
      <h2 className="mb-2 text-2xl font-bold">আপনার অগ্রগতি ট্র্যাক করুন</h2>
      <p className="mb-6 max-w-sm text-muted-foreground">
        ড্যাশবোর্ডের মাধ্যমে আপনার লেখার ধারা, শব্দগণনা এবং রাইটিং হিটম্যাপ দেখে
        নিজেকে আরও বেশি লিখতে উৎসাহিত করুন।
      </p>
    </StepContent>,

    // Step 7: History
    <StepContent key="history">
      <motion.div
        className="relative mb-6 flex h-24 w-24 items-center justify-center"
        initial="rest"
        whileHover="hover"
        animate="rest"
      >
        <div className="relative flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <motion.div
            animate={{ rotate: -360 }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <History className="h-12 w-12" />
          </motion.div>
        </div>
      </motion.div>
      <h2 className="mb-2 text-2xl font-bold">ভুল হলেও ভয় নেই</h2>
      <p className="mb-6 max-w-sm text-muted-foreground">
        ভার্সন হিস্টোরি ফিচারের মাধ্যমে আপনি যেকোনো নোটের পুরনো সংস্করণে ফিরে
        যেতে পারবেন। আপনার কোনো পরিবর্তনই হারিয়ে যাবে না।
      </p>
    </StepContent>,

    // Step 8: Start
    <StepContent key="start">
      <div className="relative mb-6 flex h-24 w-24 items-center justify-center">
        <motion.div
          className="text-primary"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <PenSquare className="h-20 w-20" />
        </motion.div>
      </div>
      <h2 className="mb-2 text-2xl font-bold">আপনি এখন প্রস্তুত!</h2>
      <p className="mb-6 max-w-sm text-muted-foreground">
        আপনার প্রথম নোট তৈরি করে লেখা শুরু করুন। আপনার চিন্তার ক্যানভাস অপেক্ষা
        করছে।
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
        className="w-screen h-screen max-w-full p-0 flex flex-col rounded-none border-0"
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
          <DialogTitle>Application Onboarding</DialogTitle>
          <DialogDescription>
            A short tour of the application features.
          </DialogDescription>
        </DialogHeader>
        <div className="relative flex-grow flex items-center justify-center overflow-hidden bg-background">
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

        <div className="flex items-center justify-between bg-secondary/30 p-4 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPageByIndex(i)}
                  className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
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
              <Button onClick={handleClose} size="lg">
                লেখা শুরু করুন
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={page === 1 && !localName.trim()}
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

    