"use client";

import type { EditorOutputData } from "./types";

// Template block builders
export const templateBlocks = {
  header: (text: string, level: 1 | 2 | 3 | 4 = 2) => ({
    type: "header",
    data: { text, level },
  }),

  paragraph: (text: string = "") => ({
    type: "paragraph",
    data: { text },
  }),

  list: (
    items: string[] = [],
    style: "ordered" | "unordered" = "unordered",
  ) => ({
    type: "list",
    data: { style, items },
  }),

  checklist: (items: Array<{ text: string; checked: boolean }> = []) => ({
    type: "checklist",
    data: { items },
  }),

  quote: (text: string, caption: string = "") => ({
    type: "quote",
    data: { text, caption },
  }),

  code: (code: string = "") => ({
    type: "code",
    data: { code },
  }),

  table: (content: string[][] = [["", ""]], withHeadings: boolean = false) => ({
    type: "table",
    data: { content, withHeadings },
  }),

  delimiter: () => ({
    type: "delimiter",
    data: {},
  }),
};

// Common template patterns
export const templatePatterns = {
  // Header + Paragraph combination
  section: (title: string, content: string = "", level: 1 | 2 | 3 | 4 = 3) => [
    templateBlocks.header(title, level),
    templateBlocks.paragraph(content),
  ],

  // Header + Checklist combination
  todoSection: (
    title: string,
    items: Array<{ text: string; checked: boolean }> = [],
  ) => [templateBlocks.header(title, 3), templateBlocks.checklist(items)],

  // Header + List combination
  listSection: (
    title: string,
    items: string[] = [],
    style: "ordered" | "unordered" = "unordered",
  ) => [templateBlocks.header(title, 3), templateBlocks.list(items, style)],

  // Daily template pattern
  dailyEntry: (day: string) => [
    templateBlocks.header(day, 3),
    templateBlocks.checklist([]),
  ],

  // Meeting section pattern
  meetingSection: (sectionTitle: string, withList: boolean = false) => [
    templateBlocks.header(sectionTitle, 3),
    withList
      ? templateBlocks.list([""], "unordered")
      : templateBlocks.paragraph(""),
  ],

  // Cornell notes pattern
  cornellSection: (leftTitle: string, rightTitle: string) =>
    templateBlocks.table(
      [
        [leftTitle, rightTitle],
        ["", ""],
        ["", ""],
      ],
      true,
    ),
};

// Week day names in Bengali
const weekDays = [
  "শনিবার",
  "রবিবার",
  "সোমবার",
  "মঙ্গলবার",
  "বুধবার",
  "বৃহস্পতিবার",
  "শুক্রবার",
];

