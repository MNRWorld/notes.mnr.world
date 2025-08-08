"use client";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Quote from "@editorjs/quote";
import InlineCode from "@editorjs/inline-code";
import Checklist from "@editorjs/checklist";

export const EDITOR_TOOLS = {
  header: {
    class: Header,
    shortcut: 'CMD+SHIFT+H',
    inlineToolbar: true,
  },
  list: {
    class: List,
    inlineToolbar: true,
  },
  checklist: {
    class: Checklist,
    inlineToolbar: true,
  },
  quote: {
    class: Quote,
    inlineToolbar: true,
  },
  inlineCode: {
    class: InlineCode,
    shortcut: 'CMD+SHIFT+C',
  },
} as const;
