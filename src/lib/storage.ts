"use client";

import { get, set, del, keys, setMany, getMany } from "idb-keyval";
import type {
  Note,
  EditorOutputData,
  BlockToolData,
  CustomTemplate,
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
    const timeSinceLastUpdate = now - (note.history?.[0]?.updatedAt || note.createdAt);

    if (
      hasContentChanged &&
      timeSinceLastUpdate > ONE_DAY_IN_MS &&
      typeof note.content === "object"
    ) {
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

    if (typeof updates.content === 'object' && updates.content) {
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
              icon: noteData.icon || "",
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
  if (typeof note.content === 'string') {
    throw new Error("Cannot export an encrypted note to PDF.");
  }
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
      .map((n) =>
        typeof n.content === "object" ? getTextFromEditorJS(n.content) : "",
      )
      .join("\n\n---\n\n");
  }

  return notesArray
    .map((n) =>
      typeof n.content === "object" ? MarkdownConverter.toMarkdown(n.content) : "",
    )
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
  if (typeof note.content === 'string') {
    throw new Error("Cannot create a template from an encrypted note.");
  }
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

// createDemoNotes removed as demo content is no longer desired.
