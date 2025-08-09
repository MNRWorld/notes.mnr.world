
"use client";

import { useRef, useState } from "react";
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
import { toast } from "sonner";
import { clearAllNotes, exportNotes, importNotes } from "@/lib/storage";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useNotesStore } from "@/stores/use-notes";
import { Upload, Download, Trash, Palette, Baseline, Lock } from "lucide-react";
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
  DialogClose,
  DialogFooter,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ProfileCard from "./_components/profile-card";

const fonts = [
  { value: "font-tiro-bangla", label: "Tiro Bangla" },
  { value: "font-hind-siliguri", label: "Hind Siliguri" },
  { value: "font-baloo-da-2", label: "Baloo Da 2" },
];

const themes = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
  { value: "rose-pine", label: "Rose Pine" },
  { value: "nord", label: "Nord" },
];

export default function ProfilePage() {
  const { font, passcode, setSetting } = useSettingsStore();
  const { setTheme } = useTheme();

  const [currentPasscode, setCurrentPasscode] = useState("");
  const [newPasscode, setNewPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();
  const fontClass = font.split(" ")[0];
  const importInputRef = useRef<HTMLInputElement>(null);

  const { addImportedNotes } = useNotesStore();

  const handleExport = async () => {
    try {
      await exportNotes();
      toast.success("নোট সফলভাবে এক্সপোর্ট করা হয়েছে!");
    } catch (error) {
      toast.error("নোট এক্সপোর্ট করতে ব্যর্থ হয়েছে।");
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
        toast.success(`${imported.length} টি নোট সফলভাবে ইমপোর্ট করা হয়েছে!`);
      } catch (error) {
        toast.error(
          "নোট ইম্পোর্ট করতে ব্যর্থ হয়েছে। ফাইল ফরম্যাট সঠিক কিনা তা পরীক্ষা করুন।",
        );
      } finally {
        if (importInputRef.current) {
          importInputRef.current.value = "";
        }
      }
    }
  };

  const handleClearData = async () => {
    await clearAllNotes();
    toast.success("সমস্ত নোট মুছে ফেলা হয়েছে।");
    router.push("/notes");
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
    toast.success("পাসকোড সফলভাবে পরিবর্তন করা হয়েছে!");
    setError("");
    setCurrentPasscode("");
    setNewPasscode("");
    setConfirmPasscode("");
  };

  const handleRemovePasscode = () => {
    if (currentPasscode !== passcode) {
      setError("বর্তমান পাসকোড সঠিক নয়।");
      return;
    }
    setSetting("passcode", "");
    toast.success("পাসকোড সফলভাবে মুছে ফেলা হয়েছে!");
    setError("");
    setCurrentPasscode("");
  };

  return (
    <div className={cn("h-full space-y-8 p-4 sm:p-6 lg:p-8 pb-16", fontClass)}>
      <ProfileCard />
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
          সেটিংস
        </h1>
        <p className="mt-2 text-muted-foreground">
          আপনার অ্যাপ সেটিংস পরিচালনা করুন।
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>সাধারণ</CardTitle>
            <CardDescription>
              অ্যাপের চেহারা এবং ফন্ট পরিবর্তন করুন।
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="theme-select" className="flex items-center">
                <Palette className="mr-2 h-4 w-4" />
                থিম
              </Label>
              <Select onValueChange={setTheme} defaultValue="system">
                <SelectTrigger id="theme-select">
                  <SelectValue placeholder="একটি থিম নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {themes.map((theme) => (
                    <SelectItem key={theme.value} value={theme.value}>
                      {theme.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="font-select" className="flex items-center">
                <Baseline className="mr-2 h-4 w-4" />
                ফন্ট
              </Label>
              <Select
                value={font}
                onValueChange={(value) => setSetting("font", value)}
              >
                <SelectTrigger id="font-select">
                  <SelectValue placeholder="একটি ফন্ট নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {fonts.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ডেটা ম্যানেজমেন্ট</CardTitle>
            <CardDescription>
              আপনার নোট এবং অ্যাপ্লিকেশন ডেটা পরিচালনা করুন।
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleImportClick}
              variant="outline"
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              ফাইল থেকে ইম্পোর্ট করুন
            </Button>
            <input
              type="file"
              ref={importInputRef}
              onChange={handleFileImport}
              className="hidden"
              accept=".json"
            />
            <Button onClick={handleExport} variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              ফাইলে এক্সপোর্ট করুন
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

        <Card>
          <CardHeader>
            <CardTitle>নিরাপত্তা</CardTitle>
            <CardDescription>
              নোট লক করার জন্য পাসকোড পরিচালনা করুন।
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Lock className="mr-2 h-4 w-4" />
                  {passcode ? "পাসকোড পরিবর্তন করুন" : "পাসকোড সেট করুন"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {passcode ? "পাসকোড পরিবর্তন করুন" : "নতুন পাসকোড সেট করুন"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {passcode && (
                    <Input
                      type="password"
                      placeholder="বর্তমান পাসকোড"
                      value={currentPasscode}
                      onChange={(e) => setCurrentPasscode(e.target.value)}
                      maxLength={4}
                    />
                  )}
                  <Input
                    type="password"
                    placeholder="নতুন ৪-সংখ্যার পাসকোড"
                    value={newPasscode}
                    onChange={(e) => setNewPasscode(e.target.value)}
                    maxLength={4}
                  />
                  <Input
                    type="password"
                    placeholder="নতুন পাসকোড নিশ্চিত করুন"
                    value={confirmPasscode}
                    onChange={(e) => setConfirmPasscode(e.target.value)}
                    maxLength={4}
                  />
                  {error && <p className="text-sm text-destructive">{error}</p>}
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" onClick={handlePasscodeChange}>
                      সেভ করুন
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {passcode && (
              <AlertDialog>
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
                      ক্রিয়াটি বাতিল করা যাবে না।
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <Input
                    type="password"
                    placeholder="বর্তমান পাসকোড"
                    value={currentPasscode}
                    onChange={(e) => setCurrentPasscode(e.target.value)}
                    maxLength={4}
                  />
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <AlertDialogFooter>
                    <AlertDialogCancel>বাতিল</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRemovePasscode}>
                      নিশ্চিত করুন
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
            <CardDescription>অ্যাপ্লিকেশন সম্পর্কে তথ্য।</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="font-semibold">Made by:</span> FrostFoe
            </p>
            <p>
              <span className="font-semibold">Published by:</span> MNR World
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
