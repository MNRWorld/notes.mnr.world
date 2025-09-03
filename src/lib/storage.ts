"use client";

import { get, set, del, keys, setMany, getMany } from "idb-keyval";
import type {
  Note,
  EditorOutputData,
  BlockToolData,
  CustomTemplate,
  FileAttachment,
  Task,
  BengaliDate,
} from "./types";
import { getTextFromEditorJS, sanitizeFileName } from "./utils";
import { getCurrentBengaliDate } from "./bengali-calendar";
import { TaskManager } from "./task-manager";
import { Capacitor } from "@capacitor/core";
import { Share } from "@capacitor/share";
import { MarkdownConverter } from "./markdown-converter";

const MAX_HISTORY_LENGTH = 20;
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

export const createNote = async (): Promise<Note> => {
  const id = `note_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const newNote: Note = {
    id,
    title: "শিরোনামহীন নোট",
    content: {
      time: Date.now(),
      blocks: [
        {
          type: "paragraph",
          data: {
            text: "",
          },
        },
      ],
      version: "2.29.1",
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    charCount: 0,
    isArchived: false,
    history: [],
    tags: [],
    isPinned: false,
    isLocked: false,
    isTrashed: false,
    icon: "",
    bengaliDate: getCurrentBengaliDate(),
  };
  await set(id, newNote);
  return newNote;
};

export const setNote = async (id: string, note: Note): Promise<void> => {
  await set(id, note);
};

export const getNote = async (id: string): Promise<Note | undefined> => {
  return get(id);
};

export const getNotes = async (): Promise<Note[]> => {
  const allKeys = (await keys()) as string[];
  const noteKeys = allKeys.filter((key) => key.startsWith("note_"));
  if (noteKeys.length === 0) return [];
  const notes = (await getMany<Note>(noteKeys)).filter(
    (note): note is Note => !!note,
  );
  return notes.sort((a, b) => b.updatedAt - a.updatedAt);
};

export const updateNote = async (
  id: string,
  updates: Partial<Omit<Note, "id">>,
): Promise<void> => {
  const note = await get<Note>(id);
  if (note) {
    let newHistory = note.history || [];
    const now = Date.now();

    const hasContentChanged =
      updates.content &&
      JSON.stringify(updates.content) !== JSON.stringify(note.content);
    const timeSinceLastUpdate = now - note.updatedAt;

    if (hasContentChanged && timeSinceLastUpdate > ONE_DAY_IN_MS) {
      newHistory = [
        {
          content: note.content,
          updatedAt: note.updatedAt,
          version: `v${(note.history?.length || 0) + 1}`,
          message: "Auto-saved version",
        },
        ...newHistory,
      ].slice(0, MAX_HISTORY_LENGTH);
    }

    if (updates.content) {
      updates.charCount = getTextFromEditorJS(updates.content).length;
    }

    const updatedNote: Note = {
      ...note,
      ...updates,
      updatedAt: now,
      history: newHistory,
      bengaliDate: getCurrentBengaliDate(),
    };
    await set(id, updatedNote);
  }
};

export const setManyNotes = async (
  entries: [IDBValidKey, Note][],
): Promise<void> => {
  await setMany(entries);
};

export const deleteNotePermanently = async (id: string): Promise<void> => {
  await del(id);
};

export const clearAllNotes = async (): Promise<void> => {
  try {
    const allKeys = (await keys()) as string[];
    const noteKeys = allKeys.filter((key) => key.startsWith("note_"));
    for (const key of noteKeys) {
      await del(key);
    }
  } catch (error) {
    throw error;
  }
};

export const importNotes = (file: File): Promise<Note[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const fileContent = event.target?.result as string;

        let notesToImport: Partial<Note>[] = [];

        if (file.name.endsWith(".md")) {
          const { title, content } =
            await MarkdownConverter.importFromFile(file);
          notesToImport.push({ id: `note_${Date.now()}`, title, content });
        } else if (file.name.endsWith(".json")) {
          const data = JSON.parse(fileContent);
          notesToImport = Array.isArray(data) ? data : data.notes || [];
        } else {
          throw new Error("Unsupported file format.");
        }

        if (!Array.isArray(notesToImport)) {
          throw new Error("Invalid file format.");
        }

        const validatedNotes: Note[] = [];
        for (const noteData of notesToImport) {
          if (noteData.id && noteData.content) {
            const newNote: Note = {
              id: noteData.id,
              title: noteData.title || "শিরোনামহীন নোট",
              content: noteData.content,
              createdAt: noteData.createdAt || Date.now(),
              updatedAt: noteData.updatedAt || Date.now(),
              charCount: noteData.charCount || 0,
              isArchived: noteData.isArchived || false,
              history: noteData.history || [],
              tags: noteData.tags || [],
              isPinned: noteData.isPinned || false,
              isLocked: noteData.isLocked || false,
              isTrashed: noteData.isTrashed || false,
              icon: noteData.icon || noteData.emoji || "",
            };
            validatedNotes.push(newNote);
          }
        }

        const noteEntries: [IDBValidKey, Note][] = validatedNotes.map((n) => [
          n.id,
          n,
        ]);
        await setManyNotes(noteEntries);

        resolve(validatedNotes);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};

const exportNoteToPdf = async (note: Note): Promise<Blob> => {
  const [{ PDFDocument, rgb }, domtoimage] = await Promise.all([
    import("pdf-lib"),
    import("dom-to-image").then((module) => module.default),
  ]);

  const printableElement = document.createElement("div");
  printableElement.id = "printable-note";
  printableElement.style.position = "absolute";
  printableElement.style.left = "-9999px";
  printableElement.style.width = "800px";
  printableElement.style.padding = "20px";
  printableElement.style.backgroundColor = "white";
  printableElement.style.fontFamily = "Hind Siliguri, sans-serif";

  const titleEl = document.createElement("h1");
  titleEl.innerText = note.title;
  titleEl.style.fontSize = "24px";
  titleEl.style.fontWeight = "bold";
  printableElement.appendChild(titleEl);

  const editorHolder = document.createElement("div");
  editorHolder.id = "pdf-editor-holder";
  printableElement.appendChild(editorHolder);

  document.body.appendChild(printableElement);

  const EditorJS = (await import("@editorjs/editorjs")).default;
  const tempEditor = new EditorJS({
    holder: editorHolder,
    data: note.content,
    readOnly: true,
  });

  await tempEditor.isReady;

  const imgDataUrl = await domtoimage.toPng(printableElement, {
    width: 800,
    height: printableElement.scrollHeight,
    bgcolor: "#ffffff",
  });

  document.body.removeChild(printableElement);
  tempEditor.destroy();

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);

  const imageBytes = await fetch(imgDataUrl).then((res) => res.arrayBuffer());
  const image = await pdfDoc.embedPng(imageBytes);

  const { width, height } = image.scale(0.8);
  page.drawImage(image, {
    x: 50,
    y: page.getHeight() - height - 50,
    width,
    height,
  });

  const pdfBytes = await pdfDoc.save();
  return new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
};

export const getNoteContentAsString = (
  note: Note | Note[],
  format: "md" | "json" | "txt",
): string => {
  if (format === "json") {
    return JSON.stringify(note, null, 2);
  }

  const notesArray = Array.isArray(note) ? note : [note];
  if (notesArray.length === 0) return "";

  if (format === "txt") {
    return notesArray
      .map((n) => getTextFromEditorJS(n.content))
      .join("\n\n---\n\n");
  }

  return notesArray
    .map((n) => MarkdownConverter.toMarkdown(n.content))
    .join("\n\n---\n\n");
};

export const downloadFile = async (
  fileName: string,
  content: string | Blob,
  fileType: "md" | "json" | "txt" | "pdf",
) => {
  const sanitized = sanitizeFileName(`${fileName}.${fileType}`);
  const blob =
    content instanceof Blob
      ? content
      : new Blob([content], {
          type:
            fileType === "md"
              ? "text/markdown"
              : fileType === "json"
                ? "application/json"
                : fileType === "pdf"
                  ? "application/pdf"
                  : "text/plain",
        });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.download = sanitized;
  a.href = url;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const shareNote = async (
  note: Note | Note[],
  format: "md" | "json" | "txt" | "pdf" = "md",
) => {
  const isBulk = Array.isArray(note);
  const title = isBulk ? "সমস্ত নোট" : note.title || "শিরোনামহীন নোট";

  if (!note || (isBulk && note.length === 0)) {
    return;
  }

  if (isBulk && format === "pdf") {
    return;
  }

  try {
    const isNative = Capacitor.isNativePlatform();

    if (format === "pdf") {
      if (isBulk) {
        return;
      }
      const pdfBlob = await exportNoteToPdf(note as Note);
      if (isNative) {
        const reader = new FileReader();
        reader.readAsDataURL(pdfBlob);
        reader.onloadend = async () => {
          const base64data = reader.result as string;
          await Share.share({
            title: title,
            url: base64data,
            dialogTitle: `"${title}" শেয়ার করুন`,
          });
        };
      } else {
        await downloadFile(title, pdfBlob, "pdf");
      }
    } else {
      const noteText = getNoteContentAsString(note, format);
      if (isNative) {
        await Share.share({
          title: title,
          text: noteText,
          dialogTitle: `"${title}" শেয়ার করুন`,
        });
      } else {
        await downloadFile(title, noteText, format);
      }
    }
  } catch (err) {}
};

export const createTemplateFromNote = async (
  note: Note,
): Promise<CustomTemplate> => {
  const id = `template_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 9)}`;
  const newTemplate: CustomTemplate = {
    id,
    title: note.title,
    content: note.content,
    icon: note.icon,
    createdAt: Date.now(),
  };
  await set(id, newTemplate);
  return newTemplate;
};

export const getCustomTemplates = async (): Promise<CustomTemplate[]> => {
  const allKeys = (await keys()) as string[];
  const templateKeys = allKeys.filter((key) => key.startsWith("template_"));
  if (templateKeys.length === 0) return [];
  const templates = (await getMany<CustomTemplate>(templateKeys)).filter(
    (template): template is CustomTemplate => !!template,
  );
  return templates.sort((a, b) => b.createdAt - a.createdAt);
};

export const deleteCustomTemplate = async (id: string): Promise<void> => {
  await del(id);
};

export const createDemoNotes = async (): Promise<Note[]> => {
  const now = Date.now();
  const bengaliDate = getCurrentBengaliDate();

  const demoNotes: Note[] = [
    {
      id: "demo_enhanced_features",
      title: "🚀 সব নতুন ফিচার একসাথে!",
      content: {
        time: now,
        version: "3.0.0",
        blocks: [
          {
            id: "intro_block",
            type: "header",
            data: {
              text: "আমার নোট 3.0 - সম্পূর্ণ ফিচার ডেমো",
              level: 1,
            },
          },
          {
            id: "math_demo_block",
            type: "math",
            data: {
              latex: "E = mc^2",
              caption: "গণিত টুলের উদাহরণ - আইনস্টাইনের বিখ্যাত সূত্র",
            },
          },
          {
            id: "features_checklist",
            type: "checklist",
            data: {
              items: [
                {
                  text: "🎨 ড্রয়িং টুলস - ক্যানভাস দিয়ে অঙ্কন",
                  checked: true,
                },
                { text: "📐 গণিত সূত্র - LaTeX/KaTeX সাপোর্ট", checked: true },
                { text: "📝 মার্কডাউন এক্সপোর্ট/ইম্পোর্ট", checked: true },
                { text: "📅 বাংলা ক্যালেন্ডার ইন্টিগ্রেশন", checked: true },
                { text: "🔄 ভার্সন কন্ট্রোল সিস্টেম", checked: true },
                { text: "📱 PWA (Progressive Web App)", checked: true },
                { text: "🔒 প্রাইভেসি মোড ও গোপনীয় নোট", checked: false },
                { text: "✅ স্মার্ট টাস্ক ম্যানেজমেন্ত", checked: false },
                { text: "📎 ফাইল সংযুক্তি (ছবি, PDF, অডিও)", checked: false },
              ],
            },
          },
        ],
      },
      createdAt: now - 7200000,
      updatedAt: now - 1800000,
      charCount: 450,
      history: [],
      tags: ["ডেমো", "নতুন-ফিচার", "v3.0"],
      isPinned: true,
      isLocked: false,
      isArchived: false,
      isTrashed: false,
      icon: "Sparkles",
      attachments: [
        {
          id: "demo_attachment_1",
          name: "feature_guide.pdf",
          type: "application/pdf",
          size: 156800,
          data: "data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsO4=",
          createdAt: now - 3600000,
        },
      ],
      tasks: [
        {
          id: "task_draw_sketch",
          title: "ড্রয়িং টুল দিয়ে একটি স্কেচ তৈরি করুন",
          completed: false,
          priority: "high",
          createdAt: now - 3600000,
          dueDate: now + 3 * 24 * 60 * 60 * 1000,
        },
        {
          id: "task_math_formula",
          title: "একটি জটিল গণিতের সূত্র লিখুন",
          completed: true,
          priority: "medium",
          createdAt: now - 3600000,
        },
      ],
      isAnonymous: false,
      bengaliDate: bengaliDate,
      version: "v2.1",
    },
    {
      id: "demo_privacy_features",
      title: "🔒 প্রাইভেসি ও নিরাপত্তা ডেমো",
      content: {
        time: now,
        version: "3.0.0",
        blocks: [
          {
            id: "privacy_intro",
            type: "paragraph",
            data: {
              text: "এই নোটটি <strong>গোপনীয় মোড</strong>ে তৈরি হয়েছে। আসল গোপনীয় নোট হেডারের 'গোপনীয় নোট' বাটন দিয়ে তৈরি করুন।",
            },
          },
          {
            id: "privacy_features_list",
            type: "list",
            data: {
              style: "unordered",
              items: [
                "সম্পূর্ণ অজ্ঞাতনামা নোট তৈরি",
                "ব্যক্তিগত তথ্য সংরক্ষণ করা হয় না",
                "বিশেষ এনক্রিপশন সুরক্ষা",
                "সার্চ ইনডেক্স থেকে লুকানো থাকে",
              ],
            },
          },
        ],
      },
      createdAt: now - 5400000,
      updatedAt: now - 900000,
      charCount: 280,
      history: [],
      tags: ["প্রাইভেসি", "নিরাপত্তা", "গোপনীয়", "ডেমো"],
      isPinned: false,
      isLocked: false,
      isArchived: false,
      isTrashed: false,
      icon: "ShieldCheck",
      attachments: [],
      tasks: [
        {
          id: "task_privacy_test",
          title: "একটি আসল গোপনীয় নোট তৈরি করুন",
          completed: false,
          priority: "medium",
          createdAt: now - 900000,
        },
      ],
      isAnonymous: true,
      bengaliDate: bengaliDate,
      version: "v1.0",
    },
    {
      id: "demo_calendar_tasks",
      title: "📅 বাংলা ক্যালেন্ডার ও টাস্ক ম্যানেজমেন্ত",
      content: {
        time: now,
        version: "3.0.0",
        blocks: [
          {
            id: "calendar_intro",
            type: "header",
            data: {
              text: "বাংলা তারিখ ও কাজের তালিকা",
              level: 2,
            },
          },
          {
            id: "bengali_date_info",
            type: "paragraph",
            data: {
              text: `আজকের বাংলা তারিখ: <strong>${bengaliDate.day} ${bengaliDate.monthName}, ${bengaliDate.year}</strong>`,
            },
          },
          {
            id: "task_demo_checklist",
            type: "checklist",
            data: {
              items: [
                { text: "সকালের নাস্তা", checked: true },
                { text: "অফিসের কাজ সমাপ্ত করা", checked: false },
                { text: "বিকালে ব্যায়াম", checked: false },
                { text: "রাতের খাবার প্রস্তুতি", checked: false },
              ],
            },
          },
        ],
      },
      createdAt: now - 10800000,
      updatedAt: now - 600000,
      charCount: 320,
      history: [],
      tags: ["দৈনন্দিন", "টাস্ক", "বাংলা-ক্যালেন্ডার", "ডেমো"],
      isPinned: false,
      isLocked: false,
      isArchived: false,
      isTrashed: false,
      icon: "Calendar",
      attachments: [
        {
          id: "demo_audio_note",
          name: "voice_memo.mp3",
          type: "audio/mp3",
          size: 89600,
          data: "data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAA",
          createdAt: now - 7200000,
        },
      ],
      tasks: [
        {
          id: "task_daily_1",
          title: "সকালের নাস্তা",
          completed: true,
          priority: "high",
          createdAt: now - 10800000,
        },
        {
          id: "task_daily_2",
          title: "অফিসের কাজ সমাপ্ত করা",
          completed: false,
          priority: "high",
          createdAt: now - 10800000,
          dueDate: now + 18 * 60 * 60 * 1000,
        },
      ],
      isAnonymous: false,
      bengaliDate: bengaliDate,
      version: "v1.2",
    },
  ];

  for (const note of demoNotes) {
    await set(note.id, note);
  }

  return demoNotes;
};
