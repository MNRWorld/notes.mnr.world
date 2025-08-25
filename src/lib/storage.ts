"use client";

import { Note } from "./types";
import { get, set, del, keys, setMany, getMany } from "idb-keyval";
import type { OutputData, BlockToolData } from "@editorjs/editorjs";
import { getTextFromEditorJS, sanitizeFileName } from "./utils";
import { Capacitor } from "@capacitor/core";
import { Share } from "@capacitor/share";
import { toast } from "sonner";
import jsPDF from "jspdf";

const MAX_HISTORY_LENGTH = 20;

const getDefaultContent = (): OutputData => ({
  time: Date.now(),
  blocks: [],
  version: "2.29.1",
});

export const createNote = async (): Promise<Note> => {
  const id = `note_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const newContent = getDefaultContent();
  const title = getNoteTitle(newContent);

  const newNote: Note = {
    id,
    title: title,
    content: newContent,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    charCount: 0,
    isArchived: false,
    history: [],
    tags: [],
    isPinned: false,
    isLocked: false,
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
  return notes.sort((a, b) => b.updatedAt - a.updatedAt);
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

export const updateNote = async (
  id: string,
  updates: Partial<Omit<Note, "id">>,
): Promise<void> => {
  const note = await get<Note>(id);
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

export const deleteNotePermanently = async (id: string): Promise<void> => {
  await del(id);
};

export const clearAllNotes = async (): Promise<void> => {
  const allKeys = (await keys()) as string[];
  const noteKeys = allKeys.filter((key) => key.startsWith("note_"));
  for (const key of noteKeys) {
    await del(key);
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

export const getNoteTitle = (data: OutputData): string => {
  if (data.blocks.length === 0) {
    return "শিরোনামহীন নোট";
  }
  const firstBlock = data.blocks[0];
  if (firstBlock && firstBlock.type === "header") {
    return (
      firstBlock.data.text.replace(/<[^>]+>/g, "").trim() || "শিরোনামহীন নোট"
    );
  }
  return "শিরোনামহীন নোট";
};

const exportNoteToPdf = (note: Note) => {
  const doc = new jsPDF();
  const margin = 15;
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = margin;

  const addText = (text: string, options: { fontSize?: number }) => {
    const lines = doc.splitTextToSize(
      text,
      doc.internal.pageSize.getWidth() - margin * 2,
    );
    lines.forEach((line: string) => {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += (options.fontSize || 10) * 0.5;
    });
    y += 5;
  };

  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  addText(note.title, { fontSize: 22 });

  note.content.blocks.forEach((block) => {
    const blockData = block.data as BlockToolData;
    switch (block.type) {
      case "header":
        doc.setFontSize(16 + (4 - blockData.level));
        doc.setFont("helvetica", "bold");
        addText(blockData.text.replace(/<[^>]+>/g, ""), {
          fontSize: 16 + (4 - blockData.level),
        });
        break;
      case "paragraph":
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        addText(blockData.text.replace(/<[^>]+>/g, ""), { fontSize: 12 });
        break;
      case "list":
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        blockData.items.forEach((item: string, index: number) => {
          const prefix =
            blockData.style === "ordered" ? `${index + 1}. ` : "- ";
          addText(prefix + item.replace(/<[^>]+>/g, ""), { fontSize: 12 });
        });
        y += 5;
        break;
      case "quote":
        doc.setFontSize(12);
        doc.setFont("helvetica", "italic");
        addText(`> ${blockData.text.replace(/<[^>]+>/g, "")}`, {
          fontSize: 12,
        });
        break;
      case "checklist":
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        blockData.items.forEach((item: { text: string; checked: boolean }) => {
          const prefix = item.checked ? "[x] " : "[ ] ";
          addText(prefix + item.text, { fontSize: 12 });
        });
        y += 5;
        break;
    }
  });

  return doc.output("blob");
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
    markdown += `# ${n.title}\n\n`;
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
              markdown += "```\n" + blockData.code + "\n```\n\n";
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
  const title = isBulk ? "সমস্ত নোট" : note.title;

  if (!note || (isBulk && note.length === 0)) {
    toast.error("শেয়ার করার জন্য কোনো নোট খুঁজে পাওয়া যায়নি।");
    return;
  }

  if (isBulk && format === "pdf") {
    toast.error("একাধিক নোট একসাথে PDF হিসাবে এক্সপোর্ট করা যাবে না।");
    return;
  }

  try {
    const isNative = Capacitor.isNativePlatform();

    if (format === "pdf") {
      if (isBulk) {
        toast.error("একাধিক নোট একসাথে PDF হিসাবে এক্সপোর্ট করা যাবে না।");
        return;
      }
      const pdfBlob = exportNoteToPdf(note as Note);
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
  } catch (err) {
    if (err instanceof Error) {
      console.error("Share/Download Error:", err);
      toast.error(`নোট শেয়ার/ডাউনলোড করতে ব্যর্থ হয়েছে: ${err.message}`);
    } else {
      console.error("Share/Download Error:", err);
      toast.error("একটি অজানা কারণে নোট শেয়ার/ডাউনলোড করতে ব্যর্থ হয়েছে।");
    }
  }
};