// Template generators
export const templateGenerators = {
  // Generate weekly planner structure
  weeklyPlanner: () => {
    const blocks: any[] = [
      templateBlocks.header("সপ্তাহের লক্ষ্য:", 2),
      templateBlocks.paragraph("এই সপ্তাহের প্রধান লক্ষ্য লিখুন।"),
    ];

    weekDays.forEach((day) => {
      blocks.push(...templatePatterns.dailyEntry(day));
    });

    return blocks;
  },

  // Generate meeting template
  meetingTemplate: () => [
    templateBlocks.header("মিটিং নোটস", 1),
    templateBlocks.header("তারিখ ও সময়:", 2),
    templateBlocks.paragraph(""),
    templateBlocks.header("এজেন্ডা:", 3),
    templateBlocks.paragraph("এখানে মিটিংয়ের এজেন্ডা লিখুন।"),
    templateBlocks.header("অংশগ্রহণকারী:", 3),
    templateBlocks.list([""], "unordered"),
    templateBlocks.header("আলোচ্য বিষয়:", 3),
    templateBlocks.paragraph("এখানে আলোচনার মূল পয়েন্ট লিখুন।"),
    templateBlocks.header("সিদ্ধান্ত:", 3),
    templateBlocks.list([""], "ordered"),
    templateBlocks.header("করণীয়:", 3),
    templateBlocks.checklist([{ text: "", checked: false }]),
  ],

  // Generate project plan template
  projectPlan: () => [
    templateBlocks.header("প্রজেক্টের নাম:", 2),
    templateBlocks.paragraph(""),
    templateBlocks.header("লক্ষ্য:", 3),
    templateBlocks.paragraph("প্রজেক্টের মূল লক্ষ্য কী?"),
    templateBlocks.header("প্রধান ধাপ:", 3),
    templateBlocks.list([], "ordered"),
    templateBlocks.header("করণীয় তালিকা:", 3),
    templateBlocks.checklist([]),
    templateBlocks.header("ডেডলাইন:", 4),
    templateBlocks.paragraph(""),
  ],

  // Generate daily journal template
  dailyJournal: () => [
    templateBlocks.header("দৈনিক জার্নাল", 1),
    templateBlocks.header("আজকের তারিখ:", 2),
    templateBlocks.paragraph(""),
    templateBlocks.header("আজকের সেরা মুহূর্ত:", 3),
    templateBlocks.paragraph(""),
    templateBlocks.header("আজ কী শিখলাম:", 3),
    templateBlocks.paragraph(""),
    templateBlocks.header("আগামীকালের পরিকল্পনা:", 3),
    templateBlocks.checklist([]),
  ],

  // Generate book review template
  bookReview: () => [
    templateBlocks.header("বই রিভিউ", 1),
    templateBlocks.header("বইয়ের নাম:", 2),
    templateBlocks.paragraph(""),
    templateBlocks.header("লেখকের নাম:", 3),
    templateBlocks.paragraph(""),
    templateBlocks.header("সারাংশ:", 4),
    templateBlocks.paragraph(""),
    templateBlocks.header("মতামত:", 4),
    templateBlocks.paragraph(""),
    templateBlocks.header("রেটিং (১-৫):", 4),
    templateBlocks.paragraph(""),
  ],

  // Generate todo list template
  todoList: () => [
    templateBlocks.header("আজকের করণীয়", 2),
    templateBlocks.checklist([
      { text: "গুরুত্বপূর্ণ কাজ ১", checked: false },
      { text: "গুরুত্বপূর্ণ কাজ ২", checked: false },
      { text: "অন্যান্য কাজ", checked: false },
    ]),
    templateBlocks.header("সম্পন্ন", 3),
    templateBlocks.checklist([{ text: "সম্পন্ন কাজ", checked: true }]),
  ],

  // Generate brainstorming template
  brainstorming: () => [
    templateBlocks.header("মূল ধারণা:", 2),
    templateBlocks.paragraph("আপনার মূল ধারণা বা সমস্যাটি বর্ণনা করুন।"),
    templateBlocks.header("কী পয়েন্ট:", 3),
    templateBlocks.list([], "unordered"),
    templateBlocks.header("সম্ভাব্য সমাধান:", 3),
    templateBlocks.list([], "unordered"),
    templateBlocks.header("পরবর্তী পদক্ষেপ:", 3),
    templateBlocks.checklist([]),
  ],

  // Generate Cornell notes template
  cornellNotes: () => [
    templateBlocks.header("বিষয় এবং তারিখ:", 2),
    templateBlocks.paragraph(""),
    templatePatterns.cornellSection("মূল প্রশ্ন/কীওয়ার্ড", "মূল নোট"),
    templateBlocks.header("সারাংশ:", 3),
    templateBlocks.paragraph("নোট পর্যালোচনা করে এখানে একটি সারাংশ লিখুন।"),
  ],
};

// Template builder function
export function createTemplate(
  id: string,
  title: string,
  description: string,
  icon: string,
  generatorName: keyof typeof templateGenerators,
): {
  id: string;
  title: string;
  description: string;
  icon: string;
  content: EditorOutputData;
} {
  const now = Date.now();
  const version = "2.30.8";

  return {
    id,
    title,
    description,
    icon,
    content: {
      time: now,
      version,
      blocks: templateGenerators[generatorName](),
    },
  };
}

// Quick template builders for common patterns
export const quickTemplates = {
  emptyNote: (): EditorOutputData => ({
    time: Date.now(),
    version: "2.30.8",
    blocks: [templateBlocks.paragraph("")],
  }),

  simpleList: (title: string, items: string[] = []): EditorOutputData => ({
    time: Date.now(),
    version: "2.30.8",
    blocks: [
      templateBlocks.header(title, 2),
      templateBlocks.list(items, "unordered"),
    ],
  }),

  simpleTodo: (title: string, tasks: string[] = []): EditorOutputData => ({
    time: Date.now(),
    version: "2.30.8",
    blocks: [
      templateBlocks.header(title, 2),
      templateBlocks.checklist(
        tasks.map((task) => ({ text: task, checked: false })),
      ),
    ],
  }),

  quickNote: (title: string, content: string = ""): EditorOutputData => ({
    time: Date.now(),
    version: "2.30.8",
    blocks: [
      templateBlocks.header(title, 2),
      templateBlocks.paragraph(content),
    ],
  }),
};
