/**
 * Features Showcase Page
 * Demonstrates all the new enhanced features
 */

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileAttachments } from "@/components/file-attachments";
import {
  BengaliCalendarWidget,
  BengaliCalendarDisplay,
} from "@/components/bengali-calendar";
import {
  PrivacyControls,
  IncognitoModeDialog,
} from "@/components/privacy-mode";
import { EnhancedNoteCard } from "@/components/enhanced-note-card";
import { Changelog } from "@/components/changelog";
import { ImplementationSummary } from "@/components/implementation-summary";
import { getCurrentBengaliDate } from "@/lib/bengali-calendar";
import { PrivacyManager } from "@/lib/privacy-manager";
import { TaskManager } from "@/lib/task-manager";
import { Note } from "@/lib/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const demoNote: Note = {
  id: "demo_note_1",
  title: "নতুন ফিচার ডেমো নোট",
  content: {
    version: "2.28.2",
    time: Date.now(),
    blocks: [
      {
        type: "paragraph",
        data: {
          text: "এটি একটি ডেমো নোট যা নতুন ফিচারগুলি প্রদর্শন করে।",
        },
      },
      {
        type: "checklist",
        data: {
          items: [
            { text: "গুরুত্বপূর্ণ কাজ সম্পন্ন করুন", checked: true },
            { text: "মাঝারি কাজ করুন", checked: false },
            { text: "কম গুরুত্বপূর্ণ কাজ", checked: false },
          ],
        },
      },
    ],
  },
  createdAt: Date.now() - 86400000,
  updatedAt: Date.now(),
  isPinned: false,
  isLocked: false,
  isArchived: false,
  isTrashed: false,
  tags: ["ডেমো", "ফিচার", "নতুন"],
  bengaliDate: getCurrentBengaliDate(),
  attachments: [],
  tasks: [],
  history: [
    {
      content: {
        version: "2.28.2",
        time: Date.now() - 3600000,
        blocks: [
          {
            type: "paragraph",
            data: { text: "পূর্ববর্তী ভার্সন" },
          },
        ],
      },
      updatedAt: Date.now() - 3600000,
      version: "v1",
      message: "প্রাথমিক ভার্সন",
    },
  ],
  version: "v2",
};

