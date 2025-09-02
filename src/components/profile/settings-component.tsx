"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useSettingsStore } from "@/stores/use-settings";
import { useNotesStore } from "@/stores/use-notes";
import { clearAllNotes, importNotes, getNotes, shareNote } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/ui/icons";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiKeyManager } from "./api-key-manager";

const fonts = [
  { value: "font-tiro-bangla", label: "Tiro Bangla" },
  { value: "font-hind-siliguri", label: "Hind Siliguri" },
  { value: "font-baloo-da-2", label: "Baloo Da 2" },
];

const appThemes = [
  { name: "light", label: "Light", colors: ["#FFFFFF", "#F1F5F9", "#0284C7"] },
  { name: "dark", label: "Dark", colors: ["#020817", "#1E293B", "#38BDF8"] },
  { name: "dusk", label: "Dusk", colors: ["#F8FAFC", "#E2E8F0", "#64748B"] },
  { name: "rose", label: "Rose", colors: ["#FFF1F2", "#FECDD3", "#F43F5E"] },
  {
    name: "sakura",
    label: "Sakura",
    colors: ["#FEF6F7", "#FCE7E9", "#F2A7B2"],
  },
  { name: "mint", label: "Mint", colors: ["#F0FDFA", "#CCFBF1", "#14B8A6"] },
  { name: "sea", label: "Sea", colors: ["#EFF6FF", "#DBEAFE", "#3B82F6"] },
  {
    name: "lavender",
    label: "Lavender",
    colors: ["#F5F3FF", "#DDD6FE", "#8B5CF6"],
  },
  { name: "oasis", label: "Oasis", colors: ["#FDFBF6", "#F7F2E9", "#A6C9A3"] },
  { name: "terra", label: "Terra", colors: ["#FEFCE8", "#FEF08A", "#EAB308"] },
  {
    name: "twilight",
    label: "Twilight",
    colors: ["#F7F8FD", "#E9ECF9", "#A8B4E4"],
  },
];

type SettingsCategory = "appearance" | "security" | "data";

const settingsCategories = {
  appearance: {
    icon: Icons.Palette,
    title: "চেহারা",
    description: "অ্যাপের চেহারা এবং অনুভূতি কাস্টমাইজ করুন।",
  },
  security: {
    icon: Icons.Shield,
    title: "নিরাপত্তা",
    description: "পাসকোড এবং API কী ব্যবস্থাপনা করুন।",
  },
  data: {
    icon: Icons.Database,
    title: "ডেটা ব্যবস্থাপনা",
    description: "ডেটা আমদানি, রপ্তানি এবং মুছে ফেলুন।",
  },
};

