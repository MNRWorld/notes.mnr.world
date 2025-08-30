"use client";

import { get, set, del, keys, setMany, getMany } from "idb-keyval";
import type {
  Note,
  EditorOutputData,
  BlockToolData,
  CustomTemplate,
} from "./types";
import { getTextFromEditorJS, sanitizeFileName } from "./utils";
import { Capacitor } from "@capacitor/core";
import { Share } from "@capacitor/share";

const MAX_HISTORY_LENGTH = 20;

export const createNote = async (): Promise<Note> => {
  const id = `note_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const newNote: Note = {
    id,
    title: "শিরোনামহীন নোট",
    content: {
      time: Date.now(),
      blocks: [],
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
  return notes
    .filter((note) => !note.isArchived && !note.isTrashed)
    .sort((a, b) => b.updatedAt - a.updatedAt);
};

export const getArchivedNotes = async (): Promise<Note[]> => {
  const allKeys = (await keys()) as string[];
  const noteKeys = allKeys.filter((key) => key.startsWith("note_"));
  if (noteKeys.length === 0) return [];
  const notes = (await getMany<Note>(noteKeys)).filter(
    (note): note is Note => !!note,
  );
  return notes
    .filter((note) => note.isArchived)
    .sort((a, b) => b.updatedAt - a.updatedAt);
};

export const getTrashedNotes = async (): Promise<Note[]> => {
  const allKeys = (await keys()) as string[];
  const noteKeys = allKeys.filter((key) => key.startsWith("note_"));
  if (noteKeys.length === 0) return [];
  const notes = (await getMany<Note>(noteKeys)).filter(
    (note): note is Note => !!note,
  );
  return notes
    .filter((note) => note.isTrashed)
    .sort((a, b) => b.updatedAt - a.updatedAt);
};

export const updateNote = async (
  id: string,
  updates: Partial<Omit<Note, "id">>,
  originalNote?: Note,
): Promise<void> => {
  const note = originalNote ?? (await get<Note>(id));
  if (note) {
    let newHistory = note.history || [];

    if (
      updates.content &&
      JSON.stringify(updates.content) !== JSON.stringify(note.content)
    ) {
      newHistory = [
        { content: note.content, updatedAt: note.updatedAt },
        ...newHistory,
      ].slice(0, MAX_HISTORY_LENGTH);
    }

    if (updates.content) {
      updates.charCount = getTextFromEditorJS(updates.content).length;
    }

    const updatedNote: Note = {
      ...note,
      ...updates,
      updatedAt: Date.now(),
      history: newHistory,
    };
    await set(id, updatedNote);
  }
};

export const setManyNotes = async (
  entries: [IDBValidKey, Note][],
): Promise<void> => {
  await setMany(entries);
};

export const archiveNote = async (id: string): Promise<void> => {
  await updateNote(id, { isArchived: true, isPinned: false });
};

export const unarchiveNote = async (id: string): Promise<void> => {
  await updateNote(id, { isArchived: false });
};

export const trashNote = async (id: string): Promise<void> => {
  await updateNote(id, { isTrashed: true, isPinned: false });
};

export const restoreNote = async (id: string): Promise<void> => {
  await updateNote(id, { isTrashed: false });
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
        const jsonString = event.target?.result as string;
        const data = JSON.parse(jsonString);

        const notesToImport = Array.isArray(data) ? data : data.notes || [];

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
  const [{ default: jsPDF }, { default: html2canvas }, { default: EditorJS }] =
    await Promise.all([
      import("jspdf"),
      import("html2canvas"),
      import("@editorjs/editorjs"),
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

  const tempEditor = new EditorJS({
    holder: editorHolder,
    data: note.content,
    readOnly: true,
  });

  await tempEditor.isReady;

  const canvas = await html2canvas(printableElement, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
  });

  document.body.removeChild(printableElement);
  tempEditor.destroy();

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  const ratio = canvasWidth / pdfWidth;
  const imgHeight = canvasHeight / ratio;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
  heightLeft -= pdfHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;
  }

  return pdf.output("blob");
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

  let markdown = "";
  notesArray.forEach((n) => {
    markdown += `# ${n.title || "শিরোনামহীন নোট"}\n\n`;
    if (n.content && n.content.blocks) {
      n.content.blocks.forEach((block) => {
        const blockData = block.data as BlockToolData;
        switch (block.type) {
          case "header":
            if (blockData.text) {
              markdown += `${"#".repeat(blockData.level)} ${
                blockData.text
              }\n\n`;
            }
            break;
          case "paragraph":
            if (blockData.text) {
              markdown += `${blockData.text.replace(/&nbsp;/g, " ")}\n\n`;
            }
            break;
          case "list":
            if (blockData.items) {
              const prefix = blockData.style === "ordered" ? "1." : "-";
              markdown +=
                blockData.items
                  .map((item: string) => `${prefix} ${item}`)
                  .join("\n") + "\n\n";
            }
            break;
          case "quote":
            if (blockData.text) {
              markdown += `> ${blockData.text}\n\n`;
            }
            break;
          case "checklist":
            if (blockData.items) {
              markdown +=
                blockData.items
                  .map(
                    (item: { text: string; checked: boolean }) =>
                      `- [${item.checked ? "x" : " "}] ${item.text}`,
                  )
                  .join("\n") + "\n\n";
            }
            break;
          case "code":
            if (blockData.code) {
              markdown += "```\n" + blockData.code + "```\n\n";
            }
            break;
          case "table":
            if (blockData.content) {
              const header = blockData.withHeadings
                ? `| ${blockData.content[0].join(" | ")} |\n| ${blockData.content[0]
                    .map(() => "---")
                    .join(" | ")} |\n`
                : "";
              const body = (
                blockData.withHeadings
                  ? blockData.content.slice(1)
                  : blockData.content
              )
                .map((row: string[]) => `| ${row.join(" | ")} |`)
                .join("\n");
              markdown += header + body + "\n\n";
            }
            break;
          default:
            break;
        }
      });
    }
    markdown += "\n\n---\n\n";
  });
  return markdown;
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