export default function FeaturesShowcase() {
  const [showIncognitoDialog, setShowIncognitoDialog] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  const features = [
    {
      id: "drawing",
      title: "অঙ্কন টুল",
      description: "ক্যানভাস-ভিত্তিক অঙ্কন টুল দিয়ে ভিজ্যুয়াল নোট তৈরি করুন",
      icon: "Feather",
      demo: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            এডিটরে অঙ্কন ব্লক যোগ করে ছবি, ডায়াগ্রাম এবং স্কেচ তৈরি করুন।
          </p>
          <div className="border rounded-lg p-4 bg-muted/20">
            <div className="flex items-center gap-2 mb-2">
              <Icons.Feather className="h-4 w-4" />
              <span className="text-sm font-medium">অঙ্কন এলাকা</span>
            </div>
            <div className="h-32 bg-white border rounded flex items-center justify-center text-muted-foreground">
              এখানে আপনার অঙ্কন দেখানো হবে
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "math",
      title: "গণিতের সূত্র",
      description: "LaTeX/KaTeX সাপোর্ট দিয়ে গণিতের সূত্র লিখুন",
      icon: "Plus",
      demo: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            একাডেমিক নোটের জন্য গণিতের সূত্র এবং সমীকরণ যোগ করুন।
          </p>
          <div className="border rounded-lg p-4 bg-muted/20">
            <div className="text-center">
              <div className="text-lg font-mono mb-2">E = mc²</div>
              <div className="text-xs text-muted-foreground">
                আইনস্টাইনের ভর-শক্তি সমীকরণ
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "markdown",
      title: "মার্কডাউন এক্সপোর্ট/ইম্পোর্ট",
      description: "মার্কডাউন ফরম্যাটে নোট এক্সপোর্ট এবং ইম্পোর্ট করুন",
      icon: "FileText",
      demo: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            অন্যান্য অ্যাপের সাথে সামঞ্জস্যের জন্য মার্কডাউন সাপোর্ট।
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Icons.Download className="h-4 w-4" />
              এক্সপোর্ট
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Icons.Upload className="h-4 w-4" />
              ইম্পোর্ট
            </Button>
          </div>
        </div>
      ),
    },
    {
      id: "bengali-calendar",
      title: "বাংলা ক্যালেন্ডার",
      description: "বাংলা তারিখ এবং ঋতু তথ্য সহ নোট",
      icon: "Calendar",
      demo: <BengaliCalendarWidget />,
    },
    {
      id: "version-control",
      title: "ভার্সন কন্ট্রোল",
      description: "Git-এর মতো ভার্সন হিস্ট্রি এবং ব্র্যাঞ্চিং",
      icon: "History",
      demo: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            গুরুত্বপূর্ণ নোটের জন্য ভার্সন হিস্ট্রি রাখুন।
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 border rounded">
              <Icons.History className="h-4 w-4" />
              <div className="flex-1">
                <div className="text-sm font-medium">v2 • এখনই</div>
                <div className="text-xs text-muted-foreground">
                  বর্তমান ভার্সন
                </div>
              </div>
              <Badge variant="secondary">বর্তমান</Badge>
            </div>
            <div className="flex items-center gap-2 p-2 border rounded">
              <Icons.History className="h-4 w-4" />
              <div className="flex-1">
                <div className="text-sm font-medium">v1 • ১ ঘন্টা আগে</div>
                <div className="text-xs text-muted-foreground">
                  প্রাথমিক ভার্সন
                </div>
              </div>
              <Button variant="outline" size="sm">
                পুনরুদ্ধার
              </Button>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "privacy",
      title: "গোপনীয়তা মোড",
      description: "গোপনীয় এবং এনক্রিপ্টেড নোট তৈরি করুন",
      icon: "Eye",
      demo: (
        <div className="space-y-4">
          <PrivacyControls
            note={demoNote}
            onMakeAnonymous={() => toast.success("নোট গোপনীয় করা হয়েছে")}
            onRemoveAnonymity={() => toast.success("গোপনীয়তা সরানো হয়েছে")}
            onToggleEncryption={() => toast.success("এনক্রিপশন টগল করা হয়েছে")}
          />
        </div>
      ),
    },
    {
      id: "tasks",
      title: "কাজ ব্যবস্থাপনা",
      description: "নোট থেকে কাজের তালিকা তৈরি এবং ট্র্যাক করুন",
      icon: "CheckSquare",
      demo: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            চেকলিস্ট থেকে স্বয়ংক্রিয়ভাবে কাজের তালিকা তৈরি করুন।
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 border rounded">
              <Icons.CheckSquare className="h-4 w-4 text-green-500" />
              <span className="text-sm line-through">সম্পন্ন কাজ</span>
              <Badge variant="secondary" className="ml-auto">
                উচ্চ
              </Badge>
            </div>
            <div className="flex items-center gap-2 p-2 border rounded">
              <Icons.Circle className="h-4 w-4" />
              <span className="text-sm">অসম্পন্ন কাজ</span>
              <Badge variant="outline" className="ml-auto">
                মাঝারি
              </Badge>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "attachments",
      title: "ফাইল সংযুক্তি",
      description: "ছবি, PDF, অডিও ফাইল নোটে সংযুক্ত করুন",
      icon: "File",
      demo: (
        <FileAttachments
          attachments={[]}
          onAddAttachment={async (file) => {
            toast.success(`${file.name} ফাইল সংযুক্ত হবে`);
          }}
          onRemoveAttachment={async (id) => {
            toast.success("ফাইল সরানো হবে");
          }}
        />
      ),
    },
    {
      id: "pwa",
      title: "উন্নত PWA",
      description: "অফলাইন ক্যাশিং এবং ব্যাকগ্রাউন্ড সিঙ্ক",
      icon: "Bolt",
      demo: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            উন্নত অফলাইন সাপোর্ট এবং ব্যাকগ্রাউন্ড সিঙ্ক।
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 p-2 border rounded">
              <Icons.Bolt className="h-4 w-4 text-green-500" />
              <span className="text-xs">অফলাইন ক্যাש</span>
            </div>
            <div className="flex items-center gap-2 p-2 border rounded">
              <Icons.RotateCcw className="h-4 w-4 text-blue-500" />
              <span className="text-xs">ব্যাকগ্রাউন্ড সিঙ্ক</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">🚀 নতুন ফিচার শোকেস</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            আমার নোট অ্যাপে যোগ হওয়া নতুন এবং উন্নত ফিচারগুলি আবিষ্কার করুন। এই
            ফিচারগুলি আপনার নোট নেওয়ার অভিজ্ঞতাকে আরও সমৃদ্ধ করবে।
          </p>
        </motion.div>

        {/* Demo Note Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-semibold mb-4 text-center">
            উন্নত নোট কার্ড
          </h2>
          <div className="max-w-md mx-auto">
            <EnhancedNoteCard
              note={demoNote}
              onActionClick={(action, note) => {
                toast.success(`${action} ক্রিয়া সম্পাদিত হবে: ${note.title}`);
              }}
            />
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const IconComponent = (Icons as any)[feature.icon];

            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={cn(
                    "h-full transition-all duration-300 cursor-pointer hover:shadow-lg",
                    selectedFeature === feature.id && "ring-2 ring-primary",
                  )}
                  onClick={() =>
                    setSelectedFeature(
                      selectedFeature === feature.id ? null : feature.id,
                    )
                  }
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {IconComponent && <IconComponent className="h-5 w-5" />}
                      {feature.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardHeader>

                  {selectedFeature === feature.id && (
                    <CardContent>
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        {feature.demo}
                      </motion.div>
                    </CardContent>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 space-y-4"
        >
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              onClick={() => setShowIncognitoDialog(true)}
              className="gap-2"
            >
              <Icons.Eye className="h-4 w-4" />
              গোপনীয় নোট তৈরি করুন
            </Button>

            <Button variant="outline" className="gap-2">
              <Icons.FileText className="h-4 w-4" />
              নতুন নোট তৈরি করুন
            </Button>

            <Button variant="outline" className="gap-2">
              <Icons.Calendar className="h-4 w-4" />
              আজকের তারিখ দেখুন
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            এই ফিচারগুলি ব্যবহার করে আপনার নোট নেওয়ার অভিজ্ঞতা উন্নত করুন
          </p>
        </motion.div>

        {/* Implementation Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-16"
        >
          <ImplementationSummary />
        </motion.div>

        {/* Changelog Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16"
        >
          <Changelog />
        </motion.div>

        {/* Incognito Dialog */}
        <IncognitoModeDialog
          isOpen={showIncognitoDialog}
          onClose={() => setShowIncognitoDialog(false)}
          onCreateNote={(settings) => {
            toast.success("গোপনীয় নোট তৈরি হবে");
            console.log("Incognito settings:", settings);
          }}
        />
      </div>
    </div>
  );
}