export default function SettingsComponent() {
  const { font, passcode, setSetting } = useSettingsStore();
  const { theme, setTheme } = useTheme();
  const [currentPasscode, setCurrentPasscode] = useState("");
  const [newPasscode, setNewPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] =
    useState<SettingsCategory>("appearance");

  const [isPasscodeDialogOpen, setIsPasscodeDialogOpen] = useState(false);
  const [isRemovePasscodeDialogOpen, setIsRemovePasscodeDialogOpen] =
    useState(false);

  const router = useRouter();
  const importInputRef = React.useRef<HTMLInputElement>(null);

  const { addImportedNotes, resetState: resetNotesState } = useNotesStore();

  const handleBulkShare = async () => {
    try {
      const currentNotes = await getNotes();
      if (currentNotes.length === 0) {
        toast.error("রপ্তানি করার জন্য কোনো নোট নেই।");
        return;
      }
      await shareNote(currentNotes, "json");
      toast.success("সমস্ত নোট সফলভাবে রপ্তানি করা হয়েছে।");
    } catch (e) {
      toast.error("নোট রপ্তানি করতে ব্যর্থ হয়েছে।");
    }
  };

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleFileImport = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const imported = await importNotes(file);
        addImportedNotes(imported);
        toast.success(`${imported.length} টি নোট সফলভাবে আমদানি করা হয়েছে।`);
      } catch (error) {
        toast.error("নোট আমদানি করতে ব্যর্থ হয়েছে।");
      } finally {
        if (importInputRef.current) {
          importInputRef.current.value = "";
        }
      }
    }
  };

  const handleClearData = async () => {
    try {
      await clearAllNotes();
      resetNotesState();
      router.push("/");
      toast.success("সমস্ত অ্যাপ ডেটা মুছে ফেলা হয়েছে।");
    } catch {
      toast.error("ডেটা মুছে ফেলতে ব্যর্থ হয়েছে।");
    }
  };

  const resetPasscodeFields = () => {
    setError("");
    setCurrentPasscode("");
    setNewPasscode("");
    setConfirmPasscode("");
  };

  const handlePasscodeChange = () => {
    if (passcode && currentPasscode !== passcode) {
      setError("বর্তমান পাসকোড ভুল।");
      return;
    }
    if (newPasscode.length !== 4) {
      setError("নতুন পাসকোড অবশ্যই ৪ সংখ্যার হতে হবে।");
      return;
    }
    if (newPasscode !== confirmPasscode) {
      setError("নতুন পাসকোড মিলছে না।");
      return;
    }

    setSetting("passcode", newPasscode);
    toast.success("পাসকোড সফলভাবে পরিবর্তন করা হয়েছে।");
    resetPasscodeFields();
    setIsPasscodeDialogOpen(false);
  };

  const handleRemovePasscode = () => {
    if (currentPasscode !== passcode) {
      setError("বর্তমান পাসকোড ভুল।");
      return;
    }
    setSetting("passcode", "");
    toast.success("পাসকোড সরানো হয়েছে।");
    resetPasscodeFields();
    setIsRemovePasscodeDialogOpen(false);
  };

  const renderContent = () => {
    switch (activeCategory) {
      case "appearance":
        return (
          <div className="grid gap-4 sm:gap-6 md:grid-cols-1">
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icons.Palette className="h-4 w-4" />
                  অ্যাপ থিম
                </CardTitle>
                <CardDescription className="text-sm">
                  আপনার পছন্দের রঙের থিম নির্বাচন করুন।
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {appThemes.map((themeOption) => {
                    const isActive = theme === themeOption.name;
                    return (
                      <div key={themeOption.name} className="space-y-2">
                        <button
                          onClick={() => setTheme(themeOption.name)}
                          className={cn(
                            "w-full rounded-lg border-2 p-1 transition-all",
                            isActive ? "border-primary" : "border-muted",
                          )}
                          aria-label={`Select ${themeOption.label} theme`}
                        >
                          <div className="flex items-center justify-center space-x-1 rounded-md bg-background p-2">
                            <div
                              className="h-6 w-6 rounded-full"
                              style={{ backgroundColor: themeOption.colors[0] }}
                            />
                            <div
                              className="h-6 w-6 rounded-full"
                              style={{ backgroundColor: themeOption.colors[1] }}
                            />
                            <div
                              className="h-6 w-6 rounded-full"
                              style={{ backgroundColor: themeOption.colors[2] }}
                            />
                          </div>
                        </button>
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {themeOption.label}
                          </span>
                          {isActive && (
                            <Icons.Check className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icons.Typography className="h-4 w-4" />
                  ফন্ট
                </CardTitle>
                <CardDescription className="text-sm">
                  আপনার পড়ার সুবিধার জন্য একটি ফন্ট বেছে নিন।
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Select
                  value={font}
                  onValueChange={(value) => setSetting("font", value)}
                >
                  <SelectTrigger aria-label="ফন্ট নির্বাচন করুন">
                    <SelectValue placeholder="একটি ফন্ট নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {fonts.map((fontOption) => (
                      <SelectItem
                        key={fontOption.value}
                        value={fontOption.value}
                      >
                        {fontOption.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>
        );
      case "security":
        return (
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Icons.Shield className="h-4 w-4" />
                নিরাপত্তা
              </CardTitle>
              <CardDescription className="text-sm">
                আপনার নোট পাসকোড এবং AI সেবা API কী ব্যবস্থাপনা করুন।
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col justify-between rounded-lg border p-4 sm:flex-row sm:items-center">
                <div className="mb-3 flex-1 space-y-1 sm:mb-0">
                  <p className="font-medium flex items-center gap-2">
                    <Icons.Lock className="h-4 w-4" /> নোট পাসকোড
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {passcode ? "পাসকোড সেট করা আছে" : "পাসকোড সেট করা নেই"}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Dialog
                    open={isPasscodeDialogOpen}
                    onOpenChange={(open) => {
                      if (!open) resetPasscodeFields();
                      setIsPasscodeDialogOpen(open);
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        {passcode ? "পরিবর্তন" : "পাসকোড সেট করুন"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>
                          {passcode
                            ? "পাসকোড পরিবর্তন"
                            : "নতুন পাসকোড সেট করুন"}
                        </DialogTitle>
                        <DialogDescription>
                          {passcode
                            ? "একটি নতুন ৪ সংখ্যার পাসকোড সেট করুন।"
                            : "নোট সুরক্ষিত করতে একটি ৪ সংখ্যার পাসকোড তৈরি করুন।"}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        {passcode && (
                          <Input
                            type="password"
                            placeholder="বর্তমান পাসকোড"
                            value={currentPasscode}
                            onChange={(e) =>
                              setCurrentPasscode(
                                e.target.value.replace(/\\D/g, ""),
                              )
                            }
                            maxLength={4}
                            className="text-center text-lg tracking-widest"
                            aria-label="বর্তমান পাসকোড"
                          />
                        )}
                        <Input
                          type="password"
                          placeholder="নতুন ৪ সংখ্যার পাসকোড"
                          value={newPasscode}
                          onChange={(e) =>
                            setNewPasscode(e.target.value.replace(/\\D/g, ""))
                          }
                          maxLength={4}
                          className="text-center text-lg tracking-widest"
                          aria-label="নতুন পাসকোড"
                        />
                        <Input
                          type="password"
                          placeholder="নতুন পাসকোড নিশ্চিত করুন"
                          value={confirmPasscode}
                          onChange={(e) =>
                            setConfirmPasscode(
                              e.target.value.replace(/\\D/g, ""),
                            )
                          }
                          maxLength={4}
                          className="text-center text-lg tracking-widest"
                          aria-label="নতুন পাসকোড নিশ্চিত করুন"
                        />
                        {error && (
                          <p className="text-sm text-destructive">{error}</p>
                        )}
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setIsPasscodeDialogOpen(false)}
                        >
                          বাতিল
                        </Button>
                        <Button type="button" onClick={handlePasscodeChange}>
                          সংরক্ষণ
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {passcode && (
                    <AlertDialog
                      open={isRemovePasscodeDialogOpen}
                      onOpenChange={(open) => {
                        if (!open) resetPasscodeFields();
                        setIsRemovePasscodeDialogOpen(open);
                      }}
                    >
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          সরান
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="max-w-md">
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            পাসকোড সরানোর নিশ্চিতকরণ
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            পাসকোড সরানোর জন্য আপনার বর্তমান পাসকোড লিখুন। এটি
                            সমস্ত লক করা নোট আনলক করে দেবে।
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="py-2">
                          <Input
                            type="password"
                            placeholder="বর্তমান পাসকোড"
                            value={currentPasscode}
                            onChange={(e) =>
                              setCurrentPasscode(
                                e.target.value.replace(/\\D/g, ""),
                              )
                            }
                            maxLength={4}
                            className="text-center text-lg tracking-widest"
                            aria-label="সরানোর জন্য বর্তমান পাসকোড"
                          />
                          {error && (
                            <p className="pt-2 text-sm text-destructive">
                              {error}
                            </p>
                          )}
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel>বাতিল</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleRemovePasscode}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            নিশ্চিত
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
              <ApiKeyManager />
            </CardContent>
          </Card>
        );
      case "data":
        return (
          <div className="grid gap-4 sm:gap-6 md:grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icons.Database className="h-4 w-4" />
                  ডেটা ব্যবস্থাপনা
                </CardTitle>
                <CardDescription className="text-sm">
                  আপনার নোট ব্যাকআপ এবং পুনরুদ্ধার করুন।
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleImportClick}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Icons.Upload className="mr-2 h-4 w-4" />
                  নোট আমদানি
                </Button>
                <Button
                  onClick={handleBulkShare}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Icons.Download className="mr-2 h-4 w-4" />
                  সমস্ত নোট রপ্তানি
                </Button>
                <input
                  type="file"
                  ref={importInputRef}
                  onChange={handleFileImport}
                  className="hidden"
                  accept=".json"
                />
              </CardContent>
            </Card>

            <Card className="border-destructive/20 bg-destructive/5">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-lg text-destructive">
                  <Icons.Trash className="h-4 w-4" />
                  বিপজ্জনক এলাকা
                </CardTitle>
                <CardDescription className="text-sm text-destructive/80">
                  এই কাজটি অপরিবর্তনীয়। সতর্কতার সাথে এগিয়ে চলুন।
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <Icons.Trash className="mr-2 h-4 w-4" />
                      সমস্ত ডেটা মুছে ফেলুন
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        আপনি কি একেবারে নিশ্চিত?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        এটি স্থায়ীভাবে আপনার সমস্ত নোট এবং সেটিংস মুছে ফেলবে।
                        এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>বাতিল</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleClearData}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        হ্যাঁ, সবকিছু মুছে ফেলুন
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="mb-4 flex items-center gap-2 sm:mb-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Icons.Settings className="h-4 w-4 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">সেটিংস</h2>
      </div>

      <Card className="p-2 sm:p-4">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          <aside className="lg:w-1/3 xl:w-1/4">
            <div className="flex flex-row gap-1 overflow-x-auto lg:flex-col lg:space-y-1 lg:gap-0">
              {(Object.keys(settingsCategories) as SettingsCategory[]).map(
                (key) => {
                  const {
                    icon: Icon,
                    title,
                    description,
                  } = settingsCategories[key];
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveCategory(key)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors shrink-0",
                        activeCategory === key
                          ? "bg-primary/10 text-primary shadow-inner"
                          : "hover:bg-accent/50",
                      )}
                    >
                      <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-background shadow-sm">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="hidden sm:block">
                        <p className="font-semibold text-foreground">{title}</p>
                        <p className="text-xs text-muted-foreground">
                          {description}
                        </p>
                      </div>
                    </button>
                  );
                },
              )}
            </div>
          </aside>
          <main className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </Card>
    </>
  );
}
