// Backup for restoration if needed
import type { Note } from "./types";

export const createDemoNotes = async (): Promise<Note[]> => {
  const now = Date.now();

  const demoNotes: Note[] = [
    {
      id: "demo_math_note",
      title: "গণিত ও ড্রয়িং ডেমো 📐",
      content: {
        time: now,
        version: "3.0.0",
        blocks: [
          {
            id: "math_block",
            type: "math",
            data: {
              latex: "E = mc^2",
              caption: "আইনস্টাইনের বিখ্যাত সূত্র",
            },
          },
          {
            id: "text_block",
            type: "paragraph",
            data: {
              text: "এই নোটে নতুন গণিত টুল এবং ড্রয়িং ফিচার দেখানো হয়েছে।",
            },
          },
        ],
      },
      createdAt: now - 7200000,
      updatedAt: now - 3600000,
      charCount: 120,
      history: [],
      tags: ["গণিত", "ডেমো"],
      isPinned: false,
      isLocked: false,
      isArchived: false,
      isTrashed: false,
      icon: "Plus",
    },
  ];

  return demoNotes;
};
