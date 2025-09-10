import { Note } from "./types";
import { getCurrentBengaliDate } from "./bengali-calendar";

const now = Date.now();

export const welcomeNote: Note = {
  id: "note_welcome",
  title: "🚀 আমার নোট 3.0 - স্মার্ট নোট-টেকিং এর নতুন যুগ",
  content: {
    time: now,
    version: "3.0.0",
    blocks: [
      {
        id: "block_welcome_intro",
        type: "paragraph",
        data: {
          text: "🎉 আমার নোট এর সবচেয়ে শক্তিশালী আপডেটে স্বাগতম! এই সংস্করণে রয়েছে ৯টি বিপ্লবী নতুন ফিচার যা আপনার নোট-টেকিং অভিজ্ঞতাকে সম্পূর্ণ নতুন মাত্রায় নিয়ে যাবে।",
        },
      },
      {
        id: "block_new_features_title",
        type: "header",
        data: {
          text: "🌟 নতুন স্মার্ট ফিচারসমূহ",
          level: 2,
        },
      },
      {
        id: "block_enhanced_features",
        type: "checklist",
        data: {
          items: [
            {
              text: "🎨 ড্রয়িং টুলস - ক্যানভাস-ভিত্তিক স্কেচিং ও অঙ্কন",
              checked: true,
            },
            // Math tool removed
            {
              text: "📝 মার্কডাউন এক্সপোর্ট/ইম্পোর্ট - সম্পূর্ণ ইন্টারঅপারেবিলিটি",
              checked: true,
            },
            {
              text: "📅 বাংলা ক্যালেন্ডার - আঞ্চলিক তারিখ ব্যবস্থা",
              checked: true,
            },
            {
              text: "🔄 ভার্সন কন্ট্রোল - Git-এর মতো ভার্সনিং সিস্টেম",
              checked: true,
            },
            { text: "📱 PWA - প্রগ্রেসিভ ওয়েব অ্যাপ সুবিধা", checked: true },
            { text: "🔒 প্রাইভেসি মোড - গোপনীয় নোট তৈরি", checked: true },
            {
              text: "✅ টাস্ক ম্যানেজমেন্ট - নোট থেকে কাজের তালিকা",
              checked: true,
            },
          ],
        },
      },
      {
        id: "block_ai_features",
        type: "header",
        data: {
          text: "🤖 AI-চালিত স্মার্ট ফিচার",
          level: 2,
        },
      },
      {
        id: "block_ai_capabilities",
        type: "list",
        data: {
          style: "unordered",
          items: [
            "mnrAI সহায়ক - Google Gemini AI দিয়ে তাৎক্ষণিক উত্তর",
            "স্মার্ট টেমপ্লেট - বিভিন্ন ধরনের নোটের জন্য পূর্ব-প্রস্তুত কাঠামো",
            "স্বয়ংক্রিয় টাস্ক এক্সট্র্যাকশন - চেকলিস্ট থেকে টাস্ক তৈরি",
            "স্মার্ট ট্যাগিং সিস্টেম - নোট সংগঠিত করার উন্নত পদ্ধতি",
          ],
        },
      },
      {
        id: "block_getting_started",
        type: "header",
        data: {
          text: "🎯 কীভাবে শুরু করবেন",
          level: 2,
        },
      },
      {
        id: "block_quick_start",
        type: "paragraph",
        data: {
          text: "নতুন ফিচারগুলো দেখতে <strong>'ডেমো নোট'</strong> বাটনে ক্লিক করুন। গোপনীয় নোট তৈরি করতে হেডারে <strong>'গোপনীয় নোট'</strong> বাটন ব্যবহার করুন।",
        },
      },
      // Math example removed because the Math tool was removed
      {
        id: "block_features_demo",
        type: "paragraph",
        data: {
          text: "এই নোটটিতেই দেখুন - বাংলা ক্যালেন্ডার তারিখ, ভার্সন হিস্টোরি, এবং স্বয়ংক্রিয় টাস্ক এক্সট্র্যাকশন কিভাবে কাজ করে!",
        },
      },
      {
        id: "block_support",
        type: "quote",
        data: {
          text: "আমার নোট 3.0 দিয়ে আপনার সৃজনশীলতাকে নতুন উচ্চতায় নিয়ে যান। প্রতিটি ফিচার বাংলা ভাষাভাষী ব্যবহারকারীদের কথা মাথায় রেখে ডিজাইন করা হয়েছে।",
          caption: "উন্নয়ন টিম",
          alignment: "left",
        },
      },
    ],
  },
  createdAt: now,
  updatedAt: now,
  charCount: 850,
  history: [
    {
      content: {
        time: now - 7200000, // 2 hours ago
        version: "2.29.1",
        blocks: [
          {
            id: "block_old_version",
            type: "paragraph",
            data: { text: "আমার নোট-এ স্বাগতম ✨ - পুরানো সংস্করণ" },
          },
        ],
      },
      updatedAt: now - 7200000,
      version: "v2.29.1",
      message: "পুরানো ওয়েলকাম নোট",
    },
    {
      content: {
        time: now - 3600000, // 1 hour ago
        version: "2.30.0",
        blocks: [
          {
            id: "block_beta_version",
            type: "paragraph",
            data: { text: "বেটা ভার্সনে নতুন ফিচার যোগ করা হচ্ছে..." },
          },
        ],
      },
      updatedAt: now - 3600000,
      version: "v2.30.0",
      message: "বেটা আপডেট",
    },
  ],
  tags: ["স্বাগতম", "নতুন-ফিচার", "গাইড", "v3.0", "AI", "স্মার্ট"],
  isPinned: true,
  isLocked: false,
  isArchived: false,
  isTrashed: false,
  icon: "Sparkles",
  tasks: [
    {
      id: "task_explore_drawing",
      title: "ড্রয়িং টুলস পরীক্ষা করুন",
      completed: false,
      priority: "high",
      createdAt: now,
      dueDate: now + 7 * 24 * 60 * 60 * 1000, // 7 days from now
    },
    // Math task removed because Math tool was removed
    {
      id: "task_privacy_mode",
      title: "গোপনীয় নোট তৈরি করুন",
      completed: false,
      priority: "medium",
      createdAt: now,
    },
    {
      id: "task_explore_templates",
      title: "স্মার্ট টেমপ্লেট দেখুন",
      completed: false,
      priority: "low",
      createdAt: now,
    },
  ],
  isAnonymous: false,
  bengaliDate: getCurrentBengaliDate(),
  version: "v3.0.0",
};
