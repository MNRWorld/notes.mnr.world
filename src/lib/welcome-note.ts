
import { Note } from "./types";

const now = Date.now();

export const welcomeNote: Note = {
  id: "note_welcome",
  title: "Welcome to আমার নোট ✨",
  content: {
    time: now,
    version: "2.29.1",
    blocks: [
      {
        id: "block_welcome_1",
        type: "paragraph",
        data: {
          text: "আমার নোট ব্যবহার করে আপনি—",
        },
      },
      {
        id: "block_welcome_2",
        type: "list",
        data: {
          style: "unordered",
          items: [
            "ব্যক্তিগত এবং অফলাইন নোট সংরক্ষণ করতে পারবেন।",
            "আপনার ডেটাকে পাসকোড দিয়ে সুরক্ষিত রাখতে পারবেন।",
            "থিম ও ফন্ট দিয়ে অ্যাপ সাজিয়ে নিতে পারবেন।",
          ],
        },
      },
      {
        id: "block_welcome_3",
        type: "paragraph",
        data: {
          text: "শুরু করতে, উপরের + বোতামে চাপ দিন এবং আপনার প্রথম নোট লিখুন!",
        },
      },
    ],
  },
  createdAt: now,
  updatedAt: now,
  charCount: 200,
  history: [],
  tags: ["শুরু করুন", "গাইড"],
  isPinned: true,
  isLocked: false,
  isArchived: false,
  icon: "Sparkles",
};
