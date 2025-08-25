"use client";

import { useRef, useState, useCallback } from "react";
import { useSettingsStore } from "@/stores/use-settings";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { clearAllNotes, importNotes, getNotes, shareNote } from "@/lib/storage";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useNotesStore } from "@/stores/use-notes";
import {
  Upload,
  Trash,
  Palette,
  CaseSensitive,
  Lock,
  Sun,
  Moon,
  Check,
  Download,
} from "lucide-react";
import { useTheme } from "next-themes";
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
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import ProfileCard from "./_components/profile-card";
import { motion } from "framer-motion";

const fonts = [
  { value: "font-tiro-bangla", label: "Tiro Bangla" },
  { value: "font-hind-siliguri", label: "Hind Siliguri" },
  { value: "font-baloo-da-2", label: "Baloo Da 2" },
];

const appThemes = [
  { name: "light", label: "ডিফল্ট", color: "hsl(0 0% 50%)" },
  { name: "rose", label: "রোজ পাইন", color: "#eb6f92" },
  { name: "mint", label: "সিরিন মিন্ট", color: "#9ccfd8" },
  { name: "dusk", label: "ডাস্ক ব্লু", color: "#6e9a99" },
  { name: "lavender", label: "ল্যাভেন্ডার", color: "#cba6f7" },
  { name: "terra", label: "টেরা", color: "#ea9a97" },
  { name: "sea", label: "সি", color: "#95c4ce" },
];

