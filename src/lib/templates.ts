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
    description: "মিটিংয়ের গুরুত্বপূর্ণ বিষয়গুলো সহজে নোট করুন।",
    icon: "Briefcase",
    content: {
      time: now,
      version,
      blocks: [
        {
          type: "header",
          data: { text: "মিটিং-এর বিষয়:", level: 2 },
        },
        {
          type: "paragraph",
          data: { text: "এখানে মিটিংয়ের মূল এজেন্ডা লিখুন।" },
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
          data: { text: "এখানে আলোচনার মূল পয়েন্টগুলো লিখুন।" },
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
    description: "প্রতিদিনের চিন্তা, অনুভূতি ও অভিজ্ঞতা লিখে রাখুন।",
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
          data: { text: "আগামীকালের জন্য পরিকল্পনা:", level: 3 },
        },
        { type: "checklist", data: { items: [] } },
      ],
    },
  },
  {
    id: "template_project_plan",
    title: "প্রজেক্ট প্ল্যান",
    description: "আপনার নতুন প্রজেক্টের পরিকল্পনা স্ট্রাকচার করুন।",
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
          data: { text: "এই প্রজেক্টের মূল লক্ষ্য কী?" },
        },
        {
          type: "header",
          data: { text: "প্রধান ধাপসমূহ (Milestones):", level: 3 },
        },
        { type: "list", data: { style: "ordered", items: [] } },
        {
          type: "header",
          data: { text: "করণীয় (To-Do List):", level: 3 },
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
    description: "পঠিত বইয়ের রিভিউ এবং ব্যক্তিগত মতামত গুছিয়ে লিখুন।",
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
          data: { text: "আমার মতামত:", level: 4 },
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
];
