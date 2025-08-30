import { Note } from "./types";

const now = Date.now();

export const welcomeNote: Note = {
  id: "note_welcome",
  title: "আমার নোট-এ স্বাগতম ✨",
  content: {
    time: now,
    version: "2.29.1",
    blocks: [
      {
        id: "block_welcome_1",
        type: "paragraph",
        data: {
          text: "আমার নোট ব্যবহার করে আপনি:",
        },
      },
      {
        id: "block_welcome_2",
        type: "list",
        data: {
          style: "unordered",
          items: [
            "ব্যক্তিগত ও অফলাইন নোট সংরক্ষণ করতে পারবেন।",
            "পাসকোড দিয়ে ডেটা সুরক্ষিত রাখতে পারবেন।",
            "থিম ও ফন্ট দিয়ে অ্যাপ সাজাতে পারবেন।",
          ],
        },
      },
      {
        id: "block_welcome_3",
        type: "paragraph",
        data: {
          text: "শুরু করতে, '+' বোতামে চাপ দিন এবং আপনার প্রথম নোট লিখুন!",
        },
      },
    ],
  },
  createdAt: now,
  updatedAt: now,
  charCount: 200,
  history: [],
  tags: ["শুরু", "গাইড"],
  isPinned: true,
  isLocked: false,
  isArchived: false,
  isTrashed: false,
  icon: "Lightbulb",
};