export default function ProfilePage() {
  const { font, passcode, setSetting } = useSettingsStore();
  const { theme: appTheme, setTheme, resolvedTheme } = useTheme();

  const [currentPasscode, setCurrentPasscode] = useState("");
  const [newPasscode, setNewPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const [error, setError] = useState("");

  const [isPasscodeDialogOpen, setIsPasscodeDialogOpen] = useState(false);
  const [isRemovePasscodeDialogOpen, setIsRemovePasscodeDialogOpen] =
    useState(false);

  const router = useRouter();
  const fontClass = font.split(" ")[0];
  const importInputRef = useRef<HTMLInputElement>(null);

  const { addImportedNotes, resetState: resetNotesState } = useNotesStore();

  const handleBulkShare = useCallback(async () => {
    const currentNotes = await getNotes();
    if (currentNotes.length === 0) {
      console.error("No notes to export.");
      return;
    }
    shareNote(currentNotes, "json");
  }, []);

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
      } catch (error) {
        console.error("Failed to import notes.", error);
      } finally {
        if (importInputRef.current) {
          importInputRef.current.value = "";
        }
      }
    }
  };

  const handleClearData = async () => {
    await clearAllNotes();
    resetNotesState();
    router.push("/notes");
  };

  const resetPasscodeFields = () => {
    setError("");
    setCurrentPasscode("");
    setNewPasscode("");
    setConfirmPasscode("");
  };

  const handlePasscodeChange = () => {
    if (passcode && currentPasscode !== passcode) {
      setError("বর্তমান পাসকোড সঠিক নয়।");
      return;
    }
    if (newPasscode.length !== 4) {
      setError("নতুন পাসকোড অবশ্যই ৪ সংখ্যার হতে হবে।");
      return;
    }
    if (newPasscode !== confirmPasscode) {
      setError("নতুন পাসকোড দুটি মিলেনি।");
      return;
    }

    setSetting("passcode", newPasscode);
    resetPasscodeFields();
    setIsPasscodeDialogOpen(false);
  };

  const handleRemovePasscode = () => {
    if (currentPasscode !== passcode) {
      setError("বর্তমান পাসকোড সঠিক নয়।");
      return;
    }
    setSetting("passcode", "");
    resetPasscodeFields();
    setIsRemovePasscodeDialogOpen(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  return (
    <div
      className={cn("space-y-6 p-4 pt-8 sm:p-6 lg:p-8 lg:space-y-8", fontClass)}
    >
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          প্রোফাইল ও সেটিংস
        </h1>
        <p className="mt-1 text-base text-muted-foreground">
          আপনার প্রোফাইল, অ্যাপ সেটিংস ও ডেটা পরিচালনা করুন।
        </p>
      </motion.header>

      <motion.div variants={itemVariants} initial="hidden" animate="visible">
        <ProfileCard />
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8"
      >
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>সাধারণ</CardTitle>
              <CardDescription>
                অ্যাপের চেহারা এবং ফন্ট পরিবর্তন করুন।
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="flex items-center">
                  <Palette className="mr-2 h-4 w-4" />
                  মোড
                </Label>
                <div className="rounded-lg bg-muted p-1">
                  <div className="grid grid-cols-2 items-center justify-center gap-1">
                    <Button
                      variant={resolvedTheme === "dark" ? "secondary" : "ghost"}
                      onClick={() => setTheme("dark")}
                      className="h-auto rounded-md px-3 py-1.5 shadow-sm justify-center"
                    >
                      <Moon className="mr-2 h-4 w-4" />
                      Dark
                    </Button>
                    <Button
                      variant={
                        resolvedTheme === "light" ? "secondary" : "ghost"
                      }
                      onClick={() => setTheme("light")}
                      className="h-auto rounded-md px-3 py-1.5 shadow-sm justify-center"
                    >
                      <Sun className="mr-2 h-4 w-4" />
                      Light
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="font-select" className="flex items-center">
                  <CaseSensitive className="mr-2 h-4 w-4" />
                  ফন্ট
                </Label>
                <Select
                  value={font}
                  onValueChange={(value) => setSetting("font", value)}
                >
                  <SelectTrigger
                    id="font-select"
                    className="w-full sm:w-[200px]"
                  >
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
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>নিরাপত্তা</CardTitle>
              <CardDescription>
                নোট লক করার জন্য পাসকোড পরিচালনা করুন।
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 sm:flex-row">
              <Dialog
                open={isPasscodeDialogOpen}
                onOpenChange={(open) => {
                  if (!open) resetPasscodeFields();
                  setIsPasscodeDialogOpen(open);
                }}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Lock className="mr-2 h-4 w-4" />
                    {passcode ? "পাসকোড পরিবর্তন করুন" : "পাসকোড সেট করুন"}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {passcode
                        ? "পাসকোড পরিবর্তন করুন"
                        : "নতুন পাসকোড সেট করুন"}
                    </DialogTitle>
                    <DialogDescription>
                      {passcode
                        ? "আপনার বর্তমান পাসকোড দিয়ে নতুন একটি ৪-সংখ্যার পাসকোড সেট করুন।"
                        : "আপনার নোটগুলো সুরক্ষিত রাখতে একটি ৪-সংখ্যার পাসকোড তৈরি করুন।"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {passcode && (
                      <Input
                        type="password"
                        placeholder="বর্তমান পাসকোড"
                        value={currentPasscode}
                        onChange={(e) =>
                          setCurrentPasscode(e.target.value.replace(/\D/g, ""))
                        }
                        maxLength={4}
                      />
                    )}
                    <Input
                      type="password"
                      placeholder="নতুন ৪-সংখ্যার পাসকোড"
                      value={newPasscode}
                      onChange={(e) =>
                        setNewPasscode(e.target.value.replace(/\D/g, ""))
                      }
                      maxLength={4}
                    />
                    <Input
                      type="password"
                      placeholder="নতুন পাসকোড নিশ্চিত করুন"
                      value={confirmPasscode}
                      onChange={(e) =>
                        setConfirmPasscode(e.target.value.replace(/\D/g, ""))
                      }
                      maxLength={4}
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
                      সেভ করুন
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
                    <Button variant="destructive" className="w-full">
                      পাসকোড মুছে ফেলুন
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>পাসকোড নিশ্চিত করুন</AlertDialogTitle>
                      <AlertDialogDescription>
                        পাসকোড মুছে ফেলার জন্য আপনার বর্তমান পাসকোডটি লিখুন। এই
                        ক্রিয়াটি আপনার সমস্ত লক করা নোট আনলক করে দেবে।
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-2">
                      <Input
                        type="password"
                        placeholder="বর্তমান পাসকোড"
                        value={currentPasscode}
                        onChange={(e) =>
                          setCurrentPasscode(e.target.value.replace(/\D/g, ""))
                        }
                        maxLength={4}
                      />
                      {error && (
                        <p className="pt-2 text-sm text-destructive">{error}</p>
                      )}
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>বাতিল করুন</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleRemovePasscode}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        নিশ্চিত করুন
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>থিম</CardTitle>
              <CardDescription>অ্যাপের জন্য একটি থিম বেছে নিন।</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {appThemes.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => setTheme(theme.name)}
                  className="flex items-center gap-3 rounded-md border-2 p-3 transition-colors hover:border-primary/50"
                  style={{
                    borderColor:
                      appTheme === theme.name ? "hsl(var(--primary))" : "",
                  }}
                >
                  <div
                    className="h-6 w-6 rounded-full"
                    style={{ backgroundColor: theme.color }}
                  />
                  <div className="flex-1 text-left">
                    <p className="font-semibold">{theme.label}</p>
                  </div>
                  {appTheme === theme.name && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </button>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>ডেটা ম্যানেজমেন্ট</CardTitle>
              <CardDescription>
                আপনার নোট এবং অ্যাপ্লিকেশন ডেটা পরিচালনা করুন।
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Button
                onClick={handleImportClick}
                variant="outline"
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                ডেটা ইম্পোর্ট করুন
              </Button>
              <input
                type="file"
                ref={importInputRef}
                onChange={handleFileImport}
                className="hidden"
                accept=".json"
              />
              <Button
                onClick={handleBulkShare}
                variant="outline"
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                সমস্ত ডেটা এক্সপোর্ট করুন
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Trash className="mr-2 h-4 w-4" />
                    সমস্ত ডেটা সাফ করুন
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>আপনি কি নিশ্চিত?</AlertDialogTitle>
                    <AlertDialogDescription>
                      এই ক্রিয়াটি আপনার সমস্ত লোকাল নোট স্থায়ীভাবে মুছে ফেলবে।
                      এটি বাতিল করা যাবে না।
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>বাতিল করুন</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearData}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      ডিলিট করুন
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>সম্পর্কে</CardTitle>
              <CardDescription>অ্যাপ্লিকেশন সম্পর্কে তথ্য।</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">তৈরি করেছেন:</span> FrostFoe
              </p>
              <p>
                <span className="font-semibold">প্রকাশক:</span> MNR World
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
      <div className="h-16" />
    </div>
  );
}
