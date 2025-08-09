
import { Note } from "./types";

const now = Date.now();

export const welcomeNote: Note = {
  id: "note_welcome",
  title: "আমার নোট-এ আপনাকে স্বাগতম!",
  content: {
    time: now,
    version: "2.29.1",
    blocks: [
      {
        id: "block_welcome_1",
        type: "header",
        data: {
          text: "আমার নোট-এ আপনাকে স্বাগতম!",
          level: 1,
        },
      },
      {
        id: "block_welcome_2",
        type: "paragraph",
        data: {
          text: "এটি আপনার নতুন নোটবুক। এখানে আপনি আপনার চিন্তা, ধারণা, এবং পরিকল্পনাগুলো গুছিয়ে রাখতে পারেন।",
        },
      },
      {
        id: "block_welcome_3",
        type: "header",
        data: {
          text: "শুরু করার জন্য কিছু টিপস",
          level: 2,
        },
      },
      {
        id: "block_welcome_4",
        type: "checklist",
        data: {
          items: [
            {
              text: "একটি নতুন নোট তৈরি করতে 'নতুন নোট' বাটনে ক্লিক করুন।",
              checked: true,
            },
            {
              text: "প্রোফাইল পেজ থেকে আপনার পছন্দের থিম ও ফন্ট বেছে নিন।",
              checked: false,
            },
            {
              text: "নোট লক করার জন্য একটি পাসকোড সেট করুন।",
              checked: false,
            },
            {
              text: "আপনার লেখার অগ্রগতি দেখতে ড্যাশবোর্ড দেখুন।",
              checked: false,
            },
          ],
        },
      },
      {
        id: "block_welcome_5",
        type: "quote",
        data: {
          text: "আপনার সৃজনশীলতা প্রকাশ করুন। প্রতিটি নোট আপনার চিন্তার একটি নতুন ক্যানভাস।",
          caption: "",
          alignment: "left",
        },
      },
    ],
  },
  createdAt: now,
  updatedAt: now,
  charCount: 350,
  history: [],
  tags: ["শুরু করুন", "গাইড"],
  isPinned: true,
  isLocked: false,
  isArchived: false,
  icon: "Sparkles",
};
