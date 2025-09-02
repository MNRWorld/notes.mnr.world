import { createTemplate, templateGenerators } from "./template-builders";
import { EditorOutputData } from "./types";

export interface NoteTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  content: EditorOutputData;
}

// Export the template generators for external use
export {
  templateGenerators,
  templateBlocks,
  templatePatterns,
  quickTemplates,
} from "./template-builders";

export const templates: NoteTemplate[] = [
  createTemplate(
    "template_meeting",
    "মিটিং নোট",
    "মিটিংয়ের গুরুত্বপূর্ণ বিষয় নোট করুন।",
    "Briefcase",
    "meetingTemplate",
  ),
  createTemplate(
    "template_daily_journal",
    "দৈনিক জার্নাল",
    "প্রতিদিনের চিন্তা ও অভিজ্ঞতা লিখে রাখুন।",
    "Feather",
    "dailyJournal",
  ),
  createTemplate(
    "template_project_plan",
    "প্রজেক্ট প্ল্যান",
    "আপনার নতুন প্রজেক্টের পরিকল্পনা করুন।",
    "Rocket",
    "projectPlan",
  ),
  createTemplate(
    "template_book_review",
    "বই রিভিউ",
    "পঠিত বইয়ের রিভিউ ও মতামত গুছিয়ে লিখুন।",
    "Book",
    "bookReview",
  ),
  createTemplate(
    "template_todo_list",
    "করণীয় তালিকা",
    "আপনার কাজগুলো منظم করুন।",
    "ListCheck",
    "todoList",
  ),
  createTemplate(
    "template_weekly_planner",
    "সাপ্তাহিক পরিকল্পনা",
    "আপনার সপ্তাহের কাজ ও লক্ষ্য পরিকল্পনা করুন।",
    "Calendar",
    "weeklyPlanner",
  ),
  createTemplate(
    "template_brainstorming",
    "ব্রেইনস্টর্মিং",
    "আপনার নতুন আইডিয়া দ্রুত নোট করুন।",
    "Brain",
    "brainstorming",
  ),
  createTemplate(
    "template_cornell_notes",
    "কর্নেল নোটস",
    "কার্যকর নোট গ্রহণ ও পর্যালোচনার জন্য।",
    "Notebook",
    "cornellNotes",
  ),
];

// Helper function to create note from template
export const createNoteFromTemplate = (
  templateId: string,
): NoteTemplate | null => {
  return templates.find((t) => t.id === templateId) || null;
};
