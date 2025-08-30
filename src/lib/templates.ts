import { EditorOutputData } from "./types";

export interface NoteTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  content: EditorOutputData;
}

const now = Date.now();
const version = "2.29.1";

export const templates: NoteTemplate[] = [
  {
    id: "template_meeting",
    title: "মিটিং নোট",
    description: "মিটিংয়ের গুরুত্বপূর্ণ বিষয় নোট করুন।",
    icon: "Briefcase",
    content: {
      time: now,
      version,
      blocks: [
        {
          type: "header",
          data: { text: "মিটিংয়ের বিষয়:", level: 2 },
        },
        {
          type: "paragraph",
          data: { text: "এখানে মিটিংয়ের এজেন্ডা লিখুন।" },
        },
        {
          type: "header",
          data: { text: "অংশগ্রহণকারী:", level: 3 },
        },
        { type: "list", data: { style: "unordered", items: [""] } },
        {
          type: "header",
          data: { text: "আলোচ্য বিষয়:", level: 3 },
        },
        {
          type: "paragraph",
          data: { text: "এখানে আলোচনার মূল পয়েন্ট লিখুন।" },
        },
        {
          type: "header",
          data: { text: "সিদ্ধান্ত:", level: 3 },
        },
        { type: "list", data: { style: "ordered", items: [""] } },
        {
          type: "header",
          data: { text: "করণীয়:", level: 3 },
        },
        {
          type: "checklist",
          data: { items: [{ text: "", checked: false }] },
        },
      ],
    },
  },
  {
    id: "template_daily_journal",
    title: "দৈনিক জার্নাল",
    description: "প্রতিদিনের চিন্তা ও অভিজ্ঞতা লিখে রাখুন।",
    icon: "Feather",
    content: {
      time: now,
      version,
      blocks: [
        {
          type: "header",
          data: { text: "আজকের তারিখ:", level: 2 },
        },
        {
          type: "header",
          data: { text: "আজকের সেরা মুহূর্ত:", level: 3 },
        },
        {
          type: "paragraph",
          data: { text: "" },
        },
        {
          type: "header",
          data: { text: "আজ কী শিখলাম:", level: 3 },
        },
        {
          type: "paragraph",
          data: { text: "" },
        },
        {
          type: "header",
          data: { text: "আগামীকালের পরিকল্পনা:", level: 3 },
        },
        { type: "checklist", data: { items: [] } },
      ],
    },
  },
  {
    id: "template_project_plan",
    title: "প্রজেক্ট প্ল্যান",
    description: "আপনার নতুন প্রজেক্টের পরিকল্পনা করুন।",
    icon: "CheckSquare",
    content: {
      time: now,
      version,
      blocks: [
        {
          type: "header",
          data: { text: "প্রজেক্টের নাম:", level: 2 },
        },
        {
          type: "header",
          data: { text: "লক্ষ্য:", level: 3 },
        },
        {
          type: "paragraph",
          data: { text: "প্রজেক্টের মূল লক্ষ্য কী?" },
        },
        {
          type: "header",
          data: { text: "প্রধান ধাপ (Milestones):", level: 3 },
        },
        { type: "list", data: { style: "ordered", items: [] } },
        {
          type: "header",
          data: { text: "করণীয় তালিকা:", level: 3 },
        },
        {
          type: "checklist",
          data: { items: [] },
        },
        {
          type: "header",
          data: { text: "ডেডলাইন:", level: 4 },
        },
        {
          type: "paragraph",
          data: { text: "" },
        },
      ],
    },
  },
  {
    id: "template_book_review",
    title: "বই রিভিউ",
    description: "পঠিত বইয়ের রিভিউ ও মতামত গুছিয়ে লিখুন।",
    icon: "Book",
    content: {
      time: now,
      version,
      blocks: [
        {
          type: "header",
          data: { text: "বইয়ের নাম:", level: 2 },
        },
        {
          type: "header",
          data: { text: "লেখকের নাম:", level: 3 },
        },
        {
          type: "header",
          data: { text: "সারাংশ:", level: 4 },
        },
        {
          type: "paragraph",
          data: { text: "" },
        },
        {
          type: "header",
          data: { text: "মতামত:", level: 4 },
        },
        {
          type: "paragraph",
          data: { text: "" },
        },
        {
          type: "header",
          data: { text: "রেটিং (১-৫):", level: 4 },
        },
        {
          type: "paragraph",
          data: { text: "" },
        },
      ],
    },
  },
  {
    id: "template_todo_list",
    title: "করণীয় তালিকা",
    description: "আপনার কাজগুলো সংগঠিত করুন।",
    icon: "ListTodo",
    content: {
      time: now,
      version,
      blocks: [
        {
          type: "header",
          data: { text: "আজকের করণীয়", level: 2 },
        },
        {
          type: "checklist",
          data: {
            items: [
              { text: "গুরুত্বপূর্ণ কাজ ১", checked: false },
              { text: "গুরুত্বপূর্ণ কাজ ২", checked: false },
              { text: "অন্যান্য কাজ", checked: false },
            ],
          },
        },
        {
          type: "header",
          data: { text: "সম্পন্ন", level: 3 },
        },
        {
          type: "checklist",
          data: {
            items: [{ text: "সম্পন্ন কাজ", checked: true }],
          },
        },
      ],
    },
  },
  {
    id: "template_weekly_planner",
    title: "সাপ্তাহিক পরিকল্পনা",
    description: "আপনার সপ্তাহের কাজ ও লক্ষ্য পরিকল্পনা করুন।",
    icon: "Calendar",
    content: {
      time: now,
      version,
      blocks: [
        {
          type: "header",
          data: { text: "সপ্তাহের লক্ষ্য:", level: 2 },
        },
        {
          type: "paragraph",
          data: { text: "এই সপ্তাহের প্রধান লক্ষ্য লিখুন।" },
        },
        { type: "header", data: { text: "শনিবার", level: 3 } },
        { type: "checklist", data: { items: [] } },
        { type: "header", data: { text: "রবিবার", level: 3 } },
        { type: "checklist", data: { items: [] } },
        { type: "header", data: { text: "সোমবার", level: 3 } },
        { type: "checklist", data: { items: [] } },
        { type: "header", data: { text: "মঙ্গলবার", level: 3 } },
        { type: "checklist", data: { items: [] } },
        { type: "header", data: { text: "বুধবার", level: 3 } },
        { type: "checklist", data: { items: [] } },
        { type: "header", data: { text: "বৃহস্পতিবার", level: 3 } },
        { type: "checklist", data: { items: [] } },
        { type: "header", data: { text: "শুক্রবার", level: 3 } },
        { type: "checklist", data: { items: [] } },
      ],
    },
  },
  {
    id: "template_brainstorming",
    title: "ব্রেইনস্টর্মিং",
    description: "আপনার নতুন আইডিয়া দ্রুত নোট করুন।",
    icon: "BrainCircuit",
    content: {
      time: now,
      version,
      blocks: [
        {
          type: "header",
          data: { text: "মূল ধারণা:", level: 2 },
        },
        {
          type: "paragraph",
          data: { text: "আপনার মূল ধারণা বা সমস্যাটি বর্ণনা করুন।" },
        },
        {
          type: "header",
          data: { text: "কী পয়েন্ট:", level: 3 },
        },
        { type: "list", data: { style: "unordered", items: [] } },
        {
          type: "header",
          data: { text: "সম্ভাব্য সমাধান:", level: 3 },
        },
        { type: "list", data: { style: "unordered", items: [] } },
        {
          type: "header",
          data: { text: "পরবর্তী পদক্ষেপ:", level: 3 },
        },
        { type: "checklist", data: { items: [] } },
      ],
    },
  },
  {
    id: "template_cornell_notes",
    title: "কর্নেল নোটস",
    description: "কার্যকর নোট গ্রহণ ও পর্যালোচনার জন্য।",
    icon: "NotebookText",
    content: {
      time: now,
      version,
      blocks: [
        {
          type: "header",
          data: { text: "বিষয় এবং তারিখ:", level: 2 },
        },
        {
          type: "paragraph",
          data: { text: "" },
        },
        {
          type: "table",
          data: {
            withHeadings: true,
            content: [
              ["মূল প্রশ্ন/কীওয়ার্ড", "মূল নোট"],
              ["", ""],
              ["", ""],
            ],
          },
        },
        {
          type: "header",
          data: { text: "সারাংশ:", level: 3 },
        },
        {
          type: "paragraph",
          data: {
            text: "নোট পর্যালোচনা করে এখানে একটি সারাংশ লিখুন।",
          },
        },
      ],
    },
  },
];
